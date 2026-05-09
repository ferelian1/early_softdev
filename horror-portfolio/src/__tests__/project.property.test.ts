/**
 * Property 11: Project Data Validation Rejects Invalid Inputs
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 *
 * Uses fast-check to generate arbitrary candidate objects and assert
 * validateProject accepts only objects satisfying all four field constraints
 * simultaneously.
 */

import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import { validateProject } from "../types/project"
import { Flame, Skull, Eye } from "lucide-react"

// ---------------------------------------------------------------------------
// Helpers / Arbitraries
// ---------------------------------------------------------------------------

/** Generates valid kebab-case ids like "my-project-1" */
const validIdArb = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{0,9}$/),
    fc.array(fc.stringMatching(/^[a-z0-9]{1,8}$/), { minLength: 0, maxLength: 3 })
  )
  .map(([head, tail]) => (tail.length > 0 ? `${head}-${tail.join("-")}` : head))

/** Generates non-empty strings up to 120 chars */
const validDescriptionArb = fc
  .string({ minLength: 1, maxLength: 120 })
  .filter((s) => s.trim().length > 0)

/** Generates non-empty arrays of non-empty strings */
const validTagsArb = fc.array(
  fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
  { minLength: 1, maxLength: 5 }
)

const validIcons = [Flame, Skull, Eye]
const validIconArb = fc.constantFrom(...validIcons)

/** Generates a fully valid Project-shaped object */
const validProjectArb = fc.record({
  id: validIdArb,
  name: fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0),
  description: validDescriptionArb,
  icon: validIconArb,
  tags: validTagsArb,
})

// ---------------------------------------------------------------------------
// Property 11 — valid projects always pass
// ---------------------------------------------------------------------------

describe("Property 11: Project Data Validation Rejects Invalid Inputs", () => {
  it("accepts any object satisfying all four field constraints simultaneously", () => {
    fc.assert(
      fc.property(validProjectArb, (candidate) => {
        expect(() => validateProject(candidate)).not.toThrow()
        const result = validateProject(candidate)
        expect(result).toEqual(candidate)
      })
    )
  })

  // -------------------------------------------------------------------------
  // Invalid id
  // -------------------------------------------------------------------------

  it("rejects a project with an empty id", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.constant(""),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: validDescriptionArb,
          icon: validIconArb,
          tags: validTagsArb,
        }),
        (candidate) => {
          expect(() => validateProject(candidate)).toThrow()
        }
      )
    )
  })

  it("rejects a project whose id is not kebab-case", () => {
    // Strings that contain uppercase letters, spaces, or leading hyphens
    const invalidIdArb = fc.oneof(
      fc.string({ minLength: 1 }).filter((s) => /[A-Z\s]/.test(s)),
      fc.constant("_underscore"),
      fc.constant("-leading-hyphen"),
      fc.constant("trailing-hyphen-"),
      fc.constant("double--hyphen"),
      fc.constant("123starts-with-digit")
    )

    fc.assert(
      fc.property(
        fc.record({
          id: invalidIdArb,
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: validDescriptionArb,
          icon: validIconArb,
          tags: validTagsArb,
        }),
        (candidate) => {
          expect(() => validateProject(candidate)).toThrow()
        }
      )
    )
  })

  // -------------------------------------------------------------------------
  // Invalid name
  // -------------------------------------------------------------------------

  it("rejects a project with an empty name", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: validIdArb,
          name: fc.constant(""),
          description: validDescriptionArb,
          icon: validIconArb,
          tags: validTagsArb,
        }),
        (candidate) => {
          expect(() => validateProject(candidate)).toThrow()
        }
      )
    )
  })

  it("rejects a project with a non-string name", () => {
    const nonStringArb = fc.oneof(
      fc.integer(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined),
      fc.array(fc.string())
    )

    fc.assert(
      fc.property(
        fc.record({
          id: validIdArb,
          name: nonStringArb,
          description: validDescriptionArb,
          icon: validIconArb,
          tags: validTagsArb,
        }),
        (candidate) => {
          expect(() => validateProject(candidate)).toThrow()
        }
      )
    )
  })

  // -------------------------------------------------------------------------
  // Invalid description
  // -------------------------------------------------------------------------

  it("rejects a project with a description longer than 120 characters", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: validIdArb,
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: fc.string({ minLength: 121, maxLength: 300 }),
          icon: validIconArb,
          tags: validTagsArb,
        }),
        (candidate) => {
          expect(() => validateProject(candidate)).toThrow()
        }
      )
    )
  })

  it("rejects a project with an empty description", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: validIdArb,
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: fc.constant(""),
          icon: validIconArb,
          tags: validTagsArb,
        }),
        (candidate) => {
          expect(() => validateProject(candidate)).toThrow()
        }
      )
    )
  })

  // -------------------------------------------------------------------------
  // Invalid tags
  // -------------------------------------------------------------------------

  it("rejects a project with an empty tags array", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: validIdArb,
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: validDescriptionArb,
          icon: validIconArb,
          tags: fc.constant([] as string[]),
        }),
        (candidate) => {
          expect(() => validateProject(candidate)).toThrow()
        }
      )
    )
  })

  it("rejects a project whose tags array contains at least one empty string", () => {
    // Array with at least one empty string mixed in
    const tagsWithEmptyArb = fc
      .array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 4 })
      .map((arr) => [...arr, ""])
      .filter((arr) => arr.length > 0)

    fc.assert(
      fc.property(
        fc.record({
          id: validIdArb,
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: validDescriptionArb,
          icon: validIconArb,
          tags: tagsWithEmptyArb,
        }),
        (candidate) => {
          expect(() => validateProject(candidate)).toThrow()
        }
      )
    )
  })

  it("rejects a project whose tags array contains non-string elements", () => {
    const tagsWithNonStringArb = fc
      .array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 4 })
      .map((arr) => [...arr, 42 as unknown as string])

    fc.assert(
      fc.property(
        fc.record({
          id: validIdArb,
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: validDescriptionArb,
          icon: validIconArb,
          tags: tagsWithNonStringArb,
        }),
        (candidate) => {
          expect(() => validateProject(candidate)).toThrow()
        }
      )
    )
  })

  // -------------------------------------------------------------------------
  // Non-object candidates
  // -------------------------------------------------------------------------

  it("rejects null, primitives, and arrays as top-level candidates", () => {
    const nonObjectArb = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.integer(),
      fc.string(),
      fc.boolean(),
      fc.array(fc.anything())
    )

    fc.assert(
      fc.property(nonObjectArb, (candidate) => {
        expect(() => validateProject(candidate)).toThrow()
      })
    )
  })
})

// ---------------------------------------------------------------------------
// Unit tests — specific examples
// ---------------------------------------------------------------------------

describe("validateProject — unit examples", () => {
  const validProject = {
    id: "silent-gateway",
    name: "THE SILENT GATEWAY",
    description: "A high-throughput gRPC gateway.",
    icon: Skull,
    tags: ["Node.js", "gRPC"],
  }

  it("accepts a fully valid project", () => {
    expect(() => validateProject(validProject)).not.toThrow()
  })

  it("returns the project object unchanged when valid", () => {
    expect(validateProject(validProject)).toEqual(validProject)
  })

  it("rejects id with uppercase letters", () => {
    expect(() => validateProject({ ...validProject, id: "SilentGateway" })).toThrow()
  })

  it("rejects id with spaces", () => {
    expect(() => validateProject({ ...validProject, id: "silent gateway" })).toThrow()
  })

  it("rejects description exactly 121 chars", () => {
    const longDesc = "a".repeat(121)
    expect(() => validateProject({ ...validProject, description: longDesc })).toThrow()
  })

  it("accepts description exactly 120 chars", () => {
    const maxDesc = "a".repeat(120)
    expect(() => validateProject({ ...validProject, description: maxDesc })).not.toThrow()
  })

  it("rejects tags: []", () => {
    expect(() => validateProject({ ...validProject, tags: [] })).toThrow()
  })

  it("rejects tags containing an empty string", () => {
    expect(() => validateProject({ ...validProject, tags: ["Node.js", ""] })).toThrow()
  })

  it("rejects icon that is a plain string", () => {
    expect(() => validateProject({ ...validProject, icon: "Skull" as unknown as typeof Skull })).toThrow()
  })

  it("rejects icon that is null", () => {
    expect(() => validateProject({ ...validProject, icon: null as unknown as typeof Skull })).toThrow()
  })

  it("rejects icon that is a plain number", () => {
    expect(() => validateProject({ ...validProject, icon: 42 as unknown as typeof Skull })).toThrow()
  })
})
