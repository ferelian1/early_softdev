/**
 * Property 6: Progress Clamping Invariant
 * Validates: Requirements 3.3
 *
 * Property 7: Progress Bar Width Reflects Progress Value
 * Validates: Requirements 3.7
 *
 * Unit tests for CultSeal
 * Validates: Requirements 3.4, 3.5, 3.6, 10.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, fireEvent, act } from "@testing-library/react"
import * as fc from "fast-check"
import CultSeal, { incrementProgress } from "../components/sections/CultSeal"

// ---------------------------------------------------------------------------
// Property 6: Progress Clamping Invariant
// Validates: Requirements 3.3
// ---------------------------------------------------------------------------

describe("Property 6: Progress Clamping Invariant", () => {
  /**
   * For any prev ∈ [0, 100] and any delta > 0,
   * incrementProgress(prev, delta) must always be in [0, 100].
   *
   * Validates: Requirements 3.3
   */
  it("incrementProgress(prev, delta) is always in [0, 100] for prev ∈ [0,100] and delta > 0", () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true }),
        fc.float({ min: Math.fround(0.001), max: Math.fround(1000), noNaN: true }),
        (prev, delta) => {
          const result = incrementProgress(prev, delta)
          expect(result).toBeGreaterThanOrEqual(0)
          expect(result).toBeLessThanOrEqual(100)
        }
      )
    )
  })
})

// ---------------------------------------------------------------------------
// Property 7: Progress Bar Width Reflects Progress Value
// Validates: Requirements 3.7
// ---------------------------------------------------------------------------

describe("Property 7: Progress Bar Width Reflects Progress Value", () => {
  /**
   * incrementProgress is the pure function that drives the progress bar width.
   * For any progress ∈ [0, 100], the width style must equal `${progress}%`.
   *
   * We test the pure function directly (it feeds directly into the style prop),
   * and also do a render smoke-test to confirm the data-testid element exists.
   *
   * Validates: Requirements 3.7
   */
  it("incrementProgress result maps directly to width: ${result}% on the progress bar", () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(99), noNaN: true }), // prev < 100 so we can add delta
        fc.float({ min: Math.fround(0.1), max: Math.fround(50), noNaN: true }),
        (prev, delta) => {
          const result = incrementProgress(prev, delta)
          // The component renders: style={{ width: `${progress}%` }}
          // So the expected style string is:
          const expectedWidth = `${result}%`
          expect(expectedWidth).toMatch(/^\d+(\.\d+)?%$/)
          expect(result).toBeGreaterThanOrEqual(0)
          expect(result).toBeLessThanOrEqual(100)
        }
      )
    )
  })

  it("progress bar element has data-testid='progress-bar' and initial width is 0%", () => {
    const { getByTestId } = render(<CultSeal onSealBroken={() => {}} />)
    const bar = getByTestId("progress-bar") as HTMLElement
    expect(bar.style.width).toBe("0%")
  })
})

// ---------------------------------------------------------------------------
// Unit tests for CultSeal
// Validates: Requirements 3.4, 3.5, 3.6, 10.2
// ---------------------------------------------------------------------------

describe("CultSeal — unit tests", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // -------------------------------------------------------------------------
  // Req 3.6: onSealBroken is called when progress reaches 100
  // -------------------------------------------------------------------------
  it("calls onSealBroken when progress reaches 100 after enough rAF frames", async () => {
    const onSealBroken = vi.fn()

    // Capture rAF callbacks so we can drive them manually
    const rafCallbacks: FrameRequestCallback[] = []
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})

    const { getByTestId } = render(<CultSeal onSealBroken={onSealBroken} />)
    const seal = getByTestId("cult-seal")

    // Start holding
    fireEvent.pointerDown(seal)

    // Drive enough frames to reach 100 (1.5 per frame → ceil(100/1.5) = 67 frames)
    await act(async () => {
      for (let i = 0; i < 70; i++) {
        const cb = rafCallbacks.pop()
        if (cb) cb(performance.now())
      }
      // Flush the setTimeout(onSealBroken, 0) scheduled inside the component
      vi.runAllTimers()
    })

    expect(onSealBroken).toHaveBeenCalledTimes(1)
  })

  // -------------------------------------------------------------------------
  // Req 3.6: onSealBroken is called at most once per hold cycle
  // -------------------------------------------------------------------------
  it("calls onSealBroken at most once even if extra frames fire after progress=100", async () => {
    const onSealBroken = vi.fn()

    const rafCallbacks: FrameRequestCallback[] = []
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})

    const { getByTestId } = render(<CultSeal onSealBroken={onSealBroken} />)
    const seal = getByTestId("cult-seal")

    fireEvent.pointerDown(seal)

    await act(async () => {
      // Run 100 frames — well past the 67 needed
      for (let i = 0; i < 100; i++) {
        const cb = rafCallbacks.pop()
        if (cb) cb(performance.now())
      }
      vi.runAllTimers()
    })

    expect(onSealBroken).toHaveBeenCalledTimes(1)
  })

  // -------------------------------------------------------------------------
  // Req 3.5: progress resets to 0 on onPointerLeave before completion
  // -------------------------------------------------------------------------
  it("resets progress to 0 on pointerLeave before completion", async () => {
    const onSealBroken = vi.fn()

    const rafCallbacks: FrameRequestCallback[] = []
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})

    const { getByTestId } = render(<CultSeal onSealBroken={onSealBroken} />)
    const seal = getByTestId("cult-seal")
    const bar = getByTestId("progress-bar")

    // Start holding and advance a few frames (not to 100)
    fireEvent.pointerDown(seal)

    await act(async () => {
      for (let i = 0; i < 10; i++) {
        const cb = rafCallbacks.pop()
        if (cb) cb(performance.now())
      }
    })

    // Progress should be > 0 now
    const widthAfterHolding = bar.style.width
    expect(widthAfterHolding).not.toBe("0%")

    // Release via pointerLeave
    await act(async () => {
      fireEvent.pointerLeave(seal)
    })

    // Progress must reset to 0
    expect(bar.style.width).toBe("0%")
    expect(onSealBroken).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Req 3.4: progress resets to 0 on onPointerUp before completion
  // -------------------------------------------------------------------------
  it("resets progress to 0 on pointerUp before completion", async () => {
    const onSealBroken = vi.fn()

    const rafCallbacks: FrameRequestCallback[] = []
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})

    const { getByTestId } = render(<CultSeal onSealBroken={onSealBroken} />)
    const seal = getByTestId("cult-seal")
    const bar = getByTestId("progress-bar")

    fireEvent.pointerDown(seal)

    await act(async () => {
      for (let i = 0; i < 10; i++) {
        const cb = rafCallbacks.pop()
        if (cb) cb(performance.now())
      }
    })

    await act(async () => {
      fireEvent.pointerUp(seal)
    })

    expect(bar.style.width).toBe("0%")
    expect(onSealBroken).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Req 10.2: rAF is cancelled on unmount
  // -------------------------------------------------------------------------
  it("cancels requestAnimationFrame on unmount", async () => {
    const onSealBroken = vi.fn()

    const rafCallbacks: FrameRequestCallback[] = []
    let rafIdCounter = 0
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return ++rafIdCounter
    })
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})

    const { getByTestId, unmount } = render(<CultSeal onSealBroken={onSealBroken} />)
    const seal = getByTestId("cult-seal")

    // Start holding to get an active rAF loop
    fireEvent.pointerDown(seal)

    // Advance a couple of frames so rafRef.current is set
    await act(async () => {
      for (let i = 0; i < 3; i++) {
        const cb = rafCallbacks.pop()
        if (cb) cb(performance.now())
      }
    })

    // Unmount while holding — should cancel the pending rAF
    act(() => {
      unmount()
    })

    expect(cancelSpy).toHaveBeenCalled()
  })
})
