# Milestone 4 — React Shell (Router + RTK + React Query + Axios) — Plan

> **For this learning project:** assistant creates files + teaches; the human runs commands and verifies in the browser. ONE commit at module completion. Quiz checkpoint on React & State at the end.

**Goal:** Build the React frontend foundation: routing, a layout, the product list (with search/filter) and product detail pages backed by TanStack React Query, global state via Redux Toolkit (auth + cart), and an Axios client with a refresh-token interceptor — all typed end-to-end via `@app/types`.

**Architecture:** Providers (Redux `store`, React Query `QueryClient`, `BrowserRouter`) wrap the app. **Server state** (products) lives in React Query; **client state** (auth session, cart) lives in Redux Toolkit. A single Axios instance attaches the in-memory access token and transparently refreshes it on 401. Pages are thin; data-fetching hooks and API functions are isolated.

**Tech Stack:** React 19, React Router 7, Redux Toolkit + React-Redux, TanStack React Query 5, Axios, React Hook Form + Zod, Tailwind, Vitest + React Testing Library.

## Global Constraints

- Server state → React Query; client/UI state → Redux Toolkit. Do not duplicate server data in Redux.
- Access token kept in memory (Redux), NOT localStorage. Refresh token is the httpOnly cookie (server-managed).
- All API calls go through the single Axios instance (`withCredentials: true`).
- API base URL from `import.meta.env.VITE_API_URL` (validated once).
- Types imported from `@app/types` — never redefine Product/Role on the client.
- ONE conventional commit when the milestone is complete and the app runs.

---

## File Structure

```
/client
  .env / .env.example          VITE_API_URL
  src/config/env.ts            read + check import.meta.env
  src/app/store.ts             configureStore (auth + cart reducers)
  src/app/hooks.ts             typed useAppDispatch / useAppSelector
  src/app/providers.tsx        Redux + QueryClient + Router providers
  src/api/client.ts            axios instance + request/response interceptors
  src/features/auth/
    authSlice.ts               { user, accessToken } + setCredentials/clearCredentials
    authApi.ts                 register/login/me/refresh/logout
    useAuth.ts                 selector hook
  src/features/cart/
    cartSlice.ts               items + add/remove/setQty/clear (localStorage persistence)
  src/features/products/
    productsApi.ts             listProducts/getProductBySlug
    useProducts.ts             React Query hooks
  src/components/              Navbar, ProductCard, ProtectedRoute, Spinner
  src/pages/                   HomePage, ProductsPage, ProductDetailPage, LoginPage, RegisterPage, CartPage
  src/routes.tsx               route table
  src/main.tsx                 mount <Providers><App/></Providers> (modified)
  src/App.tsx                  render the router (modified)
  test/                        cartSlice.test.ts, ProductCard.test.tsx
  vitest.config.ts / test setup
```

---

### Task 1: Foundation — deps, env, store, providers

- [ ] Install: `react-router-dom @reduxjs/toolkit react-redux @tanstack/react-query axios react-hook-form @hookform/resolvers zod -w client`.
- [ ] Add `VITE_API_URL` to client `.env` + `.env.example`; create `config/env.ts`.
- [ ] Create empty `authSlice`/`cartSlice`, `store.ts`, typed `hooks.ts`, `providers.tsx`.
- [ ] Wire `main.tsx` to render `<Providers><App/></Providers>`; App renders a placeholder.
- [ ] Verify: app still boots on :5173 with providers mounted (React Query Devtools optional).

### Task 2: Axios client + interceptors + auth slice/api

- [ ] `authSlice`: state `{ user, accessToken }`, reducers `setCredentials`, `clearCredentials`.
- [ ] `api/client.ts`: axios instance (`baseURL`, `withCredentials`); request interceptor injects `Authorization: Bearer <accessToken>` from the store; response interceptor on 401 calls `/auth/refresh`, updates the store, retries once (guard against infinite loops).
- [ ] `authApi.ts`: `register/login/me/refresh/logout` using the instance.
- [ ] Verify: typecheck + a quick unit test of the auth reducer.

### Task 3: Routing + layout + product pages (React Query)

- [ ] `routes.tsx` + layout `Navbar` (brand, cart count, login/logout).
- [ ] `productsApi.ts` + `useProducts`/`useProduct` React Query hooks.
- [ ] `ProductsPage`: grid of `ProductCard`, search box + category filter (URL-synced).
- [ ] `ProductDetailPage`: fetch by slug, loading/error states.
- [ ] Verify live against the seeded backend (12 products render).

### Task 4: Auth UI + cart slice

- [ ] `LoginPage`/`RegisterPage`: React Hook Form + Zod resolver; on success dispatch `setCredentials`, redirect.
- [ ] `ProtectedRoute` (redirect to /login if no user); Navbar reflects auth state; logout calls API + `clearCredentials`.
- [ ] `cartSlice`: `addItem/removeItem/setQty/clear`, persisted to localStorage; Navbar shows count; `CartPage` lists items + total.
- [ ] Verify: register → login → see name in navbar; add to cart → count updates; refresh page → cart persists.

### Task 5: Tests + end-to-end verification

- [ ] Configure Vitest + React Testing Library + jsdom for the client.
- [ ] Tests: `cartSlice` reducer logic; `ProductCard` renders name/price and "Add to cart".
- [ ] Full manual flow against backend; fix any issues.

---

## Self-Review

- Spec Milestone 4 (React shell: routing, Tailwind, RTK + React Query, Axios refresh interceptor; learn hooks, re-renders, server vs client state) → Tasks 1–5 cover all.
- Server state (React Query) vs client state (RTK) boundary enforced by Global Constraints.
- Reuses `@app/types` (Product, Paginated, Role) and the Milestone 2/3 API.
- No placeholders; each task ends with a browser/test verification.
- Deferred: cart→order checkout + Stripe (Milestone 5); reviews/upload UI (Milestone 6); admin UI (Milestone 7).
