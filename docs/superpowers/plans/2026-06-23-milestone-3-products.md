# Milestone 3 — Products: CRUD + Search/Filter/Pagination + Indexing — Plan

> **For this learning project:** assistant creates files + teaches; the human runs every command. ONE commit at module completion (per user preference). Quiz checkpoint on Backend & APIs at the end.

**Goal:** Build the product resource: a shared `Product` type, a Mongoose `Product` model with proper indexes, admin-only create/update/delete, and a public list endpoint supporting full-text search, category/price filtering, sorting, and pagination — proven by tests.

**Architecture:** `@app/types` defines the `Product` shape consumed by both ends (first real payoff of the shared package). The `Product` model owns schema + indexes (text index for search, single-field indexes for filters, unique slug). A query-builder in the list controller translates query-string params into a safe Mongoose query. Admin routes are guarded by `requireAuth` + `requireRole('admin')`.

**Tech Stack:** Mongoose 9, Zod, Express 4, Vitest + Supertest.

## Global Constraints

- `Product` type lives in `@app/types` and is imported by the server (and later the client).
- Public reads (`GET`) are open; writes (`POST/PUT/DELETE`) require admin.
- List endpoint paginates ALWAYS (default page=1, limit=12, hard max limit=100) — never return unbounded results.
- Slugs are unique and auto-derived from name; price/stock are non-negative.
- All query params validated/coerced via Zod before touching the DB.
- ONE conventional commit when the whole milestone is complete and green.

---

## File Structure

```
/packages/types/src/index.ts   add Product + ProductListQuery types (modified)
/server/src
  models/Product.ts            schema + indexes + slug hook
  validation/product.ts        createProductSchema, updateProductSchema, listQuerySchema
  controllers/product.ts       listProducts, getProductBySlug, createProduct, updateProduct, deleteProduct
  routes/product.ts            public GET + admin write routes
  utils/slugify.ts             name → url-safe slug
  app.ts                       mount /api/products (modified)
/server/test
  product.model.test.ts        slug generation + indexes + validation
  product.routes.test.ts       CRUD + RBAC + search/filter/sort/pagination
  helpers/auth.ts              test helper: create an admin + return a Bearer token
```

---

### Task 1: Shared Product type + Product model + indexes

**Files:** modify `packages/types/src/index.ts`; create `server/src/utils/slugify.ts`, `server/src/models/Product.ts`, `server/test/product.model.test.ts`.

**Interfaces:**
- Produces: `Product` interface in `@app/types`; `Product` model with fields `{ name, slug, description, price, images[], category, stock, ratingAvg, ratingCount }`; text index on `name`+`description`, index on `category` and `price`, unique index on `slug`; `slugify(text): string`.

- [ ] Add `Product` + `ProductListQuery` to `@app/types`; `npm install` to relink.
- [ ] Create `slugify.ts`.
- [ ] Create `Product.ts` with schema, pre-validate slug hook, and indexes.
- [ ] Test: slug auto-derives from name; duplicate slug rejected; negative price rejected.

### Task 2: Validation + admin create/update/delete

**Files:** create `validation/product.ts`, `controllers/product.ts` (write actions), `routes/product.ts`, `test/helpers/auth.ts`; modify `app.ts`.

**Interfaces:**
- Produces: `POST /api/products` (admin → 201), `PUT /api/products/:id` (admin), `DELETE /api/products/:id` (admin → 204); Zod `createProductSchema`/`updateProductSchema`; test helper `makeAdminToken()`.

- [ ] Create Zod schemas (create requires fields; update is partial).
- [ ] Create create/update/delete controllers using `asyncHandler` + `AppError`.
- [ ] Wire routes with `requireAuth` + `requireRole('admin')`; mount `/api/products` in `app.ts`.
- [ ] Test helper creates an admin user and returns a signed access token.
- [ ] Tests: non-admin create → 403; no token → 401; admin create → 201; update/delete work.

### Task 3: List (search/filter/sort/paginate) + get by slug

**Files:** modify `controllers/product.ts`, `routes/product.ts`, `validation/product.ts`.

**Interfaces:**
- Produces: `GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=` returning `{ items, page, limit, total, totalPages }`; `GET /api/products/:slug` → product or 404.

- [ ] Add `listQuerySchema` (coerce numbers, defaults, max limit).
- [ ] Implement `listProducts`: build filter (text search, category, price range), sort whitelist, skip/limit pagination, `countDocuments` for total.
- [ ] Implement `getProductBySlug` (404 if missing).
- [ ] Tests: search matches; category/price filter; sort by price; pagination returns correct page + total.

### Task 4: Seed script + full green run

**Files:** create `server/src/scripts/seed.ts`; add `seed` script to `server/package.json`.

**Interfaces:**
- Produces: `npm run seed -w server` inserts sample products for manual/UI testing.

- [ ] Create idempotent seed (clears + inserts ~12 sample products across categories).
- [ ] Run full server test suite green.
- [ ] Manual: start server, hit list endpoint with query params.

---

## Self-Review

- Spec Milestone 3 (REST design, Mongoose queries, aggregation/indexing, search/filter/pagination) → Tasks 1 (model+indexes), 2 (CRUD+RBAC), 3 (list/search/filter/sort/paginate). Seed (Task 4) supports the client work in Milestone 4.
- No placeholders; every task has tests + concrete deliverables.
- Type names consistent: `Product`, `slugify`, `createProductSchema`, `updateProductSchema`, `listQuerySchema`, `listProducts`, `getProductBySlug`, `createProduct`, `updateProduct`, `deleteProduct`, `makeAdminToken`.
- Reuses Milestone 2: `requireAuth`, `requireRole`, `validate`, `asyncHandler`, `AppError`.
- Deferred: reviews + image upload (Milestone 6); client product UI (Milestone 4).
