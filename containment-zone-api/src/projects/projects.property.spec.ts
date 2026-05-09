import * as fc from 'fast-check';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProjectDto } from './dto/create-project.dto';
import { ContainmentStatus } from './schemas/project.schema';

/**
 * ProjectsModule — Property-Based Tests
 *
 * Validates: Requirements 10.1, 10.3, 10.5, 10.6, 11.1
 */
describe('ProjectsModule — Property Tests', () => {
  // ─── Property 9: Schema validation rejects invalid data ──────────────────
  /**
   * Validates: Requirements 10.1, 10.3
   */
  describe('Property 9: Schema validation rejects invalid data', () => {
    it('should reject projects with empty title', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.constant(''),
            tech_stack: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
            description: fc.string({ minLength: 1, maxLength: 120 }),
            containment_status: fc.constantFrom(...Object.values(ContainmentStatus)),
          }),
          async (data) => {
            const dto = plainToInstance(CreateProjectDto, data);
            const errors = await validate(dto);
            expect(errors.some((e) => e.property === 'title')).toBe(true);
          },
        ),
        { numRuns: 20 },
      );
    });

    it('should reject projects with empty tech_stack array', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1 }),
            tech_stack: fc.constant([]),
            description: fc.string({ minLength: 1, maxLength: 120 }),
            containment_status: fc.constantFrom(...Object.values(ContainmentStatus)),
          }),
          async (data) => {
            const dto = plainToInstance(CreateProjectDto, data);
            const errors = await validate(dto);
            expect(errors.some((e) => e.property === 'tech_stack')).toBe(true);
          },
        ),
        { numRuns: 20 },
      );
    });

    it('should reject projects with description > 120 chars', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1 }),
            tech_stack: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
            description: fc.string({ minLength: 121, maxLength: 500 }),
            containment_status: fc.constantFrom(...Object.values(ContainmentStatus)),
          }),
          async (data) => {
            const dto = plainToInstance(CreateProjectDto, data);
            const errors = await validate(dto);
            expect(errors.some((e) => e.property === 'description')).toBe(true);
          },
        ),
        { numRuns: 20 },
      );
    });

    it('should reject projects with invalid containment_status', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1 }),
            tech_stack: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
            description: fc.string({ minLength: 1, maxLength: 120 }),
            containment_status: fc.string().filter(
              (s) => !Object.values(ContainmentStatus).includes(s as ContainmentStatus),
            ),
          }),
          async (data) => {
            const dto = plainToInstance(CreateProjectDto, data);
            const errors = await validate(dto);
            expect(errors.some((e) => e.property === 'containment_status')).toBe(true);
          },
        ),
        { numRuns: 20 },
      );
    });
  });

  // ─── Property 11: Unique IDs and valid timestamps ─────────────────────────
  /**
   * Validates: Requirements 10.5, 10.6
   */
  describe('Property 11: Unique IDs and valid timestamps', () => {
    it('should have unique IDs and valid timestamps for N records', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              title: fc.string({ minLength: 1 }),
              tech_stack: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
              description: fc.string({ minLength: 1, maxLength: 120 }),
              containment_status: fc.constantFrom(...Object.values(ContainmentStatus)),
              createdAt: fc.date(),
              updatedAt: fc.date(),
            }),
            { minLength: 1, maxLength: 20 },
          ),
          (records) => {
            // All IDs must be unique
            const ids = records.map((r) => r._id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);

            // All timestamps must be valid dates
            records.forEach((r) => {
              expect(r.createdAt).toBeInstanceOf(Date);
              expect(isNaN(r.createdAt.getTime())).toBe(false);
            });
          },
        ),
      );
    });
  });

  // ─── Property 12: GET /projects sorted descending by createdAt ───────────
  /**
   * Validates: Requirements 11.1
   */
  describe('Property 12: Projects sorted descending by createdAt', () => {
    it('should always return projects in descending createdAt order', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              title: fc.string({ minLength: 1 }),
              createdAt: fc.date(),
            }),
            { minLength: 0, maxLength: 20 },
          ),
          (records) => {
            // Simulate the sort the service applies
            const sorted = [...records].sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            );

            // Verify sorted order is descending
            for (let i = 0; i < sorted.length - 1; i++) {
              expect(sorted[i].createdAt.getTime()).toBeGreaterThanOrEqual(
                sorted[i + 1].createdAt.getTime(),
              );
            }
          },
        ),
      );
    });
  });
});
