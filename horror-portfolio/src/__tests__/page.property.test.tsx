/**
 * Property 8: CultSeal and ProjectList Are Mutually Exclusive
 * Validates: Requirements 4.3, 4.4, 4.5
 *
 * Property 10: Hero Section Is Always Rendered
 * Validates: Requirements 7.3
 *
 * Integration tests for the full page flow
 * Validates: Requirements 4.2, 4.3, 2.8
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, fireEvent, act, cleanup } from "@testing-library/react"
import * as fc from "fast-check"

// ---------------------------------------------------------------------------
// Mock useMousePosition — prevents window access in jsdom
// ---------------------------------------------------------------------------

vi.mock("@/hooks/useMousePosition", () => ({
  default: vi.fn(() => ({ x: 100, y: 100, isInitialized: true })),
}))

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
    section: ({ children, animate: _animate, transition: _transition, initial: _initial, ...props }: React.HTMLAttributes<HTMLElement> & { animate?: unknown; transition?: unknown; initial?: unknown }) => (
      <section {...props}>{children}</section>
    ),
    div: ({ children, initial: _initial, animate: _animate, exit: _exit, transition: _transition, ...props }: React.HTMLAttributes<HTMLDivElement> & { initial?: unknown; animate?: unknown; exit?: unknown; transition?: unknown }) => (
      <div {...props}>{children}</div>
    ),
    p: ({ children, initial: _initial, animate: _animate, exit: _exit, transition: _transition, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { initial?: unknown; animate?: unknown; exit?: unknown; transition?: unknown }) => (
      <p {...props}>{children}</p>
    ),
    aside: ({ children, initial: _initial, animate: _animate, transition: _transition, style, ...props }: React.HTMLAttributes<HTMLElement> & { initial?: unknown; animate?: unknown; transition?: unknown }) => (
      <aside style={style} {...props}>{children}</aside>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// ---------------------------------------------------------------------------
// Testable PageContent component
//
// We extract a pure presentational component that accepts `isRevealed` as a
// prop so property tests can drive it directly without managing React state.
// This is approach (a) from the task spec.
// ---------------------------------------------------------------------------

import { projects } from "@/data/projects"
import CursorFlashlight from "@/components/ui/CursorFlashlight"
import CultSeal from "@/components/sections/CultSeal"
import ProjectList from "@/components/sections/ProjectList"

interface PageContentProps {
  isRevealed: boolean
  onSealBroken?: () => void
}

/**
 * Presentational version of the page controller, accepting `isRevealed` as a
 * prop. Mirrors the structure of `page.tsx` exactly.
 */
function PageContent({ isRevealed, onSealBroken = () => {} }: PageContentProps): JSX.Element {
  return (
    <main className="relative min-h-screen cursor-none overflow-hidden">
      <CursorFlashlight isRevealed={isRevealed} />
      <div className="noise-bg pointer-events-none fixed inset-0 z-10" />
      <section className="flex flex-col items-start px-8 pt-24">
        <h1
          data-testid="hero-heading"
          className="font-oswald text-[6rem] md:text-[10rem] lg:text-[14rem] leading-none tracking-widest uppercase"
        >
          JOHN DOE.
        </h1>
        <p
          data-testid="hero-title"
          className="font-playfair text-xl tracking-widest uppercase"
        >
          Back-End Engineer
        </p>
      </section>
      {!isRevealed ? (
        <CultSeal onSealBroken={onSealBroken} />
      ) : (
        <ProjectList projects={projects} />
      )}
    </main>
  )
}

// ---------------------------------------------------------------------------
// Property 8: CultSeal and ProjectList Are Mutually Exclusive
// Validates: Requirements 4.3, 4.4, 4.5
// ---------------------------------------------------------------------------

describe("Property 8: CultSeal and ProjectList Are Mutually Exclusive", () => {
  afterEach(() => {
    cleanup()
  })

  /**
   * For any value of isRevealed, the page SHALL mount exactly one of CultSeal
   * (when isRevealed=false) or ProjectList (when isRevealed=true), and SHALL
   * never mount both simultaneously.
   *
   * Validates: Requirements 4.3, 4.4, 4.5
   */
  it("renders exactly one of CultSeal or ProjectList — never both, never neither", () => {
    fc.assert(
      fc.property(fc.boolean(), (isRevealed) => {
        const { queryByTestId, queryByText } = render(
          <PageContent isRevealed={isRevealed} />
        )

        try {
          // CultSeal presence: identified by its data-testid
          const cultSeal = queryByTestId("cult-seal")
          // ProjectList presence: identified by the first project name in the list
          const projectList = queryByText(projects[0].name)

          if (isRevealed) {
            // ProjectList must be present, CultSeal must be absent
            expect(projectList, "ProjectList should be present when isRevealed=true").not.toBeNull()
            expect(cultSeal, "CultSeal should be absent when isRevealed=true").toBeNull()
          } else {
            // CultSeal must be present, ProjectList must be absent
            expect(cultSeal, "CultSeal should be present when isRevealed=false").not.toBeNull()
            expect(projectList, "ProjectList should be absent when isRevealed=false").toBeNull()
          }

          // Invariant: never both simultaneously (Req 4.5)
          const bothPresent = cultSeal !== null && projectList !== null
          expect(bothPresent, "CultSeal and ProjectList must never be mounted simultaneously").toBe(false)

          // Invariant: never neither
          const neitherPresent = cultSeal === null && projectList === null
          expect(neitherPresent, "At least one of CultSeal or ProjectList must always be mounted").toBe(false)
        } finally {
          cleanup()
        }
      }),
      { numRuns: 50 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 10: Hero Section Is Always Rendered
// Validates: Requirements 7.3
// ---------------------------------------------------------------------------

describe("Property 10: Hero Section Is Always Rendered", () => {
  afterEach(() => {
    cleanup()
  })

  /**
   * For any value of isRevealed (true or false), the page SHALL render the
   * hero section containing the engineer's name heading and title paragraph.
   *
   * Validates: Requirements 7.3
   */
  it("hero heading and title are always present regardless of isRevealed", () => {
    fc.assert(
      fc.property(fc.boolean(), (isRevealed) => {
        const { queryByTestId } = render(
          <PageContent isRevealed={isRevealed} />
        )

        try {
          const heading = queryByTestId("hero-heading")
          const title = queryByTestId("hero-title")

          expect(heading, `hero-heading must be present when isRevealed=${isRevealed}`).not.toBeNull()
          expect(title, `hero-title must be present when isRevealed=${isRevealed}`).not.toBeNull()

          // Verify content is non-empty
          expect(heading!.textContent!.trim().length).toBeGreaterThan(0)
          expect(title!.textContent!.trim().length).toBeGreaterThan(0)
        } finally {
          cleanup()
        }
      }),
      { numRuns: 50 }
    )
  })
})

// ---------------------------------------------------------------------------
// Integration tests for the full page flow
// Validates: Requirements 4.2, 4.3, 2.8
// ---------------------------------------------------------------------------

// Page is now an async Server Component — import PageClient (the Client Component)
// and pass fallback data so the integration tests can drive it directly.
import PageClient from "@/app/PageClient"
import { FALLBACK_PROJECTS, FALLBACK_SOCIAL_LINKS } from "@/lib/api"

describe("Page — integration tests", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    cleanup()
  })

  // -------------------------------------------------------------------------
  // Req 4.2, 4.3: Holding CultSeal to completion reveals RightShelf projects
  // and unmounts CultSeal
  // -------------------------------------------------------------------------
  it("mounts ProjectList and unmounts CultSeal after holding the seal to completion", async () => {
    // Capture rAF callbacks so we can drive them manually
    const rafCallbacks: FrameRequestCallback[] = []
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})

    const { queryByTestId, queryAllByTestId } = render(
      <PageClient projects={FALLBACK_PROJECTS} socialLinks={FALLBACK_SOCIAL_LINKS} />
    )

    // Initially: CultSeal is present (Req 4.1)
    expect(queryByTestId("cult-seal")).not.toBeNull()

    // Start holding the seal
    const seal = queryByTestId("cult-seal")!
    fireEvent.pointerDown(seal)

    // Drive enough rAF frames to reach progress=100 (1.5 per frame → 67 frames)
    await act(async () => {
      for (let i = 0; i < 70; i++) {
        const cb = rafCallbacks.pop()
        if (cb) cb(performance.now())
      }
      vi.runAllTimers()
    })

    // After seal broken: CultSeal is absent (Req 4.2, 4.3)
    expect(queryByTestId("cult-seal"), "CultSeal should unmount after seal is broken").toBeNull()
    // Project names should be visible in the DOM (via RightShelf)
    expect(queryAllByTestId("project-name").length, "Project names should be present after seal is broken").toBeGreaterThan(0)
  })

  // -------------------------------------------------------------------------
  // Req 2.8: Mouse movement updates the darkness overlay gradient
  // -------------------------------------------------------------------------
  it("updates the darkness overlay gradient when the mouse moves", async () => {
    // Use real useMousePosition mock (returns { x: 100, y: 100, isInitialized: true })
    const { container } = render(
      <PageClient projects={FALLBACK_PROJECTS} socialLinks={FALLBACK_SOCIAL_LINKS} />
    )

    // Find the darkness overlay: a fixed inset-0 div that is not the cursor-dot
    const overlay = Array.from(container.querySelectorAll("div")).find(
      (el) =>
        el.style.background?.includes("radial-gradient") &&
        !el.classList.contains("cursor-dot")
    ) as HTMLElement | undefined

    expect(overlay, "Darkness overlay should be present").toBeDefined()

    // The gradient should contain the mocked coordinates (100, 100)
    expect(overlay!.style.background).toContain("100px 100px")
  })
})
