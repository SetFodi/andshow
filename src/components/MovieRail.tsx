"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { ContinueCard } from "@/components/ContinueCard";
import { MovieCard } from "@/components/MovieCard";
import type { Rail, RailItem, Title } from "@/lib/types";
import { titleKey } from "@/lib/titles";

interface MovieRailProps {
  rail: Rail;
  onSelect: (title: Title) => void;
}

const SCROLL_RATIO = 0.85;
const REEL_EASE = [0.22, 1, 0.36, 1] as const;

/** Stable unique list key (same title can appear for different episodes). */
function railItemKey(item: RailItem, index: number): string {
  const base = titleKey(item.title);
  const season = item.season != null ? `s${item.season}` : "sx";
  const episode = item.episode != null ? `e${item.episode}` : "ex";
  return `${base}-${season}-${episode}-${index}`;
}

/** Horizontally scrollable shelf of cards with edge fade and chevrons. */
export function MovieRail({ rail, onSelect }: MovieRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const scrollByDirection = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: direction * scroller.clientWidth * SCROLL_RATIO,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <motion.section
      aria-label={rail.heading}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: REEL_EASE }}
    >
      <div className="mb-3 flex items-baseline justify-between px-5 md:px-10 lg:px-12">
        <h2 className="text-[17px] font-medium tracking-tight text-silver">{rail.heading}</h2>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ash/80">
            {rail.items.length} titles
          </span>
          <div className="hidden gap-1.5 md:flex">
            <button
              type="button"
              onClick={() => scrollByDirection(-1)}
              aria-label={`Scroll ${rail.heading} back`}
              className="grid h-8 w-8 place-items-center rounded-full text-ash transition-colors hover:bg-white/5 hover:text-silver"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDirection(1)}
              aria-label={`Scroll ${rail.heading} forward`}
              className="grid h-8 w-8 place-items-center rounded-full text-ash transition-colors hover:bg-white/5 hover:text-silver"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="rail-mask no-scrollbar flex snap-x gap-3.5 overflow-x-auto px-5 py-3 md:px-10 lg:px-12"
      >
        {rail.items.map((item, index) =>
          rail.layout === "wide" ? (
            <ContinueCard key={railItemKey(item, index)} item={item} />
          ) : (
            <MovieCard key={railItemKey(item, index)} title={item.title} onSelect={onSelect} />
          ),
        )}
      </div>
    </motion.section>
  );
}
