# Milestone 6 — Reviews + Image Upload (local disk) — Plan

> **For this learning project:** assistant creates files + teaches; the human runs commands and verifies in the browser. ONE commit at module completion. Quiz checkpoint on Backend (relationships, aggregation, file handling) at the end.

**Goal:** Add product reviews (one per user per product, with rating + comment) that update each product's average rating, and an admin image-upload endpoint (Multer → local disk, served statically). Reviews appear on the product detail page with an add-review form.

**Architecture:** A `Review` model references `Product` + `User` with a unique compound index (one review per user/product). Creating/changing a review recomputes the product's `ratingAvg`/`ratingCount` via aggregation. Uploads use Multer disk storage with type/size limits; files are served from `/uploads`. The client shows reviews + an add-review form (React Query, invalidated on submit).

**Tech Stack:** Mongoose 9 (refs, aggregation), Multer, Express static, React Query, Vitest + Supertest.

## Global Constraints

- One review per (product, user) — enforced by a unique compound index; duplicate → 409.
- Rating is an integer 1–5; recompute product ratingAvg/ratingCount from reviews (source of truth = the reviews).
- Upload: admin-only; images only (mimetype check); size cap (e.g. 2 MB); unique filenames.
- `server/uploads/` is gitignored (don't commit uploaded files); served read-only at `/uploads`.
- Reviews require auth to create; reading is public.
- ONE conventional commit when the milestone is complete and green.

---

## File Structure

```
/packages/types/src/index.ts   add Review type (modified)
/server/src
  models/Review.ts             product+user refs, rating, comment, unique (product,user)
  validation/review.ts         createReviewSchema (rating 1-5, comment)
  controllers/review.ts        listProductReviews, createReview (+ recompute rating)
  controllers/upload.ts        uploadImage (returns { url })
  middleware/upload.ts         configured Multer (disk storage, filter, limits)
  routes/review.ts             GET/POST /api/products/:id/reviews
  routes/upload.ts             POST /api/upload (admin)
  app.ts                       mount reviews, upload; serve /uploads static (modified)
  .gitignore-note              uploads/ added to root .gitignore
/server/test
  review.routes.test.ts        create/list, one-per-user 409, rating recompute, auth
  upload.routes.test.ts        auth/role guards + successful upload returns url
/client/src
  features/reviews/reviewsApi.ts + useReviews.ts
  components/ReviewList.tsx, ReviewForm.tsx
  pages/ProductDetailPage.tsx  show reviews + add form (modified)
```

---

### Task 1: Review type + model + indexes
- [ ] Add `Review` to `@app/types`.
- [ ] Create `models/Review.ts`: `{ product ref, user ref, rating 1-5, comment }`, `timestamps`, unique compound index `{ product, user }`.

### Task 2: Review controllers + rating recompute + routes + tests
- [ ] `validation/review.ts` (rating int 1-5, comment min 1).
- [ ] `controllers/review.ts`: `listProductReviews` (newest first, populate user name); `createReview` (one-per-user → 409 on dup; then recompute product ratingAvg/ratingCount via aggregate).
- [ ] `routes/review.ts`: `GET /api/products/:id/reviews` (public), `POST` (requireAuth + validate); mount in app.
- [ ] Tests: create → 201 + product rating updates; second review by same user → 409; list returns reviews; unauth POST → 401.

### Task 3: Multer upload (local disk) + static serving + tests
- [ ] Add `uploads/` to root `.gitignore`; install `multer` + `@types/multer -w server`.
- [ ] `middleware/upload.ts`: Multer disk storage (unique filename), image-only filter, 2 MB limit.
- [ ] `controllers/upload.ts` + `routes/upload.ts`: `POST /api/upload` (requireAuth + requireRole('admin')) → `{ url: '/uploads/<file>' }`.
- [ ] `app.ts`: `app.use('/uploads', express.static(uploadsDir))`.
- [ ] Tests: no token → 401; non-admin → 403; admin + image → 201 with url (cleanup after).

### Task 4: Frontend — reviews on the product page
- [ ] `reviewsApi.ts` + `useReviews`/`useCreateReview` (React Query mutation, invalidate on success).
- [ ] `ReviewList` (stars + comment + author) and `ReviewForm` (rating select + comment; logged-in only).
- [ ] Wire into `ProductDetailPage`; show average rating.
- [ ] Verify live: submit a review → appears in the list; product avg updates.

---

## Self-Review

- Spec Milestone 6 (reviews, compound indexes, image upload, file handling) → Tasks 1–4.
- Reuses requireAuth, requireRole, validate, asyncHandler, AppError, React Query, @app/types.
- Aggregation used for rating recompute (teaches the aggregation pipeline).
- Upload is local-disk per user choice; Cloudinary noted as the production swap.
- Deferred: admin product CRUD UI that *uses* the upload endpoint (Milestone 7).
