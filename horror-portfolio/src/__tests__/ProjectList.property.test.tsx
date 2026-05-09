/**
 * Property 9: All Projects Are Rendered with Correct Typography and Tags
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 */

import { describe, it, expect, vi } from "vitest"
import { render, cleanup } from "@testing-library/react"
import * as fc from "fast-check"
import { Flame, Skull, Eye } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import ProjectList from "../components/sections/ProjectList"
import type { Project } from "@/types/project"

// ---------------------------------------------------------------------------
// Mock framer-motion — jsdom does not support animations
// ---------------------------------------------------------------------------

vi.mock("framer-motion", () => ({
  motion: {
    ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul {...props}>{children}</ul>
    ),
    li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
      <li {...props}>{children}</li>
    ),
  },
}))

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** The three allowed Lucide icons */
const ICONS: LucideIcon[] = [Flame, Skull, Eye]

/** Arbitrary for a non-empty kebab-case id */
const arbId = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]*$/),
    fc.array(fc.stringMatching(/^[a-z0-9]+$/), { minLength: 0, maxLength: 3 }),
  )
  .map(([head, parts]) => (parts.length > 0 ? `${head}-${parts.join("-")}` : head))

/** Arbitrary for a non-empty string (no leading/trailing whitespace to keep assertions simple) */
const arbNonEmptyString = fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0)

/** Arbitrary for a description ≤ 120 chars */
const arbDescription = fc
  .string({ minLength: 1, maxLength: 120 })
  .filter((s) => s.trim().length > 0)

/** Arbitrary for a non-empty array of non-empty tag strings */
const arbTags = fc.array(arbNonEmptyString, { minLength: 1, maxLength: 5 })

/** Arbitrary for a single valid Project */
const arbProject: fc.Arbitrary<Project> = fc
  .tuple(arbId, arbNonEmptyString, arbDescription, fc.constantFrom(...ICONS), arbTags)
  .map(([id, name, description, icon, tags]) => ({ id, name, description, icon, tags }))

/** Arbitrary for a non-empty array of valid Projects with unique ids */
const arbProjects: fc.Arbitrary<Project[]> = fc
  .array(arbProject, { minLength: 1, maxLength: 8 })
  .map((projects) => {
    // Deduplicate by id to avoid React key warnings
    const seen = new Set<string>()
    return projects.filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
  })
  .filter((projects) => projects.length >= 1)

// ---------------------------------------------------------------------------
// Property 9: All Projects Are Rendered with Correct Typography and Tags
// Validates: Requirements 5.1, 5.2, 5.3, 5.4
// ---------------------------------------------------------------------------

describe("Property 9: All Projects Are Rendered with Correct Typography and Tags", () => {
  /**
   * For any non-empty array of valid Project objects, ProjectList SHALL:
   *   - Render every project's name in the DOM (Req 5.1, 5.2)
   *   - Render every project's description in the DOM (Req 5.1, 5.3)
   *   - Render all tags as visible labels (Req 5.4)
   *   - Apply font-oswald class to name elements (Req 5.2)
   *   - Apply font-playfair class to description elements (Req 5.3)
   *
   * Validates: Requirements 5.1, 5.2, 5.3, 5.4
   */
  it("renders every project name, description, and tags with correct font classes", () => {
    fc.assert(
      fc.property(arbProjects, (projects) => {
        const { getAllByTestId } = render(<ProjectList projects={projects} />)

        try {
          // --- Req 5.1: every project is rendered as a distinct row ---
          const nameEls = getAllByTestId("project-name")
          const descEls = getAllByTestId("project-description")

          expect(nameEls).toHaveLength(projects.length)
          expect(descEls).toHaveLength(projects.length)

          // --- Req 5.2: name appears in DOM with font-oswald class ---
          projects.forEach((project) => {
            const nameEl = nameEls.find((el) => el.textContent === project.name)
            expect(nameEl, `name "${project.name}" not found`).toBeDefined()
            expect(nameEl!.classList.contains("font-oswald")).toBe(true)
          })

          // --- Req 5.3: description appears in DOM with font-playfair class ---
          projects.forEach((project) => {
            const descEl = descEls.find((el) => el.textContent === project.description)
            expect(descEl, `description for "${project.name}" not found`).toBeDefined()
            expect(descEl!.classList.contains("font-playfair")).toBe(true)
          })

          // --- Req 5.4: all tags appear as visible labels ---
          const tagEls = getAllByTestId("project-tag")
          const renderedTagTexts = tagEls.map((el) => el.textContent ?? "")

          projects.forEach((project) => {
            project.tags.forEach((tag) => {
              expect(
                renderedTagTexts,
                `tag "${tag}" for project "${project.name}" not found`
              ).toContain(tag)
            })
          })
        } finally {
          // Clean up DOM between property runs to avoid element accumulation
          cleanup()
        }
      }),
      { numRuns: 50 }
    )
  })
})
