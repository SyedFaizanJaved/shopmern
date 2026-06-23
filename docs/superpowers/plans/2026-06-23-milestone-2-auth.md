# Milestone 2 — Authentication (JWT access + refresh) — Implementation Plan

> **For this learning project:** assistant creates files + teaches; the human runs every command and owns reasoning; quiz checkpoint on Auth & Security at the end.

**Goal:** Implement secure JWT authentication: register/login with bcrypt-hashed passwords, short-lived access tokens, revocable refresh tokens stored hashed in Mongo, an `httpOnly` refresh cookie, a protected `/me` route, token refresh + logout, and role-based access control (RBAC).

**Architecture:** A `User` model hashes passwords via a Mongoose pre-save hook. A `token` util signs/verifies access + refresh JWTs. A `RefreshToken` model stores hashed refresh tokens for revocation. Auth controllers handle register/login/refresh/logout/me; an `auth` middleware verifies access tokens and attaches `req.user`; `requireRole` enforces RBAC. Zod validates request bodies.

**Tech Stack:** Mongoose 9, bcryptjs, jsonwebtoken, cookie-parser, Zod, Vitest + Supertest.

## Global Constraints

- Passwords stored only as bcrypt hashes — never plaintext, never logged.
- Access token: short TTL (15m), returned in JSON (client keeps it in memory).
- Refresh token: long TTL (7d), set as `httpOnly`, `sameSite`, `secure`(in prod) cookie; stored HASHED in Mongo and rotated on use.
- All auth secrets come from validated env (Zod); never hard-coded.
- Error responses use the existing `AppError` + central `errorHandler`.
- Conventional-commit after each task.

---

## File Structure

```
/server/src
  config/env.ts            add JWT secrets + TTLs (modified)
  models/User.ts           user schema + password hashing + comparePassword
  models/RefreshToken.ts   hashed refresh tokens (revocable)
  utils/token.ts           sign/verify access + refresh JWTs
  utils/asyncHandler.ts    (existing)
  validation/auth.ts       Zod schemas: registerSchema, loginSchema
  middleware/validate.ts   generic Zod validation middleware
  middleware/auth.ts       requireAuth (verify access token) + requireRole (RBAC)
  controllers/auth.ts      register, login, refresh, logout, me
  routes/auth.ts           wires the auth routes
  app.ts                   cookie-parser + mount /api/auth (modified)
/server/test
  user.model.test.ts       hashing + comparePassword
  auth.routes.test.ts      register/login/me/refresh/logout flows
```

---

### Task 1: Auth env + User model (with password hashing)

**Files:** modify `config/env.ts`, `.env`, `.env.example`; create `models/User.ts`; create `test/user.model.test.ts`.

**Interfaces:**
- Produces: `User` model with fields `{ name, email, passwordHash, role }`; instance method `comparePassword(plain): Promise<boolean>`; env gains `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL`.

- [ ] Install: `npm install bcryptjs jsonwebtoken cookie-parser -w server` and `npm install -D @types/jsonwebtoken @types/cookie-parser -w server`
- [ ] Add JWT secrets + TTLs to env schema, `.env`, `.env.example`.
- [ ] Create `User.ts`: schema + pre-save bcrypt hashing + `comparePassword`.
- [ ] Test: saving a user hashes the password; `comparePassword` returns true/false correctly.
- [ ] Commit: `feat(server): add user model with bcrypt password hashing`

### Task 2: JWT utilities + RefreshToken model

**Files:** create `utils/token.ts`, `models/RefreshToken.ts`, `test/token.test.ts`.

**Interfaces:**
- Produces: `signAccessToken(payload)`, `signRefreshToken(payload)`, `verifyAccessToken(t)`, `verifyRefreshToken(t)` where payload = `{ sub: userId, role }`; `RefreshToken` model `{ user, tokenHash, expiresAt, revoked }`.

- [ ] Create `token.ts` using `jsonwebtoken` + env secrets/TTLs.
- [ ] Create `RefreshToken.ts` model.
- [ ] Test: a signed access token verifies and round-trips its payload; a tampered token fails.
- [ ] Commit: `feat(server): add jwt token utils and refresh token model`

### Task 3: Validation + register/login

**Files:** create `validation/auth.ts`, `middleware/validate.ts`, `controllers/auth.ts`, `routes/auth.ts`; modify `app.ts`; create `test/auth.routes.test.ts`.

**Interfaces:**
- Produces: `POST /api/auth/register`, `POST /api/auth/login` returning `{ user, accessToken }` and setting the refresh cookie.

- [ ] Create Zod `registerSchema`/`loginSchema` + generic `validate` middleware.
- [ ] Create `register` + `login` controllers (hash via model, issue tokens, persist hashed refresh token, set httpOnly cookie).
- [ ] Wire `cookie-parser` + mount `/api/auth` in `app.ts`.
- [ ] Tests: register succeeds; duplicate email → 409; login wrong password → 401; login success returns accessToken + sets cookie.
- [ ] Commit: `feat(server): add register and login with jwt issuance`

### Task 4: Protected routes — auth middleware, me, refresh, logout, RBAC

**Files:** create `middleware/auth.ts`; modify `controllers/auth.ts`, `routes/auth.ts`; extend `test/auth.routes.test.ts`.

**Interfaces:**
- Produces: `requireAuth` (verifies access token → `req.user = { id, role }`), `requireRole(...roles)`; `GET /api/auth/me`, `POST /api/auth/refresh`, `POST /api/auth/logout`.

- [ ] Create `requireAuth` + `requireRole` middleware.
- [ ] Add `me` (protected), `refresh` (rotate refresh token), `logout` (revoke + clear cookie).
- [ ] Tests: `/me` without token → 401; with token → 200 user; refresh issues new access token; logout revokes.
- [ ] Commit: `feat(server): add protected me route, token refresh, logout, and rbac`

---

## Self-Review

- Spec Milestone 2 (User model, JWT+refresh, bcrypt, httpOnly cookies, CORS, RBAC) → Tasks 1–4 cover all; CORS credentials already enabled in `app.ts` from Milestone 0.
- No placeholders; each task has concrete deliverable + tests + commit.
- Type names consistent: `comparePassword`, `signAccessToken`, `verifyAccessToken`, `signRefreshToken`, `verifyRefreshToken`, `RefreshToken`, `requireAuth`, `requireRole`, `registerSchema`, `loginSchema`, `validate` reused across tasks.
- Deferred to Milestone 3+: products, search, client-side auth wiring (Axios interceptor).
