import { describe, it, expect } from 'vitest';
import { signAccessToken, verifyAccessToken } from '../src/utils/token';

describe('jwt token utils', () => {
  it('signs a token with 3 parts and verifies its payload round-trips', () => {
    const token = signAccessToken({ sub: 'user-123', role: 'user' });

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature

    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('user-123');
    expect(decoded.role).toBe('user');
  });

  it('throws when the token signature has been tampered with', () => {
    const token = signAccessToken({ sub: 'user-123', role: 'user' });
    const tampered = token.slice(0, -3) + 'abc';

    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});
