import { z } from 'zod';

// The client sends only product IDs + quantities + shipping. It does NOT send
// prices — the server recomputes those from the DB (never trust client prices).
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string().min(1),
        qty: z.number().int().positive(),
      }),
    )
    .min(1, 'Cart cannot be empty'),
  shippingAddress: z.object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    line1: z.string().trim().min(1, 'Address is required'),
    city: z.string().trim().min(1, 'City is required'),
    postalCode: z.string().trim().min(1, 'Postal code is required'),
    country: z.string().trim().min(1, 'Country is required'),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
