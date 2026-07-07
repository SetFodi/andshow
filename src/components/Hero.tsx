"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Info, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CatalogImage } from "@/components/CatalogImage";
import { TitleMeta } from "@/components/TitleMeta";
import { backdropUrl } from "@/lib/tmdb-image";
import type { Title } from "@/lib/types";
import { getWatchPath } from "@/lib/watch-path";

interface HeroProps {
  titles: readonly Title[];
  activeIndex: number;
  onSelect: (title: Title) => void;
  onActiveIndexChange: (index: number) => void;
  onHoverChange: (isHovering: boolean) => void;
}

const REEL_EASE = [0.22, 1, 0.36, 1] as const;
const LETTERBOX_EASE = [0.83, 0, 0.17, 1] as const;
const FIRST_REVEAL_DELAY_S = 0.9;

/**
 * Full-viewport cinematic hero. Opens like a projection starting:
 * letterbox bars part once on load, then featured titles crossfade
 * with a slow Ken Burns drift.
 */
export function Hero({
  titles,
  activeIndex,
  onSelect,
  onActiveIndexChange,
  onHoverChange,
}: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [shouldDelayIntro, setShouldDelayIntro] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShouldDelayIntro(false));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (titles.length === 0) return null;
  const active = titles[Math.min(activeIndex, titles.length - 1)];

  return (
    <section
      aria-label="Featured presentations"
      className="relative h-[94svh] max-h-[1000px] min-h-[540px] w-full overflow-hidden"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={active.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={prefersReducedMotion ? false : { scale: 1.07 }}
            animate={{ scale: 1 }}
            transition={{ duration: 9, ease: "linear" }}
          >
            <CatalogImage
              src={backdropUrl(active.backdropPath, "w1280")}
              alt=""
              sizes="100vw"
              priority
              fallbackLabel={active.name.charAt(0)}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink via-ink/30 to-ink/10" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-ink/70 via-ink/10 to-transparent" />

      {/* Letterbox bars: the one-time opening of the projection. */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 z-20 h-[12vh] origin-top bg-ink"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 1.3, delay: 0.35, ease: LETTERBOX_EASE }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 z-20 h-[12vh] origin-bottom bg-ink"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 1.3, delay: 0.35, ease: LETTERBOX_EASE }}
          />
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-14 md:px-10 md:pb-[8vh] lg:px-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            className="max-w-2xl"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{
              duration: 0.55,
              ease: REEL_EASE,
              delay: shouldDelayIntro ? FIRST_REVEAL_DELAY_S : 0.05,
            }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-velvet-bright">
              Now Showing
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.6rem,6.5vw,6rem)] font-medium italic leading-[0.98] tracking-[-0.015em] text-silver">
              {active.name}
            </h1>
            <TitleMeta title={active} className="mt-5" />
            <p className="mt-4 line-clamp-2 max-w-xl text-[15px] leading-relaxed text-ash">
              {active.overview}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={getWatchPath(active)}
                className="flex h-12 items-center gap-2.5 rounded-full bg-silver px-7 text-[15px] font-medium text-ink transition-colors hover:bg-white"
              >
                <Play size={15} strokeWidth={0} className="fill-current" aria-hidden="true" />
                Start Watching
              </Link>
              <button
                type="button"
                onClick={() => onSelect(active)}
                className="glass flex h-12 items-center gap-2.5 rounded-full px-6 text-[15px] text-silver transition-colors hover:bg-white/10"
              >
                <Info size={15} aria-hidden="true" />
                More Info
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Reel selector */}
      <div className="absolute bottom-14 right-5 z-30 hidden items-center gap-4 sm:flex md:right-10 md:bottom-[8vh] lg:right-12">
        <span className="font-mono text-[11px] tracking-[0.25em] text-ash">
          {String(activeIndex + 1).padStart(2, "0")} / {String(titles.length).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2" role="tablist" aria-label="Featured titles">
          {titles.map((title, index) => (
            <button
              key={title.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show ${title.name}`}
              onClick={() => onActiveIndexChange(index)}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                index === activeIndex
                  ? "w-10 bg-silver"
                  : "w-5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
