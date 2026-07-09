"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Play, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { CatalogImage } from "@/components/CatalogImage";
import { TitleMeta } from "@/components/TitleMeta";
import { isInMyList, toggleMyList } from "@/lib/my-list";
import { backdropUrl, posterUrl } from "@/lib/tmdb-image";
import type { Title } from "@/lib/types";
import { DEFAULT_TV_EPISODE, DEFAULT_TV_SEASON, getWatchPath } from "@/lib/watch-path";

interface SeasonOption {
  season_number: number;
  name: string;
  episode_count: number;
}

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

export function MovieDetailModal({ title: initialTitle, onClose }: MovieDetailModalProps) {
  const headingId = useId();
  const prefersReducedMotion = useReducedMotion();
  const [title, setTitle] = useState(initialTitle);
  const [seasons, setSeasons] = useState<SeasonOption[]>([]);
  const [season, setSeason] = useState(DEFAULT_TV_SEASON);
  const [episode, setEpisode] = useState(DEFAULT_TV_EPISODE);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [inMyList, setInMyList] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setSeason(DEFAULT_TV_SEASON);
    setEpisode(DEFAULT_TV_EPISODE);
    setInMyList(isInMyList(initialTitle.id, initialTitle.mediaType));
  }, [initialTitle]);

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

  useEffect(() => {
    let cancelled = false;
    setLoadingDetails(true);
    void (async () => {
      try {
        const response = await fetch(`/api/title/${initialTitle.mediaType}/${initialTitle.id}`);
        if (!response.ok) return;
        const data = (await response.json()) as { title: Title; seasons: SeasonOption[] };
        if (cancelled) return;
        if (data.title) setTitle(data.title);
        setSeasons(data.seasons ?? []);
        if (data.seasons?.length) {
          setSeason(data.seasons[0].season_number);
          setEpisode(1);
        }
      } catch {
        // Keep the summary title if details fetch fails (offline / test env).
      } finally {
        if (!cancelled) setLoadingDetails(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialTitle.id, initialTitle.mediaType]);

  const activeSeason = seasons.find((item) => item.season_number === season) ?? seasons[0];
  const episodeCount = activeSeason?.episode_count ?? 1;
  const watchHref =
    title.mediaType === "tv" ? getWatchPath(title, { season, episode }) : getWatchPath(title);

  const handleToggleList = () => {
    setInMyList(toggleMyList(title));
  };

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
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ash">{title.overview}</p>

              {title.mediaType === "tv" && seasons.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">Season</span>
                    <select
                      value={season}
                      onChange={(event) => {
                        setSeason(Number(event.target.value));
                        setEpisode(1);
                      }}
                      className="h-10 min-w-[140px] rounded-full border border-white/10 bg-graphite/80 px-4 text-[13px] text-silver outline-none focus:border-velvet-bright"
                    >
                      {seasons.map((item) => (
                        <option key={item.season_number} value={item.season_number}>
                          {item.name || `Season ${item.season_number}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">Episode</span>
                    <select
                      value={episode}
                      onChange={(event) => setEpisode(Number(event.target.value))}
                      className="h-10 min-w-[120px] rounded-full border border-white/10 bg-graphite/80 px-4 text-[13px] text-silver outline-none focus:border-velvet-bright"
                    >
                      {Array.from({ length: episodeCount }, (_, index) => index + 1).map((n) => (
                        <option key={n} value={n}>
                          Episode {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={watchHref}
                  className="flex h-12 items-center gap-2.5 rounded-full bg-velvet px-7 text-[15px] font-medium text-white transition-colors hover:bg-velvet-bright"
                >
                  <Play size={15} strokeWidth={0} className="fill-current" aria-hidden="true" />
                  Watch Now
                </Link>
                <button
                  type="button"
                  onClick={handleToggleList}
                  className="flex h-12 items-center gap-2 rounded-full border border-white/10 px-6 text-[15px] text-silver transition-colors hover:bg-white/5"
                >
                  {inMyList ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                  {inMyList ? "In My List" : "Add to List"}
                </button>
              </div>

              <div className="mt-10">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.3em] text-ash">Cast</p>
                {loadingDetails && title.cast.length === 0 ? (
                  <p className="mt-4 flex items-center gap-2 text-[13px] text-ash">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Loading cast…
                  </p>
                ) : title.cast.length > 0 ? (
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
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
