import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../features/orders/useOrders';
import { Spinner } from '../components/Spinner';
import { StatusBadge } from '../components/StatusBadge';

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const { data: order, isLoading, isError } = useOrder(id);

  if (isLoading) return <Spinner />;
  if (isError || !order) return <p className="text-red-400">Order not found.</p>;

  return (
    <div className="max-w-xl">
      <Link to="/orders" className="text-sm text-emerald-400 hover:underline">
        ← All orders
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h1>
        <StatusBadge status={order.paymentStatus} />
      </div>

      {order.paymentStatus === 'paid' && (
        <p className="mt-2 text-emerald-400">✓ Payment confirmed — thank you!</p>
      )}
      {order.paymentStatus === 'pending' && (
        <p className="mt-2 text-amber-300">Awaiting payment confirmation…</p>
      )}

      <ul className="mt-6 space-y-2">
        {order.items.map((it, idx) => (
          <li
            key={idx}
            className="flex justify-between rounded border border-slate-700 bg-slate-800 p-3 text-sm"
          >
            <span>
              {it.name} × {it.qty}
            </span>
            <span>${(it.price * it.qty).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-slate-700 pt-4 text-right text-xl font-bold">
        Total: <span className="text-emerald-400">${order.totalAmount.toFixed(2)}</span>
      </div>

      <div className="mt-6 text-sm text-slate-400">
        <p className="font-semibold text-slate-300">Shipping to:</p>
        <p>{order.shippingAddress.fullName}</p>
        <p>
          {order.shippingAddress.line1}, {order.shippingAddress.city}
        </p>
        <p>
          {order.shippingAddress.postalCode}, {order.shippingAddress.country}
        </p>
      </div>
    </div>
  );
}
