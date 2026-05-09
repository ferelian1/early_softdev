"use client"

import { useState, useEffect } from "react"

export interface MousePosition {
  x: number
  y: number
  isInitialized: boolean
}

/**
 * Tracks the mouse cursor position across the viewport.
 *
 * SSR-safe: returns { x: 0, y: 0, isInitialized: false } on the server.
 * After mount, initializes to the viewport center and updates on mousemove.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 9.1, 9.3
 */
export default function useMousePosition(): MousePosition {
  // SSR-safe initial state — no window access here
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    isInitialized: false,
  })

  useEffect(() => {
    // Initialize to viewport center on mount (Req 1.1, 1.2, 9.3, 10.4)
    setPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      isInitialized: true,
    })

    // Track cursor movement (Req 1.3, 1.4)
    function handleMouseMove(event: MouseEvent): void {
      setPosition({
        x: event.clientX,
        y: event.clientY,
        isInitialized: true,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Cleanup on unmount (Req 1.5)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return position
}
