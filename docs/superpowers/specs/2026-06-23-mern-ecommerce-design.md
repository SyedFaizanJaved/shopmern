# MERN E-Commerce (TypeScript) — Learning & Interview-Prep Project

**Date:** 2026-06-23
**Status:** Approved design (pre-implementation)
**Purpose:** Build a full-featured e-commerce app with the MERN stack (TypeScript end-to-end, Tailwind) as a vehicle for deep, market-relevant learning and interview preparation. Build-first; quiz at each milestone.

---

## 1. Goals

1. Ship a full-featured e-commerce MVP: auth, product catalog, search/filter, product detail, reviews, image uploads, cart, Stripe (test) checkout, order history, and an admin panel (RBAC).
2. Teach market-standard practices across **backend & APIs**, **auth & security**, **React & state**, and **TypeScript & tooling** — all flagged as weak spots.
3. Build interview readiness: each milestone ends with a quiz checkpoint (MCQs + conceptual "interviewer" questions); advance only when concepts are solid.
4. Cover production polish: testing, validation & error handling, DevOps basics, and code quality.

**Non-goals (v1):** real payment processing (Stripe stays in test mode), multi-currency, internationalization, microservices, server-side rendering.

---

## 2. Tech Stack

**Monorepo** via npm workspaces:
- `/client` — React 18 + Vite + TypeScript + Tailwind CSS + React Router + Redux Toolkit (cart/auth UI state) + TanStack React Query (server data) + React Hook Form + Zod + Axios (with token-refresh interceptors).
- `/server` — Node + Express + TypeScript + Mongoose (MongoDB) + Zod (request validation) + bcrypt + jsonwebtoken + Multer + Cloudinary + Stripe (test mode).
- `/packages/types` — shared TypeScript types (DTOs) consumed by both client and server.

**Tooling:** ESLint + Prettier, `.env` config (per workspace), Git feature branches, Vitest + Supertest (server) + React Testing Library (client), Docker basics, deploy to Render (API) + Vercel (client).

---

## 3. Authentication Decision

**Chosen: JWT with access + refresh tokens.**

- Short-lived **access token** held in memory on the client (never `localStorage` — XSS risk).
- **Refresh token** stored in an `httpOnly`, `Secure`, `SameSite` cookie; rotated on use; persisted server-side as a hashed `RefreshToken` document so it can be revoked.
- Axios response interceptor transparently refreshes the access token on 401.

**Rationale:** stateless access tokens scale horizontally; refresh rotation + server-side hash storage restores revocation, addressing JWT's main weakness. Server sessions will still be taught for interview comparison (stateful, trivially revocable, needs shared store to scale).

---

## 4. Data Model

```
User      { name, email(unique,idx), passwordHash, role: 'user'|'admin', createdAt }
Product   { name, slug(idx), description, price, images[], category(idx),
            stock, ratingAvg, ratingCount }
Review    { product->Product, user->User, rating(1-5), comment, createdAt }
            // unique compound index (product,user): one review per user/product
Cart      { user->User(unique), items:[{ product->Product, qty, priceAtAdd }] }
Order     { user->User, items:[{ product, name, qty, price }],  // snapshot/denormalized
            shippingAddress, totalAmount, paymentStatus, stripePaymentId, createdAt }
RefreshToken { user->User, tokenHash, expiresAt, revoked }
```

**Deliberate teaching decisions:**
- **Order items are denormalized (snapshotted)** — name/price copied at purchase so historical orders are immutable when products later change. Answers "why duplicate data?"
- **`priceAtAdd` in cart** — same reasoning at cart scale.
- **Embed vs reference**: cart/order items embed line snapshots; users/products/reviews are referenced. This contrast is itself a teaching point.

---

## 5. API Surface (REST)

```
Auth      POST /api/auth/register | /login | /logout | /refresh    GET /api/auth/me
Products  GET /api/products (search,filter,sort,paginate)   GET /api/products/:slug
          POST|PUT|DELETE /api/products  (admin only)
Reviews   GET /api/products/:id/reviews    POST /api/products/:id/reviews
Cart      GET /api/cart   POST /api/cart/items   PATCH /api/cart/items/:id   DELETE ...
Orders    POST /api/orders (checkout)   GET /api/orders (mine)   GET /api/orders/:id
          GET /api/admin/orders (admin)
Payments  POST /api/payments/create-intent    POST /api/payments/webhook
Upload    POST /api/upload (admin, Multer -> Cloudinary)
```

**Cross-cutting middleware:** `auth` (verify JWT), `requireRole('admin')` (RBAC), `validate(zodSchema)`, central `errorHandler`, rate-limiting on auth routes.

---

## 6. Milestone Plan + Quiz Checkpoints

Each milestone ships working code, then a quiz checkpoint (~5 MCQs + 2-3 conceptual interview questions). Advance only when concepts are solid.

| # | Milestone | Learn | Quiz focus |
|---|---|---|---|
| 0 | Monorepo + tooling setup | Workspaces, Vite, TS config, ESLint/Prettier, env | TS/tooling |
| 1 | Express + Mongo skeleton, error handling | Middleware, async errors, Mongoose connect | Backend/APIs |
| 2 | User model + Auth (JWT+refresh, bcrypt, cookies) | Hashing, tokens, httpOnly, CORS, RBAC | Auth/security |
| 3 | Product CRUD + search/filter/pagination + indexing | REST design, Mongoose queries, aggregation, indexes | Backend/APIs |
| 4 | React shell: routing, Tailwind, RTK + React Query, Axios refresh interceptor | Hooks, re-renders, server vs client state | React/state |
| 5 | Cart + checkout + Stripe test payments | Optimistic updates, webhooks, idempotency | React + backend |
| 6 | Reviews + image upload (Cloudinary) | Compound indexes, file handling | Backend |
| 7 | Admin panel (RBAC UI) | Protected routes, role gating | Auth + React |
| 8 | Testing, validation hardening, Docker, deploy | Vitest/Supertest/RTL, CI, deployment | Polish + DevOps |

---

## 7. Teaching / Interview Rhythm

For each milestone:
1. **Explain** the concept + market context.
2. **Build** it together (user writes code, assistant guides and reviews).
3. **Quiz checkpoint**: ~5 MCQs + 2-3 "explain it like an interviewer asked" questions.
4. **Score & gate**: only advance when solid; track recurring weak spots and circle back.

---

## 8. Success Criteria

- App runs locally end-to-end: register -> browse/search -> add to cart -> checkout (Stripe test) -> view order; admin can manage products and view all orders.
- Tests pass for auth, product queries, and at least one React component flow.
- User can confidently answer interview questions across all eight milestone focus areas.
