# Milestone 1 — Express + MongoDB + Error Handling — Implementation Plan

> **For this learning project:** assistant creates files + teaches each concept; the human runs every command and owns the reasoning; quiz checkpoint on Backend & APIs at the end.

**Goal:** Connect the Express server to local MongoDB via Mongoose, load configuration from `.env` safely, and add production-grade centralized error handling (404 + error middleware + async error catching), proven by tests.

**Architecture:** A typed config module reads/validates env vars once. A `connectDB()` module owns the Mongoose connection lifecycle. `createApp()` mounts routes then the `notFound` and `errorHandler` middleware last. An `asyncHandler` wrapper forwards async route errors to the error middleware.

**Tech Stack:** Express 4, Mongoose 8, Zod (env validation), Vitest + Supertest.

## Global Constraints

- MongoDB runs locally on `mongodb://localhost:27017` (service already running).
- Secrets/config only via `.env` (gitignored); `.env.example` stays committed and current.
- Error middleware has the 4-arg signature `(err, req, res, next)` and is registered LAST.
- Every async route handler is wrapped so rejected promises reach the error middleware.
- Conventional-commit message after each task.

---

## File Structure (created/modified this milestone)

```
/server
  .env                     (gitignored) real values
  .env.example             add MONGO_URI
  src/config/env.ts        validated, typed env config (Zod)
  src/config/db.ts         connectDB() / Mongoose connection
  src/middleware/errors.ts notFound + errorHandler + AppError
  src/utils/asyncHandler.ts wrapper for async routes
  src/app.ts               mount routes + error middleware (modified)
  src/index.ts             await connectDB() before listen (modified)
  test/health.test.ts      add a 404 test (modified)
  test/db.test.ts          connectDB integration test (new)
```

---

### Task 1: Dependencies + typed env config

**Files:**
- Modify: `server/package.json` (add `mongoose`, `zod`)
- Create: `server/.env`, modify `server/.env.example`
- Create: `server/src/config/env.ts`

**Interfaces:**
- Produces: `env` object with typed fields `{ PORT: number, NODE_ENV: string, CLIENT_ORIGIN: string, MONGO_URI: string }`.

- [ ] Install: `npm install mongoose zod -w server`
- [ ] Add `MONGO_URI=mongodb://localhost:27017/shopmern` to `.env` and `.env.example`
- [ ] Create `src/config/env.ts` validating `process.env` with Zod; throw on missing required vars.
- [ ] Commit: `feat(server): add validated env config with zod`

### Task 2: Mongoose connection module

**Files:**
- Create: `server/src/config/db.ts`
- Modify: `server/src/index.ts`

**Interfaces:**
- Produces: `connectDB(uri: string): Promise<typeof mongoose>` and `disconnectDB(): Promise<void>`.

- [ ] Create `connectDB()` with connection + error/event logging.
- [ ] `index.ts`: `await connectDB(env.MONGO_URI)` before `createApp().listen()`.
- [ ] Manually verify: dev server logs "MongoDB connected".
- [ ] Commit: `feat(server): connect to mongodb via mongoose on startup`

### Task 3: Centralized error handling

**Files:**
- Create: `server/src/middleware/errors.ts`, `server/src/utils/asyncHandler.ts`
- Modify: `server/src/app.ts`

**Interfaces:**
- Produces: `AppError` class (`statusCode`, `message`); `notFound` middleware (404 JSON); `errorHandler(err, req, res, next)`; `asyncHandler(fn)`.

- [ ] Create `AppError`, `notFound`, `errorHandler`.
- [ ] Create `asyncHandler` higher-order wrapper.
- [ ] `app.ts`: register `notFound` then `errorHandler` AFTER all routes.
- [ ] Commit: `feat(server): add centralized error handling middleware`

### Task 4: Tests for 404 + DB connectivity

**Files:**
- Modify: `server/test/health.test.ts` (add 404 case)
- Create: `server/test/db.test.ts`

**Interfaces:**
- Consumes: `createApp`, `connectDB`, `disconnectDB`.

- [ ] Add test: unknown route returns 404 JSON `{ message }`.
- [ ] Add test: `connectDB` against local Mongo resolves and reports connected state.
- [ ] Run full suite green.
- [ ] Commit: `test(server): cover 404 handler and mongodb connection`

---

## Self-Review

- Spec Milestone 1 (middleware, async errors, Mongoose connect) → Tasks 2 (connect), 3 (errors/async), 4 (tests). Env config (Task 1) supports all.
- No placeholders; each task has concrete deliverable + commit.
- Type names consistent: `connectDB`/`disconnectDB`/`env`/`AppError`/`asyncHandler`/`notFound`/`errorHandler` reused across tasks.
- Deferred to Milestone 2: User schema, auth, bcrypt, JWT.
