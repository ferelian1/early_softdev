import * as fc from 'fast-check';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { SocialIcon } from './schemas/social-link.schema';

/**
 * SocialLinksModule — Property-Based Tests
 *
 * Validates: Requirements 10.2, 10.4
 */

const VALID_ICONS = Object.values(SocialIcon);

describe('SocialLinksModule — Property Tests', () => {
  // ─── Property 10: Schema validation rejects invalid data ─────────────────
  /**
   * Validates: Requirements 10.2, 10.4
   */
  describe('Property 10: Schema validation rejects invalid data', () => {
    it('should reject social links with invalid href (not https:// or mailto:)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            label: fc.string({ minLength: 1 }),
            href: fc.string().filter(
              (s) =>
                !s.startsWith('https://') &&
                !s.startsWith('http://') &&
                !s.startsWith('mailto:'),
            ),
            icon: fc.constantFrom(...VALID_ICONS),
            handle: fc.string({ minLength: 1 }),
          }),
          async (data) => {
            const dto = plainToInstance(CreateSocialLinkDto, data);
            const errors = await validate(dto);
            expect(errors.some((e) => e.property === 'href')).toBe(true);
          },
        ),
        { numRuns: 50 },
      );
    });

    it('should reject social links with icon outside the SocialIcon enum', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            label: fc.string({ minLength: 1 }),
            href: fc.constant('https://example.com'),
            icon: fc.string().filter((s) => !VALID_ICONS.includes(s as SocialIcon)),
            handle: fc.string({ minLength: 1 }),
          }),
          async (data) => {
            const dto = plainToInstance(CreateSocialLinkDto, data);
            const errors = await validate(dto);
            expect(errors.some((e) => e.property === 'icon')).toBe(true);
          },
        ),
        { numRuns: 50 },
      );
    });

    it('should accept valid social links with correct href and icon', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            label: fc.string({ minLength: 1 }),
            href: fc.oneof(
              fc.webUrl().map((url) => `https://${url.replace(/^https?:\/\//, '')}`),
              fc.emailAddress().map((email) => `mailto:${email}`),
            ),
            icon: fc.constantFrom(...VALID_ICONS),
            handle: fc.string({ minLength: 1 }),
          }),
          async (data) => {
            const dto = plainToInstance(CreateSocialLinkDto, data);
            const errors = await validate(dto);
            const hrefErrors = errors.filter((e) => e.property === 'href');
            const iconErrors = errors.filter((e) => e.property === 'icon');
            expect(hrefErrors).toHaveLength(0);
            expect(iconErrors).toHaveLength(0);
          },
        ),
        { numRuns: 30 },
      );
    });
  });
});
