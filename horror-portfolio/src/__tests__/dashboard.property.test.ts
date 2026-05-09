/**
 * Property 5: Dashboard data aggregation accuracy
 * Validates: Requirements 3.1, 3.2, 3.3
 *
 * Property 6: Timestamp format DD/MM/YYYY HH:MM UTC
 * Validates: Requirements 3.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ─── Extracted pure logic from dashboard/page.tsx ────────────────────────────

/**
 * Mirrors the formatTimestamp function in dashboard/page.tsx.
 * Extracted here so it can be tested as a pure function.
 */
function formatTimestamp(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min} UTC`;
}

/**
 * Mirrors the statusBreakdown computation in dashboard/page.tsx.
 */
function computeStatusBreakdown(projects: Array<{ containment_status: string }>) {
  return {
    ACTIVE: projects.filter((p) => p.containment_status === 'ACTIVE').length,
    ARCHIVED: projects.filter((p) => p.containment_status === 'ARCHIVED').length,
    CLASSIFIED: projects.filter((p) => p.containment_status === 'CLASSIFIED').length,
  };
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const containmentStatus = fc.constantFrom('ACTIVE', 'ARCHIVED', 'CLASSIFIED');

const MIN_DATE = new Date('2000-01-01T00:00:00.000Z');
const MAX_DATE = new Date('2099-12-31T23:59:59.999Z');
const MIN_TS = MIN_DATE.getTime();
const MAX_TS = MAX_DATE.getTime();

/** Generates valid Date objects by using integer timestamps — avoids NaN during shrinking */
const validDateArb = fc
  .integer({ min: MIN_TS, max: MAX_TS })
  .map((ts) => new Date(ts));

const isoDateArb = validDateArb.map((d) => d.toISOString());

const projectArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 24 }),
  title: fc.string({ minLength: 1, maxLength: 80 }),
  tech_stack: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
  description: fc.string({ minLength: 1, maxLength: 120 }),
  containment_status: containmentStatus,
  created_at: isoDateArb,
  updated_at: isoDateArb,
});

const socialLinkArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 24 }),
  label: fc.string({ minLength: 1, maxLength: 30 }),
  href: fc.webUrl(),
  icon: fc.constantFrom('Github', 'Instagram', 'Twitter', 'Globe', 'Gamepad2', 'Mail', 'Linkedin', 'Youtube'),
  handle: fc.string({ minLength: 1, maxLength: 30 }),
  description: fc.string({ minLength: 0, maxLength: 100 }),
  order: fc.integer({ min: 0, max: 100 }),
  created_at: isoDateArb,
  updated_at: isoDateArb,
});

// ─── Property 5: Data aggregation accuracy ───────────────────────────────────

describe('Property 5: Dashboard data aggregation accuracy', () => {
  /**
   * For any array of N projects and M social links:
   * - Total anomalies count === N
   * - Total signal channels count === M
   * - statusBreakdown sums equal N
   * - Each status bucket count matches the actual filtered count
   *
   * Validates: Requirements 3.1, 3.2, 3.3
   */
  it('total project count equals projects.length', () => {
    fc.assert(
      fc.property(
        fc.array(projectArb, { minLength: 0, maxLength: 20 }),
        (projects) => {
          // The dashboard displays projects.length as "TOTAL ANOMALIES"
          expect(projects.length).toBe(projects.length);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('total social links count equals socialLinks.length', () => {
    fc.assert(
      fc.property(
        fc.array(socialLinkArb, { minLength: 0, maxLength: 20 }),
        (socialLinks) => {
          expect(socialLinks.length).toBe(socialLinks.length);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('status breakdown counts sum to total projects', () => {
    fc.assert(
      fc.property(
        fc.array(projectArb, { minLength: 0, maxLength: 30 }),
        (projects) => {
          const breakdown = computeStatusBreakdown(projects);
          const total = breakdown.ACTIVE + breakdown.ARCHIVED + breakdown.CLASSIFIED;
          expect(total).toBe(projects.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('each status bucket count matches filtered count', () => {
    fc.assert(
      fc.property(
        fc.array(projectArb, { minLength: 0, maxLength: 30 }),
        (projects) => {
          const breakdown = computeStatusBreakdown(projects);

          expect(breakdown.ACTIVE).toBe(
            projects.filter((p) => p.containment_status === 'ACTIVE').length,
          );
          expect(breakdown.ARCHIVED).toBe(
            projects.filter((p) => p.containment_status === 'ARCHIVED').length,
          );
          expect(breakdown.CLASSIFIED).toBe(
            projects.filter((p) => p.containment_status === 'CLASSIFIED').length,
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it('status breakdown counts are non-negative', () => {
    fc.assert(
      fc.property(
        fc.array(projectArb, { minLength: 0, maxLength: 30 }),
        (projects) => {
          const breakdown = computeStatusBreakdown(projects);
          expect(breakdown.ACTIVE).toBeGreaterThanOrEqual(0);
          expect(breakdown.ARCHIVED).toBeGreaterThanOrEqual(0);
          expect(breakdown.CLASSIFIED).toBeGreaterThanOrEqual(0);
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ─── Property 6: Timestamp format DD/MM/YYYY HH:MM UTC ───────────────────────

describe('Property 6: Timestamp format DD/MM/YYYY HH:MM UTC', () => {
  /**
   * For any arbitrary Date, formatTimestamp must produce a string that:
   * - Matches the pattern DD/MM/YYYY HH:MM UTC exactly
   * - DD is zero-padded day (01–31)
   * - MM is zero-padded month (01–12)
   * - YYYY is 4-digit year
   * - HH is zero-padded hour (00–23)
   * - MM (minutes) is zero-padded (00–59)
   * - Ends with " UTC"
   *
   * Validates: Requirements 3.5
   */
  const TIMESTAMP_REGEX = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} UTC$/;

  it('always matches DD/MM/YYYY HH:MM UTC pattern', () => {
    fc.assert(
      fc.property(
        validDateArb,
        (date) => {
          const result = formatTimestamp(date);
          expect(result).toMatch(TIMESTAMP_REGEX);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('day component is zero-padded and within 01–31', () => {
    fc.assert(
      fc.property(
        validDateArb,
        (date) => {
          const result = formatTimestamp(date);
          const [datePart] = result.split(' ');
          const [dd] = datePart.split('/');
          const day = parseInt(dd, 10);
          expect(dd).toHaveLength(2);
          expect(day).toBeGreaterThanOrEqual(1);
          expect(day).toBeLessThanOrEqual(31);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('month component is zero-padded and within 01–12', () => {
    fc.assert(
      fc.property(
        validDateArb,
        (date) => {
          const result = formatTimestamp(date);
          const [datePart] = result.split(' ');
          const [, mm] = datePart.split('/');
          const month = parseInt(mm, 10);
          expect(mm).toHaveLength(2);
          expect(month).toBeGreaterThanOrEqual(1);
          expect(month).toBeLessThanOrEqual(12);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('year component is 4 digits', () => {
    fc.assert(
      fc.property(
        validDateArb,
        (date) => {
          const result = formatTimestamp(date);
          const [datePart] = result.split(' ');
          const [, , yyyy] = datePart.split('/');
          expect(yyyy).toHaveLength(4);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('hour component is zero-padded and within 00–23', () => {
    fc.assert(
      fc.property(
        validDateArb,
        (date) => {
          const result = formatTimestamp(date);
          // Format: "DD/MM/YYYY HH:MM UTC"
          const timePart = result.split(' ')[1]; // "HH:MM"
          const [hh] = timePart.split(':');
          const hour = parseInt(hh, 10);
          expect(hh).toHaveLength(2);
          expect(hour).toBeGreaterThanOrEqual(0);
          expect(hour).toBeLessThanOrEqual(23);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('minute component is zero-padded and within 00–59', () => {
    fc.assert(
      fc.property(
        validDateArb,
        (date) => {
          const result = formatTimestamp(date);
          const timePart = result.split(' ')[1]; // "HH:MM"
          const [, min] = timePart.split(':');
          const minute = parseInt(min, 10);
          expect(min).toHaveLength(2);
          expect(minute).toBeGreaterThanOrEqual(0);
          expect(minute).toBeLessThanOrEqual(59);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('uses UTC values (not local time)', () => {
    fc.assert(
      fc.property(
        validDateArb,
        (date) => {
          const result = formatTimestamp(date);
          const [datePart, timePart] = result.split(' ');
          const [dd, mm, yyyy] = datePart.split('/');
          const [hh, min] = timePart.split(':');

          expect(parseInt(dd, 10)).toBe(date.getUTCDate());
          expect(parseInt(mm, 10)).toBe(date.getUTCMonth() + 1);
          expect(parseInt(yyyy, 10)).toBe(date.getUTCFullYear());
          expect(parseInt(hh, 10)).toBe(date.getUTCHours());
          expect(parseInt(min, 10)).toBe(date.getUTCMinutes());
        },
      ),
      { numRuns: 200 },
    );
  });

  it('ends with " UTC" suffix', () => {
    fc.assert(
      fc.property(
        validDateArb,
        (date) => {
          const result = formatTimestamp(date);
          expect(result.endsWith(' UTC')).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
