"use client"

import { motion } from "framer-motion"
import type { Project } from "@/types/project"

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ProjectListProps {
  /** Array of projects to display. Requirements: 5.1 */
  projects: Project[]
}

/**
 * Brutalist project list revealed after the seal is broken.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export default function ProjectList({ projects }: ProjectListProps): JSX.Element {
  return (
    <section className="px-8 py-12">
      {/* Stagger-animated list — Req 5.6 */}
      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="list-none m-0 p-0"
      >
        {projects.map((project) => {
          const Icon = project.icon

          return (
            <motion.li
              key={project.id}
              variants={rowVariants}
              className={[
                "group",
                "relative",
                "flex flex-col gap-2",
                "border-b-4 border-horror-primary",
                "py-6",
                // Hover: darken background — Req 5.5
                "hover:bg-horror-tertiary",
                "transition-colors duration-200",
                "px-4",
              ].join(" ")}
            >
              {/* Lucide icon — fades in on hover (Req 5.5) */}
              <span
                className={[
                  "absolute right-4 top-1/2 -translate-y-1/2",
                  "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-300",
                  // Text glow on hover — Req 5.5
                  "group-hover:drop-shadow-[0_0_8px_#8c9e82]",
                ].join(" ")}
                aria-hidden="true"
              >
                <Icon size={32} />
              </span>

              {/* Project name — Oswald uppercase (Req 5.2) */}
              <span
                data-testid="project-name"
                className={[
                  "font-oswald tracking-widest uppercase",
                  "text-2xl",
                  // Text glow on hover — Req 5.5
                  "group-hover:drop-shadow-[0_0_6px_#8c9e82]",
                  "transition-all duration-200",
                ].join(" ")}
              >
                {project.name}
              </span>

              {/* Project description — Playfair Display (Req 5.3) */}
              <span
                data-testid="project-description"
                className={[
                  "font-playfair",
                  "text-base opacity-80",
                  "group-hover:opacity-100",
                  "transition-opacity duration-200",
                ].join(" ")}
              >
                {project.description}
              </span>

              {/* Tags — visible labels (Req 5.4) */}
              <div className="flex flex-wrap gap-2 mt-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    data-testid="project-tag"
                    className={[
                      "border border-horror-primary",
                      "px-2 py-0.5",
                      "text-xs font-oswald tracking-wider uppercase",
                      "bg-horror-bg",
                    ].join(" ")}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.li>
          )
        })}
      </motion.ul>
    </section>
  )
}
