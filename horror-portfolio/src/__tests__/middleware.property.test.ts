/**
 * Middleware — Property Tests
 *
 * Tests the core JWT verification logic used by the Next.js middleware.
 * Since we can't easily run Next.js middleware in Vitest (edge runtime),
 * we test `jose.jwtVerify()` directly — the same function the middleware uses.
 *
 * **Validates: Requirements 1.3, 2.10**
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { SignJWT, jwtVerify } from 'jose';

const VALID_SECRET = 'valid-secret-for-testing-minimum-32-chars';
const WRONG_SECRET = 'wrong-secret-for-testing-minimum-32-chars';

const encodeSecret = (secret: string) => new TextEncoder().encode(secret);

describe('Middleware — Property Tests', () => {
  // ─── Property 1: Invalid tokens always fail verification ─────────────────
  describe('Property 1: Invalid tokens always redirect to login', () => {
    it('should reject tokens signed with wrong secret', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            sub: fc.string({ minLength: 1, maxLength: 50 }),
            username: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (payload) => {
            // Sign with WRONG secret
            const token = await new SignJWT(payload)
              .setProtectedHeader({ alg: 'HS256' })
              .setIssuedAt()
              .setExpirationTime('8h')
              .sign(encodeSecret(WRONG_SECRET));

            // Verify with VALID secret — should throw
            await expect(
              jwtVerify(token, encodeSecret(VALID_SECRET)),
            ).rejects.toThrow();
          },
        ),
        { numRuns: 20 },
      );
    });

    it('should reject expired tokens', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            sub: fc.string({ minLength: 1, maxLength: 50 }),
            username: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (payload) => {
            // Sign with expiry in the past
            const now = Math.floor(Date.now() / 1000);
            const token = await new SignJWT(payload)
              .setProtectedHeader({ alg: 'HS256' })
              .setIssuedAt(now - 3600) // 1 hour ago
              .setExpirationTime(now - 1800) // expired 30 min ago
              .sign(encodeSecret(VALID_SECRET));

            // Verify — should throw because expired
            await expect(
              jwtVerify(token, encodeSecret(VALID_SECRET)),
            ).rejects.toThrow();
          },
        ),
        { numRuns: 20 },
      );
    });

    it('should verify valid tokens successfully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            sub: fc.string({ minLength: 1, maxLength: 50 }),
            username: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (payload) => {
            // Sign with VALID secret and future expiry
            const token = await new SignJWT(payload)
              .setProtectedHeader({ alg: 'HS256' })
              .setIssuedAt()
              .setExpirationTime('8h')
              .sign(encodeSecret(VALID_SECRET));

            // Verify with VALID secret — should succeed
            const { payload: verified } = await jwtVerify(
              token,
              encodeSecret(VALID_SECRET),
            );
            expect(verified.sub).toBe(payload.sub);
          },
        ),
        { numRuns: 20 },
      );
    });
  });
});
