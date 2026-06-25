import type { Request, Response } from 'express';
import type Stripe from 'stripe';
import { stripe } from '../config/stripe';
import { env } from '../config/env';
import { Order } from '../models/Order';
import { Product } from '../models/Product';

// Stripe webhook. Stripe POSTs events here; we VERIFY the signature against the
// raw body (proving the request genuinely came from Stripe, not a forger).
// req.body is a Buffer here because this route uses express.raw, not json.
export async function stripeWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature as string,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    // Bad signature → reject. Never trust an unverified webhook.
    res.status(400).send(`Webhook signature verification failed: ${(err as Error).message}`);
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const order = await Order.findOne({ stripePaymentIntentId: intent.id });

    // Idempotency: webhooks can be delivered more than once. Only act if the
    // order is still pending, so re-delivery doesn't decrement stock twice.
    if (order && order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
      await order.save();
      // Decrement stock for each purchased line.
      await Promise.all(
        order.items.map((it) =>
          Product.updateOne({ _id: it.product }, { $inc: { stock: -it.qty } }),
        ),
      );
    }
  }

  // Always 200 so Stripe knows we received it (and stops retrying).
  res.json({ received: true });
}
