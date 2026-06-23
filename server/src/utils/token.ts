import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from '@app/types';

// The data we embed inside every JWT. `sub` (subject) is the standard JWT
// claim for "who this token is about" — here, the user id.
export interface TokenPayload {
  sub: string;
  role: Role;
}

function sign(payload: TokenPayload, secret: string, ttl: string): string {
  const options: SignOptions = { expiresIn: ttl as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
}

function verify(token: string, secret: string): TokenPayload {
  // jwt.verify throws if the signature is invalid or the token is expired.
  return jwt.verify(token, secret) as unknown as TokenPayload;
}

export const signAccessToken = (payload: TokenPayload): string =>
  sign(payload, env.JWT_ACCESS_SECRET, env.ACCESS_TOKEN_TTL);

export const signRefreshToken = (payload: TokenPayload): string =>
  sign(payload, env.JWT_REFRESH_SECRET, env.REFRESH_TOKEN_TTL);

export const verifyAccessToken = (token: string): TokenPayload =>
  verify(token, env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token: string): TokenPayload =>
  verify(token, env.JWT_REFRESH_SECRET);
