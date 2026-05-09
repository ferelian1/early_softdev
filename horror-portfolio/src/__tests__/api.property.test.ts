/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { fetchProjects, fetchSocialLinks, FALLBACK_PROJECTS, FALLBACK_SOCIAL_LINKS } from '@/lib/api';

/**
 * Validates: Requirements 13.3, 13.4
 */
describe('api.ts — Property Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Property 16: Fallback always used when API fails ────────────────────
  describe('Property 16: Fallback always used when API fails', () => {
    it('fetchProjects should return FALLBACK_PROJECTS when fetch throws', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(), // arbitrary error message
          async (errorMsg) => {
            vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(errorMsg)));
            const result = await fetchProjects();
            expect(result).toEqual(FALLBACK_PROJECTS);
          },
        ),
        { numRuns: 20 },
      );
    });

    it('fetchSocialLinks should return FALLBACK_SOCIAL_LINKS when fetch throws', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(),
          async (errorMsg) => {
            vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(errorMsg)));
            const result = await fetchSocialLinks();
            expect(result).toEqual(FALLBACK_SOCIAL_LINKS);
          },
        ),
        { numRuns: 20 },
      );
    });
  });

  // ─── Property 17: Filter ACTIVE ──────────────────────────────────────────
  describe('Property 17: fetchProjects only returns ACTIVE projects', () => {
    it('should filter out non-ACTIVE projects from API response', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              title: fc.string({ minLength: 1 }),
              tech_stack: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
              description: fc.string({ minLength: 1, maxLength: 120 }),
              containment_status: fc.constantFrom('ACTIVE', 'ARCHIVED', 'CLASSIFIED'),
              created_at: fc.constant('2024-01-01T00:00:00.000Z'),
              updated_at: fc.constant('2024-01-01T00:00:00.000Z'),
            }),
            { minLength: 0, maxLength: 10 },
          ),
          async (projects) => {
            vi.stubGlobal(
              'fetch',
              vi.fn().mockResolvedValue({
                ok: true,
                json: async () => projects,
              }),
            );

            const result = await fetchProjects();

            // All returned projects must be ACTIVE
            result.forEach((p) => {
              expect(p.containment_status).toBe('ACTIVE');
            });

            // Count must match expected ACTIVE count
            const expectedActiveCount = projects.filter(
              (p) => p.containment_status === 'ACTIVE',
            ).length;
            expect(result.length).toBe(expectedActiveCount);
          },
        ),
        { numRuns: 30 },
      );
    });
  });
});
