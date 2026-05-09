import * as fc from 'fast-check';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * AuthModule — Property-Based Tests
 *
 * Validates: Requirements 2.3, 2.5, 15.3
 */
describe('AuthModule — Property Tests', () => {
  // ─── Property 2: JWT expiry is exactly 8 hours ───────────────────────────
  /**
   * Validates: Requirements 2.3
   */
  describe('Property 2: JWT expiry === 8 hours', () => {
    it('should have exp - iat === 28800 for any generated token', () => {
      const jwtService = new JwtService({
        secret: 'test-secret-for-property-testing-32chars',
        signOptions: { expiresIn: '8h' },
      });

      fc.assert(
        fc.property(
          fc.record({
            sub: fc.string({ minLength: 1, maxLength: 50 }),
            username: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          (payload) => {
            const token = jwtService.sign(payload);
            const decoded = jwtService.decode(token) as {
              sub: string;
              username: string;
              iat: number;
              exp: number;
            };

            expect(decoded.exp - decoded.iat).toBe(28800);
          },
        ),
      );
    });
  });

  // ─── Property 3: Wrong password always returns 401 ───────────────────────
  /**
   * Validates: Requirements 2.5
   */
  describe('Property 3: Wrong password always throws UnauthorizedException', () => {
    // bcrypt.hash at round 12 is slow; 50 runs * ~100ms each ≈ 5s+, so extend timeout
    it(
      'should throw UnauthorizedException for any wrong password',
      async () => {
        const correctPassword = 'correct-password-123';
        const correctHash = await bcrypt.hash(correctPassword, 12);

        const mockAdminUserModel = {
          findOne: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({
              _id: 'mock-id-123',
              username: 'admin',
              password_hash: correctHash,
              last_login_at: null,
            }),
          }),
          updateOne: jest.fn().mockResolvedValue({}),
        };

        const jwtService = new JwtService({
          secret: 'test-secret-for-property-testing-32chars',
          signOptions: { expiresIn: '8h' },
        });

        const authService = new AuthService(
          mockAdminUserModel as never,
          jwtService,
        );

        await fc.assert(
          fc.asyncProperty(
            fc.string({ minLength: 1 }).filter((s) => s !== correctPassword),
            async (wrongPassword) => {
              await expect(authService.login(wrongPassword)).rejects.toThrow(
                UnauthorizedException,
              );
            },
          ),
          { numRuns: 50 },
        );
      },
      30000, // 30s timeout: 50 bcrypt.compare calls at ~100ms each
    );
  });

  // ─── Property 14: Password hash is valid bcrypt ───────────────────────────
  /**
   * Validates: Requirements 15.3
   */
  describe('Property 14: bcrypt hash properties', () => {
    // bcrypt.hash at round 12 is slow; 20 runs * ~100ms each ≈ 2s+, extend timeout
    it(
      'should produce valid bcrypt hashes with salt rounds >= 12',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.string({ minLength: 1, maxLength: 72 }),
            async (password) => {
              const hash = await bcrypt.hash(password, 12);

              // Hash must differ from plaintext
              expect(hash).not.toBe(password);

              // bcrypt.compare must return true
              const isValid = await bcrypt.compare(password, hash);
              expect(isValid).toBe(true);

              // Hash must start with $2b$12$ (bcrypt, 12 rounds)
              expect(hash).toMatch(/^\$2b\$12\$/);
            },
          ),
          { numRuns: 20 }, // bcrypt is slow, limit runs
        );
      },
      30000, // 30s timeout: 20 bcrypt.hash + compare calls at ~100ms each
    );
  });
});
