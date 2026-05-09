"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import CursorFlashlight from "@/components/ui/CursorFlashlight"
import CultSeal from "@/components/sections/CultSeal"
import LeftShelf from "@/components/sections/LeftShelf"
import RightShelf from "@/components/sections/RightShelf"
import type { ProjectAPI } from "@/types/project"
import type { SocialLinkAPI } from "@/types/socialLink"

const SPINE_WIDTH = 48

interface PageClientProps {
  projects: ProjectAPI[]
  socialLinks: SocialLinkAPI[]
}

export default function PageClient({ projects, socialLinks }: PageClientProps): JSX.Element {
  const [isRevealed, setIsRevealed] = useState(false)

  return (
    <main className={[
      "relative min-h-screen bg-horror-bg overflow-x-hidden",
      isRevealed ? "" : "cursor-none",
    ].join(" ")}>
      {!isRevealed && <CursorFlashlight isRevealed={false} />}
      <div className="noise-bg pointer-events-none fixed inset-0 z-10" />
      <LeftShelf isRevealed={isRevealed} socialLinks={socialLinks} />
      <RightShelf isRevealed={isRevealed} projects={projects} />
      <motion.div
        className="relative z-20 flex items-center justify-center min-h-screen"
        animate={{
          paddingLeft:  isRevealed ? SPINE_WIDTH : 0,
          paddingRight: isRevealed ? SPINE_WIDTH : 0,
        }}
        transition={{ type: "spring", stiffness: 55, damping: 18 }}
      >
        <section className="w-full flex flex-col items-center text-center px-8">
          <h1
            data-testid="hero-heading"
            className={[
              "font-oswald leading-none tracking-widest uppercase text-horror-primary",
              "transition-all duration-700",
              isRevealed
                ? "text-[3.5rem] md:text-[5rem] lg:text-[6rem]"
                : "text-[5rem] md:text-[9rem] lg:text-[13rem]",
            ].join(" ")}
          >
            FERELIAN.
          </h1>
          <p
            data-testid="hero-title"
            className="font-playfair text-base md:text-lg tracking-widest uppercase text-horror-primary/50 mt-3"
          >
            GAMEDEV · FULL STACK ENGINEER
          </p>
          <AnimatePresence>
            {!isRevealed && (
              <motion.div
                key="center-description"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col items-center mt-12 max-w-md"
              >
                <p className="font-playfair text-sm text-horror-primary/40 leading-relaxed tracking-wide">
                  Back-end systems that run in the dark.
                  <br />
                  Games that shouldn&apos;t exist.
                </p>
                <div className="mt-12 w-full">
                  <CultSeal onSealBroken={() => setIsRevealed(true)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isRevealed && (
              <motion.p
                key="revealed-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="font-oswald text-[10px] tracking-[0.4em] uppercase text-horror-primary/25 mt-8"
              >
                ◈ &nbsp; BROWSE THE SECTORS &nbsp; ◈
              </motion.p>
            )}
          </AnimatePresence>
        </section>
      </motion.div>
    </main>
  )
}
