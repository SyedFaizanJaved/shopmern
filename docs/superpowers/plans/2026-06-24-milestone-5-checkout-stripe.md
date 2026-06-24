# Milestone 5 — Checkout + Stripe (test mode) — Implementation Plan

> **For this learning project:** assistant creates files + teaches; the human runs commands, provides Stripe test keys, and verifies in the browser. ONE commit at module completion. Quiz checkpoint spanning payments + React/backend at the end.

**Goal:** Turn the cart into real orders paid via Stripe test mode: create a pending Order + Stripe PaymentIntent at checkout, confirm the card with Stripe Elements on the client, and mark the order paid + decrement stock from a verified Stripe webhook. Plus an order-history view.

**Architecture:** Checkout creates a snapshotted `Order` (pending) and a Stripe `PaymentIntent` for the total; the client confirms the card with the `clientSecret` via Stripe Elements. The **webhook is the source of truth**: on `payment_intent.succeeded` the server marks the order `paid`, decrements stock, and clears nothing client-side until confirmed. Webhook signature verification requires the RAW request body, so that route is mounted before `express.json()`.

**Tech Stack:** Stripe Node SDK, @stripe/stripe-js + @stripe/react-stripe-js, Express 4, Mongoose 9, Vitest.

## Global Constraints

- Stripe runs in TEST mode only (test keys, test card 4242 4242 4242 4242). Never real charges.
- Server is the source of truth for price/total — recompute from the DB at checkout, NEVER trust client-sent prices.
- Order line items are SNAPSHOTTED (name + price at purchase time) — historical orders never change.
- The webhook (`/api/payments/webhook`) uses `express.raw`, mounted BEFORE `express.json()`; it verifies the Stripe signature.
- Order status transitions: pending → paid (webhook) or failed. Webhook handler is idempotent.
- Order routes require auth; a user can only read their own orders.
- ONE conventional commit when the milestone is complete and green.

---

## File Structure

```
/packages/types/src/index.ts   add Order, OrderItem, ShippingAddress, PaymentStatus (modified)
/server/src
  config/env.ts                add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (modified)
  config/stripe.ts             configured Stripe client
  models/Order.ts              order schema (snapshotted items)
  validation/order.ts          checkout body schema (shipping + items)
  controllers/order.ts         createOrder, listMyOrders, getMyOrderById
  controllers/payment.ts       stripeWebhook handler
  routes/order.ts              POST /api/orders, GET /api/orders, GET /api/orders/:id (auth)
  routes/payment.ts            POST /api/payments/webhook (raw body)
  app.ts                       mount webhook (raw) BEFORE json; mount orders (modified)
/server/test
  order.routes.test.ts         checkout creates pending order + intent; auth; ownership
/client
  .env / .env.example          add VITE_STRIPE_PUBLISHABLE_KEY
  src/config/env.ts            expose stripe publishable key (modified)
  src/features/orders/
    ordersApi.ts               createOrder, listOrders, getOrder
    useOrders.ts               React Query hooks
  src/pages/CheckoutPage.tsx   shipping form + Stripe Elements + confirmPayment
  src/pages/OrderSuccessPage.tsx
  src/pages/OrdersPage.tsx     order history
  src/App.tsx                  protected /checkout, /orders, /orders/:id (modified)
  src/components/ProtectedRoute.tsx  (reused)
```

---

### Task 0: Stripe account + keys (human step)
- [ ] Create a free Stripe account; in TEST mode copy the **Publishable key** (pk_test_…) and **Secret key** (sk_test_…).
- [ ] Install Stripe CLI; run `stripe listen --forward-to localhost:5000/api/payments/webhook` to get the **webhook signing secret** (whsec_…).

### Task 1: Backend — Order types, model, env, Stripe client
- [ ] Add `Order`, `OrderItem`, `ShippingAddress`, `PaymentStatus` to `@app/types`.
- [ ] Install `stripe -w server`; add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` to env schema + `.env`/`.env.example`.
- [ ] Create `config/stripe.ts`; create `models/Order.ts` (snapshotted items, paymentStatus, stripePaymentIntentId).

### Task 2: Backend — checkout (create order + PaymentIntent)
- [ ] `validation/order.ts`: shipping + items schema.
- [ ] `controllers/order.ts#createOrder`: recompute total from DB prices, create pending Order, create Stripe PaymentIntent (amount in cents), save intent id, return `{ order, clientSecret }`.
- [ ] `routes/order.ts`: `POST /api/orders` (requireAuth) + mount in app.

### Task 3: Backend — webhook + order history + tests
- [ ] `controllers/payment.ts#stripeWebhook`: verify signature (raw body), handle `payment_intent.succeeded` → mark order paid + decrement stock (idempotent).
- [ ] `routes/payment.ts` mounted with `express.raw` BEFORE `express.json()` in app.
- [ ] `listMyOrders` + `getMyOrderById` (ownership check) + routes.
- [ ] Tests: checkout creates pending order + returns clientSecret (Stripe mocked); unauth → 401; can't read another user's order → 404/403.

### Task 4: Frontend — checkout with Stripe Elements
- [ ] Install `@stripe/stripe-js @stripe/react-stripe-js -w client`; add `VITE_STRIPE_PUBLISHABLE_KEY`.
- [ ] `ordersApi.ts` + `useOrders.ts`.
- [ ] `CheckoutPage`: shipping form (RHF + Zod) → createOrder → `<Elements>` + `<PaymentElement>` → `stripe.confirmPayment`.
- [ ] Protected `/checkout` route; CartPage gets a "Checkout" button.

### Task 5: Frontend — success + order history
- [ ] `OrderSuccessPage` (clears cart, shows confirmation); `OrdersPage` (history list).
- [ ] Protected `/orders`, `/orders/:id` routes; Navbar "Orders" link when logged in.
- [ ] Full manual flow against Stripe test mode with card 4242…; verify order flips to paid via webhook.

---

## Self-Review

- Spec Milestone 5 (cart + checkout + Stripe; optimistic updates, webhooks, idempotency) → Tasks 1–5.
- Security: server recomputes totals (never trust client prices); webhook signature verified; ownership checks on order reads.
- Snapshotting reused from the Milestone 3 design rationale.
- Reuses requireAuth, validate, asyncHandler, AppError, React Query, RTK cart.
- Deferred: reviews/upload (M6), admin order management (M7).
