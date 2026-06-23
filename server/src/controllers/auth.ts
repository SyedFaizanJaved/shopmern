import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import type { Role } from '@app/types';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type TokenPayload,
} from '../utils/token';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errors';
import { env } from '../config/env';
import type { RegisterInput, LoginInput } from '../validation/auth';

export const REFRESH_COOKIE = 'refreshToken';
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Hash the refresh token (SHA-256) before storing — a DB leak can't be replayed.
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Cookie hardening: httpOnly (no JS access → XSS-safe), secure in prod (HTTPS
// only), sameSite (CSRF defense), scoped to the auth path.
function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: REFRESH_MAX_AGE_MS,
  };
}

// Issue an access token (returned in JSON) + a refresh token (httpOnly cookie),
// persisting the hashed refresh token so it can be revoked later.
async function issueTokens(res: Response, user: { id: string; role: Role }): Promise<string> {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  await RefreshToken.create({
    user: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_MAX_AGE_MS),
  });

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return accessToken;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterInput;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already in use', 409);

  const user = await User.create({ name, email, password });
  const accessToken = await issueTokens(res, { id: user.id, role: user.role });

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  // password is select:false, so opt it in for the comparison.
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    // Same message for "no user" and "wrong password" → don't leak which
    // emails exist (user enumeration defense).
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = await issueTokens(res, { id: user.id, role: user.role });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

// Protected: returns the currently authenticated user. requireAuth sets req.user.
export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// Exchange a valid refresh cookie for a new access token, ROTATING the refresh
// token (old one is revoked, a fresh one is issued) to limit replay damage.
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) throw new AppError('No refresh token', 401);

  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  // The token must exist in our store, be unrevoked, and unexpired.
  const stored = await RefreshToken.findOne({ tokenHash: hashToken(token) });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token revoked or expired', 401);
  }

  stored.revoked = true; // rotate: kill the old token
  await stored.save();

  const accessToken = await issueTokens(res, { id: payload.sub, role: payload.role });
  res.json({ accessToken });
});

// Revoke the refresh token server-side and clear the cookie.
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (token) {
    await RefreshToken.updateOne({ tokenHash: hashToken(token) }, { revoked: true });
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.status(204).end();
});
