/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Mirrors the validate() function from ProjectForm.tsx.
 * Extracted as a pure function for property testing.
 */
function validateProjectForm(data: {
  title: string;
  techStack: string;
  description: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.title.trim()) errors.title = 'TITLE IS REQUIRED';
  if (!data.description.trim()) errors.description = 'DESCRIPTION IS REQUIRED';
  if (data.description.length > 120) errors.description = 'DESCRIPTION EXCEEDS 120 CHARACTERS';
  const tags = data.techStack.split(',').map((t) => t.trim()).filter(Boolean);
  if (tags.length === 0) errors.tech_stack = 'AT LEAST ONE TECH STACK ENTRY IS REQUIRED';
  return errors;
}

/**
 * Validates: Requirements 5.2, 5.3, 5.4, 6.3
 */
describe('Projects Panel — Property Tests', () => {
  describe('Property 8: Form validation rejects invalid inputs', () => {
    it('should reject empty title', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.constant(''),
            techStack: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1, maxLength: 120 }),
          }),
          (data) => {
            const errors = validateProjectForm(data);
            expect(errors.title).toBeDefined();
          },
        ),
        { numRuns: 20 },
      );
    });

    it('should reject whitespace-only title', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.stringMatching(/^ +$/).filter((s) => s.length >= 1 && s.length <= 20),
            techStack: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1, maxLength: 120 }),
          }),
          (data) => {
            const errors = validateProjectForm(data);
            expect(errors.title).toBeDefined();
          },
        ),
        { numRuns: 20 },
      );
    });

    it('should reject description longer than 120 characters', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 1 }),
            techStack: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 121, maxLength: 500 }),
          }),
          (data) => {
            const errors = validateProjectForm(data);
            expect(errors.description).toBeDefined();
          },
        ),
        { numRuns: 20 },
      );
    });

    it('should reject empty tech_stack (no comma-separated entries)', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 1 }),
            techStack: fc.constantFrom('', '   ', ',,,', ' , , '),
            description: fc.string({ minLength: 1, maxLength: 120 }),
          }),
          (data) => {
            const errors = validateProjectForm(data);
            expect(errors.tech_stack).toBeDefined();
          },
        ),
        { numRuns: 20 },
      );
    });

    it('should accept valid inputs with no errors', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0),
            techStack: fc.string({ minLength: 1, maxLength: 100 }).filter((s) =>
              s.split(',').map((t) => t.trim()).filter(Boolean).length > 0,
            ),
            description: fc.string({ minLength: 1, maxLength: 120 }).filter((s) => s.trim().length > 0),
          }),
          (data) => {
            const errors = validateProjectForm(data);
            expect(Object.keys(errors)).toHaveLength(0);
          },
        ),
        { numRuns: 50 },
      );
    });
  });
});
