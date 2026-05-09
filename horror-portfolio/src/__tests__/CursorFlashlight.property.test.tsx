/**
 * Property 3: Unrevealed Flashlight Gradient Correctness
 * Validates: Requirements 2.2, 2.4, 2.8
 *
 * Property 4: Revealed Flashlight Gradient Correctness
 * Validates: Requirements 2.3, 2.5, 2.8
 *
 * Property 5: Cursor Dot Uses Left/Top Positioning Only
 * Validates: Requirements 2.6
 *
 * Unit tests for CursorFlashlight
 * Validates: Requirements 2.1, 2.7, 9.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render } from "@testing-library/react"
import * as fc from "fast-check"
import CursorFlashlight, { buildGradient } from "../components/ui/CursorFlashlight"

// ---------------------------------------------------------------------------
// Mock useMousePosition
// ---------------------------------------------------------------------------

vi.mock("@/hooks/useMousePosition", () => ({
  default: vi.fn(),
}))

import useMousePosition from "@/hooks/useMousePosition"

const mockUseMousePosition = useMousePosition as ReturnType<typeof vi.fn>

// ---------------------------------------------------------------------------
// Property 3: Unrevealed Flashlight Gradient Correctness
// ---------------------------------------------------------------------------

describe("Property 3: Unrevealed Flashlight Gradient Correctness", () => {
  it("buildGradient(x, y, false) always contains 300px, rgba(16, 21, 15, 0.99), and exact (x, y) coordinates", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10000, max: 10000 }),
        fc.integer({ min: -10000, max: 10000 }),
        (x, y) => {
          const gradient = buildGradient(x, y, false)

          expect(gradient).toContain("300px")
          expect(gradient).toContain("rgba(16, 21, 15, 0.99)")
          expect(gradient).toContain(`${x}px ${y}px`)
        }
      )
    )
  })
})

// ---------------------------------------------------------------------------
// Property 4: Revealed Flashlight Gradient Correctness
// ---------------------------------------------------------------------------

describe("Property 4: Revealed Flashlight Gradient Correctness", () => {
  it("buildGradient(x, y, true) always contains 900px, rgba(16, 21, 15, 0.9), and exact (x, y) coordinates", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10000, max: 10000 }),
        fc.integer({ min: -10000, max: 10000 }),
        (x, y) => {
          const gradient = buildGradient(x, y, true)

          expect(gradient).toContain("900px")
          expect(gradient).toContain("rgba(16, 21, 15, 0.9)")
          expect(gradient).toContain(`${x}px ${y}px`)
        }
      )
    )
  })
})

// ---------------------------------------------------------------------------
// Property 5: Cursor Dot Uses Left/Top Positioning Only
// ---------------------------------------------------------------------------

describe("Property 5: Cursor Dot Uses Left/Top Positioning Only", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("cursor-dot element has left and top inline styles and no transform inline style for any (x, y)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3840 }),
        fc.integer({ min: 0, max: 2160 }),
        (x, y) => {
          mockUseMousePosition.mockReturnValue({ x, y, isInitialized: true })

          const { container } = render(<CursorFlashlight isRevealed={false} />)
          const cursorDot = container.querySelector(".cursor-dot") as HTMLElement | null

          expect(cursorDot).not.toBeNull()
          expect(cursorDot!.style.left).toBe(`${x}px`)
          expect(cursorDot!.style.top).toBe(`${y}px`)
          // Must NOT have an inline transform style (Req 2.6)
          expect(cursorDot!.style.transform).toBe("")
        }
      )
    )
  })
})

// ---------------------------------------------------------------------------
// Unit tests for CursorFlashlight
// ---------------------------------------------------------------------------

describe("CursorFlashlight — unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Req 2.1, 9.2: returns null when isInitialized is false
  it("returns null when isInitialized is false", () => {
    mockUseMousePosition.mockReturnValue({ x: 0, y: 0, isInitialized: false })

    const { container } = render(<CursorFlashlight isRevealed={false} />)

    expect(container.firstChild).toBeNull()
  })

  // Req 2.7: pointer-events: none on cursor dot
  it("applies pointer-events: none to the cursor dot", () => {
    mockUseMousePosition.mockReturnValue({ x: 100, y: 200, isInitialized: true })

    const { container } = render(<CursorFlashlight isRevealed={false} />)
    const cursorDot = container.querySelector(".cursor-dot") as HTMLElement | null

    expect(cursorDot).not.toBeNull()
    expect(cursorDot!.style.pointerEvents).toBe("none")
  })

  // Req 2.7: pointer-events: none on the darkness overlay
  it("applies pointer-events: none to the darkness overlay", () => {
    mockUseMousePosition.mockReturnValue({ x: 100, y: 200, isInitialized: true })

    const { container } = render(<CursorFlashlight isRevealed={false} />)

    // The overlay is the second child of the fragment — a fixed inset-0 div
    const children = container.children
    // container wraps the fragment; find the overlay (not cursor-dot)
    const overlay = Array.from(container.querySelectorAll("div")).find(
      (el) => !el.classList.contains("cursor-dot")
    ) as HTMLElement | undefined

    expect(overlay).toBeDefined()
    expect(overlay!.style.pointerEvents).toBe("none")
  })

  // Req 2.2: unrevealed gradient uses 300px radius
  it("uses 300px radius gradient when isRevealed is false", () => {
    mockUseMousePosition.mockReturnValue({ x: 50, y: 75, isInitialized: true })

    const { container } = render(<CursorFlashlight isRevealed={false} />)
    const overlay = Array.from(container.querySelectorAll("div")).find(
      (el) => !el.classList.contains("cursor-dot")
    ) as HTMLElement | undefined

    expect(overlay!.style.background).toContain("300px")
    expect(overlay!.style.background).toContain("rgba(16, 21, 15, 0.99)")
  })

  // Req 2.3: revealed gradient uses 900px radius
  it("uses 900px radius gradient when isRevealed is true", () => {
    mockUseMousePosition.mockReturnValue({ x: 50, y: 75, isInitialized: true })

    const { container } = render(<CursorFlashlight isRevealed={true} />)
    const overlay = Array.from(container.querySelectorAll("div")).find(
      (el) => !el.classList.contains("cursor-dot")
    ) as HTMLElement | undefined

    expect(overlay!.style.background).toContain("900px")
    expect(overlay!.style.background).toContain("rgba(16, 21, 15, 0.9)")
  })
})
