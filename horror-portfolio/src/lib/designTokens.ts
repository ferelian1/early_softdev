/**
 * Design tokens for the Horror Portfolio.
 * These constants define the visual identity of the site and are the
 * single source of truth for colors, fonts, and dimensions used across
 * all components.
 */
export const designTokens = {
  colors: {
    background: "#10150F",      // Pitch Dark Green
    primaryText: "#8c9e82",     // Pale green
    secondaryAccent: "#4a633f", // Mid green
    tertiaryAccent: "#3a4f32",  // Dark green
  },
  fonts: {
    body: "'Playfair Display', serif",
    heading: "'Oswald', sans-serif",
  },
  cursor: {
    size: 6,                    // px
    glowPrimary: "#8c9e82",
    glowSecondary: "#3a4f32",
  },
  flashlight: {
    radiusUnrevealed: 300,      // px
    radiusRevealed: 900,        // px
    opacityUnrevealed: 0.99,
    opacityRevealed: 0.9,
  },
} as const;

export type DesignTokens = typeof designTokens;
