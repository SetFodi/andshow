"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Play, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId } from "react";
import { CatalogImage } from "@/components/CatalogImage";
import { TitleMeta } from "@/components/TitleMeta";
import { backdropUrl, posterUrl } from "@/lib/tmdb-image";
import type { Title } from "@/lib/types";
import { getWatchPath } from "@/lib/watch-path";

interface MovieDetailModalProps {
  title: Title;
  onClose: () => void;
}

const SHEET_EASE = [0.32, 0.72, 0, 1] as const;

function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("");
}

/**
 * The detail drawer: a bottom sheet that rises like a title card —
 * letterboxed backdrop on top, print-label metadata and cast below.
 * Render inside <AnimatePresence> so the exit slide plays.
 */
export function MovieDetailModal({ title, onClose }: MovieDetailModalProps) {
  const headingId = useId();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <motion.div
        className="absolute inset-0 bg-ink/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="absolute inset-x-0 bottom-0 mx-auto flex h-[min(88svh,860px)] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-ink-raised shadow-[0_-30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
        initial={prefersReducedMotion ? { opacity: 0 } : { y: "100%" }}
        animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { y: "100%" }}
        transition={{ duration: 0.55, ease: SHEET_EASE }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          autoFocus
          className="glass absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full text-silver transition-colors hover:text-white"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="overflow-y-auto overscroll-contain">
          <div className="relative aspect-[16/9] max-h-[44vh] w-full sm:aspect-[21/9]">
            <CatalogImage
              src={backdropUrl(title.backdropPath, "w1280")}
              alt=""
              sizes="(min-width: 896px) 896px, 100vw"
              fallbackLabel={title.name.charAt(0)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-raised via-ink-raised/35 to-transparent" />
          </div>

          <div className="relative z-10 -mt-16 flex gap-7 px-6 pb-12 md:-mt-24 md:px-10">
            <div className="relative hidden aspect-[2/3] w-[176px] shrink-0 self-start overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 md:block">
              <CatalogImage
                src={posterUrl(title.posterPath, "w342")}
                alt={`${title.name} poster`}
                sizes="176px"
                fallbackLabel={title.name.charAt(0)}
              />
            </div>

            <div className="min-w-0 flex-1 pt-2 md:pt-24">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.3em] text-velvet-bright">
                {title.mediaType === "movie" ? "Feature Film" : "Series"}
              </p>
              <h2
                id={headingId}
                className="mt-2 font-display text-4xl italic leading-[1.05] tracking-[-0.01em] text-silver md:text-[2.75rem]"
              >
                {title.name}
              </h2>
              <TitleMeta title={title} genreCount={0} className="mt-4" />
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Genres">
                {title.genres.map((genre) => (
                  <li
                    key={genre}
                    className="rounded-full border border-white/10 px-3 py-1 text-[11.5px] text-ash"
                  >
                    {genre}
                  </li>
                ))}
              </ul>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ash">
                {title.overview}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={getWatchPath(title)}
                  className="flex h-12 items-center gap-2.5 rounded-full bg-velvet px-7 text-[15px] font-medium text-white transition-colors hover:bg-velvet-bright"
                >
                  <Play size={15} strokeWidth={0} className="fill-current" aria-hidden="true" />
                  Watch Now
                </Link>
                <button
                  type="button"
                  className="flex h-12 items-center gap-2 rounded-full border border-white/10 px-6 text-[15px] text-silver transition-colors hover:bg-white/5"
                >
                  <Plus size={16} aria-hidden="true" />
                  Add to List
                </button>
              </div>

              <div className="mt-10">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.3em] text-ash">Cast</p>
                <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
                  {title.cast.map((castMember) => (
                    <li key={castMember} className="flex items-center gap-3">
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-graphite-light font-mono text-[10.5px] text-ash ring-1 ring-white/10"
                        aria-hidden="true"
                      >
                        {initials(castMember)}
                      </span>
                      <span className="truncate text-[13.5px] text-silver/90">{castMember}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
