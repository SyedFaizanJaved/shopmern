import type { Order, ShippingAddress } from '@app/types';
import { api } from '../../api/client';

export interface CreateOrderInput {
  items: { product: string; qty: number }[];
  shippingAddress: ShippingAddress;
}

export interface CreateOrderResponse {
  order: Order;
  clientSecret: string;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
  const res = await api.post<CreateOrderResponse>('/orders', input);
  return res.data;
}

export async function listOrders(): Promise<Order[]> {
  const res = await api.get<Order[]>('/orders');
  return res.data;
}

export async function getOrder(id: string): Promise<Order> {
  const res = await api.get<Order>(`/orders/${id}`);
  return res.data;
}
