import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAppSelector } from '../app/hooks';
import { createOrder } from '../features/orders/ordersApi';
import { env } from '../config/env';
import { CheckoutPaymentForm } from '../components/CheckoutPaymentForm';

// loadStripe is called once, outside the component, so Stripe.js isn't reloaded
// on every render.
const stripePromise = loadStripe(env.stripePublishableKey);

const shippingSchema = z.object({
  fullName: z.string().trim().min(1, 'Required'),
  line1: z.string().trim().min(1, 'Required'),
  city: z.string().trim().min(1, 'Required'),
  postalCode: z.string().trim().min(1, 'Required'),
  country: z.string().trim().min(1, 'Required'),
});
type ShippingValues = z.infer<typeof shippingSchema>;

const fields: { name: keyof ShippingValues; label: string }[] = [
  { name: 'fullName', label: 'Full name' },
  { name: 'line1', label: 'Address' },
  { name: 'city', label: 'City' },
  { name: 'postalCode', label: 'Postal code' },
  { name: 'country', label: 'Country' },
];

export function CheckoutPage() {
  const items = useAppSelector((s) => s.cart.items);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingValues>({ resolver: zodResolver(shippingSchema) });

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Empty cart and no payment in progress → nothing to check out.
  if (items.length === 0 && !clientSecret) {
    return <Navigate to="/cart" replace />;
  }

  async function onSubmit(shipping: ShippingValues) {
    setServerError('');
    try {
      const { order, clientSecret: secret } = await createOrder({
        items: items.map((i) => ({ product: i.productId, qty: i.qty })),
        shippingAddress: shipping,
      });
      setOrderId(order.id);
      setClientSecret(secret);
    } catch {
      setServerError('Could not start checkout. Please try again.');
    }
  }

  // Step 2: payment (once we have a clientSecret from the server).
  if (clientSecret) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="mb-4 text-2xl font-bold">Payment</h1>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
          <CheckoutPaymentForm orderId={orderId} />
        </Elements>
      </div>
    );
  }

  // Step 1: shipping details.
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Shipping</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {fields.map((f) => (
          <div key={f.name}>
            <input
              placeholder={f.label}
              {...register(f.name)}
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            />
            {errors[f.name] && (
              <p className="mt-1 text-xs text-red-400">{errors[f.name]?.message}</p>
            )}
          </div>
        ))}
        {serverError && <p className="text-sm text-red-400">{serverError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isSubmitting ? 'Starting…' : `Continue to payment ($${total.toFixed(2)})`}
        </button>
      </form>
    </div>
  );
}
