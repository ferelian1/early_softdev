"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Skull } from "lucide-react"
import type { ProjectAPI } from "@/types/project"

// ---------------------------------------------------------------------------
// Constants — must match LeftShelf
// ---------------------------------------------------------------------------

const SPINE_WIDTH = 48
const PANEL_WIDTH = 280

export const SHELF_WIDTH = SPINE_WIDTH + PANEL_WIDTH

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RightShelfProps {
  isRevealed: boolean
  projects: ProjectAPI[]
}

// ---------------------------------------------------------------------------
// Component
//
// Architecture: accordion-style shelf, mirrored on the right edge.
// - Spine is on the right edge.
// - Panel expands to the LEFT of the spine, growing downward.
// - Clicking a tab expands content below the tab, pushing subsequent tabs down.
// ---------------------------------------------------------------------------

export default function RightShelf({ isRevealed, projects }: RightShelfProps): JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null)

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  const internalProjects = projects.map((p) => ({
    id: p.id,
    name: p.title,
    description: p.description,
    icon: Skull,
    tags: p.tech_stack,
  }))

  return (
    <AnimatePresence>
      {isRevealed && (
        <motion.div
          key="right-shelf"
          initial={{ x: SPINE_WIDTH + PANEL_WIDTH }}
          animate={{ x: 0 }}
          exit={{ x: SPINE_WIDTH + PANEL_WIDTH }}
          transition={{ type: "spring", stiffness: 55, damping: 18, delay: 0.1 }}
          className="fixed right-0 top-0 z-30 flex flex-col pt-20 pb-8"
          style={{ width: SPINE_WIDTH + PANEL_WIDTH }}
        >
          {internalProjects.map((project) => {
            const Icon = project.icon
            const isOpen = openId === project.id

            return (
              <div key={project.id}>
                {/* ── Tab row: panel label (when open) + icon button on spine ── */}
                <div className="flex items-stretch">
                  {/* Inline label — only visible when open */}
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
                          {project.name}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Spine tab */}
                  <button
                    onClick={() => toggle(project.id)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? "Tutup" : "Buka"} ${project.name}`}
                    style={{ width: SPINE_WIDTH, minHeight: 52 }}
                    className={[
                      "flex items-center justify-center shrink-0 ml-auto",
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
                </div>

                {/* ── Expandable panel — grows downward below the tab ── */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={`panel-${project.id}`}
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
                          "border-b border-l border-horror-primary/25",
                          "px-5 pt-4 pb-5",
                        ].join(" ")}
                        style={{ marginRight: SPINE_WIDTH }}
                      >
                        {/* Description */}
                        <p
                          data-testid="project-description"
                          className="font-playfair text-sm text-horror-primary/55 leading-relaxed"
                        >
                          {project.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              data-testid="project-tag"
                              className={[
                                "font-oswald text-[10px] tracking-wider uppercase",
                                "border border-horror-primary/30 px-2 py-1",
                                "text-horror-primary/50",
                              ].join(" ")}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
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
