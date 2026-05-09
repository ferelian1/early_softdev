"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Github, Instagram, Twitter, Globe, Gamepad2, Mail, Linkedin, Youtube } from "lucide-react"
import type { SocialLinkAPI } from "@/types/socialLink"

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------

const ICON_MAP: Record<SocialLinkAPI['icon'], React.ElementType> = {
  Github,
  Instagram,
  Twitter,
  Globe,
  Gamepad2,
  Mail,
  Linkedin,
  Youtube,
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPINE_WIDTH = 48
const PANEL_WIDTH = 280

export const SHELF_WIDTH = SPINE_WIDTH + PANEL_WIDTH

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LeftShelfProps {
  isRevealed: boolean
  socialLinks: SocialLinkAPI[]
}

// ---------------------------------------------------------------------------
// Component
//
// Architecture: accordion-style shelf.
// - The spine is a fixed-width column on the left edge.
// - Each item has a tab (icon button) on the spine.
// - Clicking a tab expands a panel BELOW the tab, pushing subsequent tabs down.
// - The panel width extends to the right of the spine.
// - Height is determined by content — no fixed heights.
// ---------------------------------------------------------------------------

export default function LeftShelf({ isRevealed, socialLinks }: LeftShelfProps): JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null)

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <AnimatePresence>
      {isRevealed && (
        <motion.div
          key="left-shelf"
          initial={{ x: -(SPINE_WIDTH + PANEL_WIDTH) }}
          animate={{ x: 0 }}
          exit={{ x: -(SPINE_WIDTH + PANEL_WIDTH) }}
          transition={{ type: "spring", stiffness: 55, damping: 18, delay: 0.1 }}
          className="fixed left-0 top-0 z-30 flex flex-col pt-20 pb-8"
          style={{ width: SPINE_WIDTH + PANEL_WIDTH }}
        >
          {socialLinks.map((social) => {
            const Icon = ICON_MAP[social.icon]
            const isOpen = openId === social.id

            return (
              <div key={social.id}>
                {/* ── Tab row: icon button on spine + (when open) panel header inline ── */}
                <div className="flex items-stretch">
                  {/* Spine tab */}
                  <button
                    onClick={() => toggle(social.id)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? "Tutup" : "Buka"} ${social.label}`}
                    style={{ width: SPINE_WIDTH, minHeight: 52 }}
                    className={[
                      "flex items-center justify-center shrink-0",
                      "border-b border-horror-primary/15",
                      "bg-horror-bg",
                      isOpen
                        ? "bg-horror-tertiary/60 text-horror-primary border-horror-primary/50"
                        : "text-horror-primary/40 hover:text-horror-primary/80 hover:bg-horror-tertiary/25",
                      "transition-colors duration-150 cursor-pointer",
                    ].join(" ")}
                  >
                    <Icon size={18} />
                  </button>

                  {/* Inline label — only visible when open, fills the panel width */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: PANEL_WIDTH }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: "hidden" }}
                        className={[
                          "flex items-center px-4",
                          "border-b border-horror-primary/30",
                          "bg-horror-tertiary/20",
                        ].join(" ")}
                      >
                        <span className="font-oswald text-xs tracking-[0.2em] uppercase text-horror-primary whitespace-nowrap">
                          {social.label}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Expandable panel — grows downward below the tab ── */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={`panel-${social.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        className={[
                          "flex flex-col gap-3",
                          "bg-horror-bg",
                          "border-b border-r border-horror-primary/25",
                          "px-5 pt-4 pb-5",
                        ].join(" ")}
                        style={{ marginLeft: SPINE_WIDTH }}
                      >
                        {/* Handle */}
                        <span className="font-playfair text-sm text-horror-primary/60 leading-none">
                          {social.handle}
                        </span>

                        {/* Description */}
                        {social.description && (
                          <p className="font-playfair text-sm text-horror-primary/45 leading-relaxed">
                            {social.description}
                          </p>
                        )}

                        {/* CTA */}
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={[
                            "self-start mt-1",
                            "font-oswald text-xs tracking-[0.25em] uppercase",
                            "border border-horror-primary/35 px-3 py-1.5",
                            "text-horror-primary/60",
                            "hover:border-horror-primary hover:text-horror-primary",
                            "transition-colors duration-150",
                          ].join(" ")}
                        >
                          VISIT →
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
