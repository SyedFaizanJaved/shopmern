import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import type { Order as OrderDTO } from '@app/types';
import { Order, type IOrder } from '../models/Order';
import { Product } from '../models/Product';
import { stripe } from '../config/stripe';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errors';
import type { CheckoutInput } from '../validation/order';

type OrderDoc = HydratedDocument<IOrder> & { createdAt: Date; updatedAt: Date };

export function serializeOrder(o: HydratedDocument<IOrder>): OrderDTO {
  const doc = o as OrderDoc;
  return {
    id: o.id,
    user: String(o.user),
    items: o.items.map((it) => ({
      product: String(it.product),
      name: it.name,
      price: it.price,
      qty: it.qty,
    })),
    shippingAddress: {
      fullName: o.shippingAddress.fullName,
      line1: o.shippingAddress.line1,
      city: o.shippingAddress.city,
      postalCode: o.shippingAddress.postalCode,
      country: o.shippingAddress.country,
    },
    totalAmount: o.totalAmount,
    paymentStatus: o.paymentStatus,
    stripePaymentIntentId: o.stripePaymentIntentId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { items, shippingAddress } = req.body as CheckoutInput;

  // Recompute everything from the DB — the client's prices are never trusted.
  const products = await Product.find({ _id: { $in: items.map((i) => i.product) } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const orderItems = items.map((i) => {
    const product = byId.get(i.product);
    if (!product) throw new AppError(`Product not found: ${i.product}`, 400);
    if (product.stock < i.qty) throw new AppError(`Insufficient stock for ${product.name}`, 409);
    return { product: product._id, name: product.name, price: product.price, qty: i.qty };
  });

  const totalAmount = orderItems.reduce((sum, it) => sum + it.price * it.qty, 0);
  if (totalAmount <= 0) throw new AppError('Order total must be greater than zero', 400);

  // Stripe works in the smallest currency unit (cents) → multiply by 100.
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100),
    currency: 'usd',
    metadata: { userId: req.user!.id },
    automatic_payment_methods: { enabled: true },
  });

  const order = await Order.create({
    user: req.user!.id,
    items: orderItems,
    shippingAddress,
    totalAmount,
    paymentStatus: 'pending',
    stripePaymentIntentId: paymentIntent.id,
  });

  res.status(201).json({
    order: serializeOrder(order),
    clientSecret: paymentIntent.client_secret,
  });
});

export const listMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
  res.json(orders.map(serializeOrder));
});

export const getMyOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  // 404 (not 403) when it's someone else's order → don't reveal it exists.
  if (!order || String(order.user) !== req.user!.id) {
    throw new AppError('Order not found', 404);
  }
  res.json(serializeOrder(order));
});
