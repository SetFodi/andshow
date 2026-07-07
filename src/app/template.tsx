"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE_REEL } from "@/lib/motion";

/**
 * Route transition wrapper. Next remounts this on every navigation, so a
 * mount animation here becomes the between-pages transition: the incoming
 * page crossfades in while a velvet sweep runs across the top like a
 * projector cue.
 *
 * The wrapper animates opacity only — never transform/filter — so that
 * `position: fixed` descendants (ambient backdrop, detail drawer) keep
 * resolving against the viewport instead of this element.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: EASE_REEL }}
    >
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-transparent via-velvet-bright to-transparent"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.9, ease: EASE_REEL }}
        />
      )}
      {children}
    </motion.div>
  );
}
