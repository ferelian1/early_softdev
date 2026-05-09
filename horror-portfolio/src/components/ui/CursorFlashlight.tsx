"use client"

import useMousePosition from "@/hooks/useMousePosition"

interface CursorFlashlightProps {
  isRevealed: boolean
}

/**
 * Builds the CSS radial-gradient string for the darkness overlay.
 *
 * Unrevealed: 300px radius, 0.99 opacity  (Requirements 2.2, 2.4, 2.8)
 * Revealed:   900px radius, 0.90 opacity  (Requirements 2.3, 2.5, 2.8)
 */
export function buildGradient(x: number, y: number, isRevealed: boolean): string {
  if (isRevealed) {
    return `radial-gradient(circle 900px at ${x}px ${y}px, transparent 0%, rgba(16, 21, 15, 0.9) 80%)`
  }
  return `radial-gradient(circle 300px at ${x}px ${y}px, transparent 0%, rgba(16, 21, 15, 0.99) 80%)`
}

/**
 * Renders the custom occult cursor dot and the radial darkness overlay.
 *
 * Returns null when useMousePosition is not yet initialized (SSR-safe).
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 8.5, 9.2
 */
export default function CursorFlashlight({ isRevealed }: CursorFlashlightProps): JSX.Element | null {
  const { x, y, isInitialized } = useMousePosition()

  // Req 2.1, 9.2: return null before client-side initialization to prevent SSR flash
  if (!isInitialized) return null

  const gradient = buildGradient(x, y, isRevealed)

  return (
    <>
      {/* Custom cursor dot — positioned with left/top only, no inline transform (Req 2.6, 8.5) */}
      <div
        className="cursor-dot"
        style={{ left: `${x}px`, top: `${y}px`, pointerEvents: "none" }}
      />
      {/* Darkness overlay — fixed full-screen, pointer-events none (Req 2.7) */}
      <div
        className="fixed inset-0"
        style={{
          background: gradient,
          pointerEvents: "none",
          zIndex: 50,
        }}
      />
    </>
  )
}
