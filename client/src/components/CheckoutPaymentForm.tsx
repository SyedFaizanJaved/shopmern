import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { clearCart } from '../features/cart/cartSlice';

export function CheckoutPaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  async function handlePay() {
    if (!stripe || !elements) return; // Stripe.js not loaded yet
    setProcessing(true);
    setError('');

    // redirect: 'if_required' → card payments resolve inline (no page redirect).
    const result = await stripe.confirmPayment({ elements, redirect: 'if_required' });

    if (result.error) {
      setError(result.error.message ?? 'Payment failed');
      setProcessing(false);
    } else {
      dispatch(clearCart()); // payment confirmed → empty the cart
      navigate(`/orders/${orderId}`); // order page shows confirmation + status
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || processing}
        className="w-full rounded bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-50"
      >
        {processing ? 'Processing…' : 'Pay now'}
      </button>
      <p className="text-xs text-slate-500">Test card: 4242 4242 4242 4242 · any future date · any CVC</p>
    </div>
  );
}
