"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE_CURTAIN, EASE_REEL } from "@/lib/motion";

const SESSION_FLAG = "andshow:intro-played";
const HOLD_MS = 1900;

/**
 * First-load projection intro: letterbox bars part, the wordmark strikes
 * on, then the whole curtain lifts to reveal the app. Plays once per tab
 * session (sessionStorage) so in-session navigations stay instant.
 */
export function Preloader() {
  const prefersReducedMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_FLAG)) return;

    // Mount-time, client-only decision: the intro can't be chosen during
    // render (sessionStorage is unavailable on the server, and a lazy
    // initializer would hydration-mismatch), so we flip it on after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPlaying(true);
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_FLAG, "1");
      setIsPlaying(false);
    }, prefersReducedMotion ? 600 : HOLD_MS);

    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isPlaying) {
      document.body.style.overflow = "";
    }
  }, [isPlaying]);

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-ink"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE_REEL }}
        >
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute inset-x-0 top-0 origin-top bg-black"
                initial={{ height: "50%" }}
                animate={{ height: "0%" }}
                transition={{ duration: 1, delay: 0.85, ease: EASE_CURTAIN }}
              />
              <motion.div
                className="absolute inset-x-0 bottom-0 origin-bottom bg-black"
                initial={{ height: "50%" }}
                animate={{ height: "0%" }}
                transition={{ duration: 1, delay: 0.85, ease: EASE_CURTAIN }}
              />
            </>
          )}

          <div className="relative flex flex-col items-center">
            <motion.p
              className="font-mono text-[10px] uppercase tracking-[0.5em] text-velvet-bright"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              Andshow
            </motion.p>
            <motion.h1
              className="mt-3 font-display text-5xl italic tracking-tight text-silver sm:text-6xl"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.25, ease: EASE_REEL }}
            >
              Cinema, without the noise.
            </motion.h1>
            {!prefersReducedMotion && (
              <motion.div
                className="mt-6 h-[2px] w-40 origin-left bg-gradient-to-r from-transparent via-velvet-bright to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 0.35, ease: EASE_REEL }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
