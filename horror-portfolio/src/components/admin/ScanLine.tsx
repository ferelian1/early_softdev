'use client';

import { motion } from 'framer-motion';

/**
 * ScanLine — animated horizontal scan-line that moves from top to bottom
 * of the screen continuously, creating a CRT/terminal horror aesthetic.
 *
 * Requirements: 14.4
 */
export function ScanLine() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 z-50"
      style={{
        height: '2px',
        background: 'rgba(140, 158, 130, 0.15)',
        top: 0,
      }}
      animate={{ top: ['0%', '100%'] }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}
