import { Link } from 'react-router-dom';
import { useOrders } from '../features/orders/useOrders';
import { Spinner } from '../components/Spinner';
import { StatusBadge } from '../components/StatusBadge';

export function OrdersPage() {
  const { data: orders, isLoading, isError } = useOrders();

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-red-400">Failed to load orders.</p>;
  if (!orders || orders.length === 0) {
    return (
      <p className="text-slate-400">
        No orders yet.{' '}
        <Link to="/" className="text-emerald-400 hover:underline">
          Start shopping
        </Link>
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Your Orders</h1>
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              to={`/orders/${o.id}`}
              className="block rounded border border-slate-700 bg-slate-800 p-4 hover:border-emerald-500"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-slate-400">#{o.id.slice(-8)}</span>
                <StatusBadge status={o.paymentStatus} />
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {o.items.length} item(s) · {new Date(o.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-1 font-bold text-emerald-400">${o.totalAmount.toFixed(2)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
