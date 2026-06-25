import { Schema, model, type Types } from 'mongoose';
import type { PaymentStatus } from '@app/types';

interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  qty: number;
}

interface IShippingAddress {
  fullName: string;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface IOrder {
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
}

// _id: false on sub-schemas → embedded items/address don't get their own ids.
const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // snapshot
    price: { type: Number, required: true }, // snapshot
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const shippingSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingSchema, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    stripePaymentIntentId: { type: String, index: true },
  },
  { timestamps: true },
);

export const Order = model<IOrder>('Order', orderSchema);
