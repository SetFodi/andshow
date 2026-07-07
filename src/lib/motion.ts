// Shared framer-motion presets so page transitions, rails, and reveals
// all move on the same cinematic curve. Plain constants — safe to import
// from client components.
import type { Transition, Variants } from "framer-motion";

/** House easing: a quick out, long settle — the "reel" curve. */
export const EASE_REEL = [0.22, 1, 0.36, 1] as const;

/** Symmetric ease for curtain/letterbox wipes. */
export const EASE_CURTAIN = [0.83, 0, 0.17, 1] as const;

/** Fade + gentle rise, used for section and card reveals. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/** Container that reveals its children one after another. */
export function staggerContainer(stagger = 0.06, delay = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
}

export const REVEAL_TRANSITION: Transition = { duration: 0.6, ease: EASE_REEL };
