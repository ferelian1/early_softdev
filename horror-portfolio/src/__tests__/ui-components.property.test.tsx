/**
 * Property 4: TerminalInput password masking
 * Validates: Requirements 2.9
 *
 * Property 7: TerminalTable renders all records
 * Validates: Requirements 4.2
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { TerminalInput } from '@/components/admin/TerminalInput';
import { TerminalTable } from '@/components/admin/TerminalTable';

describe('UI Components — Property Tests', () => {
  // ─── Property 4: TerminalInput password masking ───────────────────────────
  describe('Property 4: TerminalInput password masking', () => {
    /**
     * For any string input of length N, the displayed mask overlay
     * must show exactly N `█` characters.
     *
     * Validates: Requirements 2.9
     */
    it('should display exactly N █ characters for a password of length N', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (password) => {
            const { unmount } = render(
              <TerminalInput
                label="PASSWORD"
                value={password}
                onChange={() => {}}
                type="password"
              />,
            );

            // The mask overlay shows █ repeated value.length times
            const expectedMask = '█'.repeat(password.length);

            if (password.length > 0) {
              // Find the mask span (aria-hidden overlay)
              const maskSpan = document.querySelector('[aria-hidden="true"] span');
              expect(maskSpan?.textContent).toBe(expectedMask);
            } else {
              // Empty password — mask span should be empty or not present
              const maskSpan = document.querySelector('[aria-hidden="true"] span');
              expect(maskSpan?.textContent ?? '').toBe('');
            }

            unmount();
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  // ─── Property 7: TerminalTable renders all records ────────────────────────
  describe('Property 7: TerminalTable renders all records', () => {
    /**
     * For any array of N records, the table must render exactly N tbody rows.
     *
     * Validates: Requirements 4.2
     */
    it('should render exactly N rows for N records', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              title: fc.string({ minLength: 1, maxLength: 50 }),
              status: fc.constantFrom('ACTIVE', 'ARCHIVED', 'CLASSIFIED'),
            }),
            { minLength: 1, maxLength: 10 },
          ),
          (records) => {
            const columns = [
              { key: 'id', header: 'ID' },
              { key: 'title', header: 'TITLE' },
              { key: 'status', header: 'STATUS' },
            ];

            const { unmount } = render(
              <TerminalTable
                columns={columns}
                data={records as Record<string, unknown>[]}
              />,
            );

            // Should render exactly N data rows (tbody tr)
            const rows = document.querySelectorAll('tbody tr');
            expect(rows.length).toBe(records.length);

            unmount();
          },
        ),
        { numRuns: 30 },
      );
    });
  });
});
