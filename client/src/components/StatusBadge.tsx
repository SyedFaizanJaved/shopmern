import type { PaymentStatus } from '@app/types';

const styles: Record<PaymentStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-300',
  paid: 'bg-emerald-500/20 text-emerald-300',
  failed: 'bg-red-500/20 text-red-300',
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles[status]}`}>{status}</span>
  );
}
