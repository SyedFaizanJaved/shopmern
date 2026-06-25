import { useQuery } from '@tanstack/react-query';
import { listOrders, getOrder } from './ordersApi';

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: listOrders });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
    // The order flips pending→paid via webhook shortly after payment, so poll
    // briefly while it's still pending.
    refetchInterval: (query) => (query.state.data?.paymentStatus === 'pending' ? 2000 : false),
  });
}
