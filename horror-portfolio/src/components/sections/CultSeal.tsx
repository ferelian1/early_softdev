"use client"

import { useEffect, useRef, useState } from "react"
import { Skull } from "lucide-react"

// ---------------------------------------------------------------------------
// Pure helper — exported for direct unit / property testing
// Requirements: 3.3
// ---------------------------------------------------------------------------

/**
 * Increments progress by `delta`, clamped to [0, 100].
 *
 * Preconditions:  prev ∈ [0, 100], delta > 0
 * Postconditions: result ∈ [0, 100]
 */
export function incrementProgress(prev: number, delta: number): number {
  return Math.min(prev + delta, 100)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CultSealProps {
  /** Called exactly once when progress reaches 100. Requirements: 3.6 */
  onSealBroken: () => void
}

/**
 * Brutalist "Hold to Break Seal" gating interaction.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 10.2, 10.3
 */
export default function CultSeal({ onSealBroken }: CultSealProps): JSX.Element {
  const [progress, setProgress] = useState(0)

  // Refs so the rAF loop always reads the latest values without stale closures
  const isHoldingRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  // Guard: ensure onSealBroken is called at most once per hold cycle (Req 3.6)
  const sealBrokenRef = useRef(false)

  function startHolding(): void {
    if (isHoldingRef.current) return // already running
    isHoldingRef.current = true
    sealBrokenRef.current = false

    // Keep a local mutable copy of progress so the loop doesn't rely on stale
    // React state — we update both the ref-local value and React state each frame.
    let localProgress = 0

    function loop(): void {
      if (!isHoldingRef.current) return

      localProgress = incrementProgress(localProgress, 1.5)
      setProgress(localProgress)

      if (localProgress >= 100) {
        if (!sealBrokenRef.current) {
          sealBrokenRef.current = true
          isHoldingRef.current = false
          onSealBroken()
        }
        return // stop the loop
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  function stopHolding(): void {
    isHoldingRef.current = false
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setProgress(0)
  }

  // Cleanup on unmount — cancel any active rAF loop (Req 10.2)
  useEffect(() => {
    return () => {
      stopHolding()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      data-testid="cult-seal"
      className="cursor-none select-none flex flex-col items-center gap-4 p-8"
      onPointerDown={startHolding}
      onPointerUp={stopHolding}
      onPointerLeave={stopHolding}
    >
      {/* Lucide Skull icon — Req 3.7 */}
      <Skull size={48} />

      {/* Brutalist uppercase label — Req 3.7 */}
      <span className="font-oswald tracking-widest uppercase text-lg">
        HOLD TO BREAK SEAL
      </span>

      {/* Progress bar container */}
      <div className="w-full h-2 bg-gray-800 overflow-hidden">
        {/* Progress bar fill — Req 3.7 */}
        <div
          data-testid="progress-bar"
          style={{ width: `${progress}%` }}
          className="h-full bg-current transition-none"
        />
      </div>
    </div>
  )
}
