"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CornerDownLeft, Film, Search, Tv, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import { EASE_REEL, fadeRise, staggerContainer } from "@/lib/motion";
import { dedupeTitles, titleKey } from "@/lib/titles";
import type { MediaType, Title } from "@/lib/types";

type MediaFilter = "all" | MediaType;

interface CatalogSearchViewProps {
  titles: readonly Title[];
  liveCatalog?: boolean;
}

const MEDIA_TABS: { key: MediaFilter; label: string; icon: typeof Search }[] = [
  { key: "all", label: "All", icon: Search },
  { key: "movie", label: "Movies", icon: Film },
  { key: "tv", label: "TV", icon: Tv },
];

const SUGGESTION_COUNT = 10;
const DEBOUNCE_MS = 300;

interface SearchTitleState {
  sourceKey: string;
  titles: readonly Title[];
}

function getSourceKey(titles: readonly Title[]): string {
  return titles.map(titleKey).join(",");
}

function includesQuery(title: Title, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;

  const haystack = [
    title.name,
    title.yearLabel,
    title.runtimeLabel,
    title.overview,
    title.mediaType === "movie" ? "movie film feature" : "tv series show",
    ...title.genres,
    ...title.cast,
  ]
    .join(" ")
    .toLocaleLowerCase();

  return haystack.includes(needle);
}

export function CatalogSearchView({
  titles: initialTitles,
  liveCatalog = false,
}: CatalogSearchViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const sourceKey = useMemo(() => getSourceKey(initialTitles), [initialTitles]);
  const initialTitleState = useMemo<SearchTitleState>(
    () => ({
      sourceKey,
      titles: dedupeTitles(initialTitles),
    }),
    [initialTitles, sourceKey],
  );
  const [titleState, setTitleState] = useState<SearchTitleState>(() => initialTitleState);
  const [query, setQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titles = titleState.sourceKey === sourceKey ? titleState.titles : initialTitleState.titles;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!liveCatalog) return;

    const trimmed = query.trim();
    const handle = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ scope: "search", page: "1" });
        if (trimmed) params.set("query", trimmed);
        if (mediaFilter !== "all") params.set("mediaType", mediaFilter);

        const response = await fetch(`/api/catalog?${params.toString()}`);
        if (!response.ok) throw new Error("Search fetch failed");

        const data = (await response.json()) as { titles: Title[] };
        setTitleState({ sourceKey, titles: dedupeTitles(data.titles) });
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [liveCatalog, mediaFilter, query, sourceKey]);

  const results = useMemo(() => {
    return titles
      .filter((title) => mediaFilter === "all" || title.mediaType === mediaFilter)
      .filter((title) => liveCatalog || includesQuery(title, query))
      .sort((a, b) => b.rating - a.rating || b.year - a.year);
  }, [liveCatalog, mediaFilter, query, titles]);

  const hasQuery = query.trim().length > 0;
  const suggestions = useMemo(
    () =>
      [...titles]
        .sort((a, b) => b.rating - a.rating || b.year - a.year)
        .filter((title) => mediaFilter === "all" || title.mediaType === mediaFilter)
        .slice(0, SUGGESTION_COUNT),
    [mediaFilter, titles],
  );
  const shownTitles = hasQuery ? results : suggestions;

  // Reset the keyboard cursor from the same handlers that change the
  // visible set, so there's no derived-state-in-effect round trip.
  const resetCursor = () => setActiveIndex(-1);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    resetCursor();
  };

  const handleMediaFilter = (filter: MediaFilter) => {
    setMediaFilter(filter);
    resetCursor();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (shownTitles.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, shownTitles.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0 && activeIndex < shownTitles.length) {
      event.preventDefault();
      setSelectedTitle(shownTitles[activeIndex]);
    } else if (event.key === "Escape" && query) {
      event.preventDefault();
      handleQueryChange("");
    }
  };

  return (
    <>
      <section className="relative min-h-[92svh] px-5 pt-28 md:px-10 md:pt-32 lg:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_80%_at_50%_0%,rgba(176,64,73,0.2),transparent_70%)]"
        />

        <div className="mx-auto max-w-3xl">
          <motion.div
            className="text-center"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE_REEL }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-velvet-bright">
              Projection index
            </p>
            <h1 className="mt-3 font-display text-4xl italic leading-none text-silver md:text-6xl">
              What are you in the mood for?
            </h1>
          </motion.div>

          <motion.div
            className="mt-9"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: EASE_REEL }}
          >
            <div className="group relative">
              <Search
                size={22}
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ash transition-colors group-focus-within:text-velvet-bright"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Title, actor, genre, year…"
                autoComplete="off"
                spellCheck={false}
                role="combobox"
                aria-label="Search titles"
                aria-expanded={hasQuery}
                aria-controls="search-results"
                className="h-16 w-full rounded-2xl border border-white/10 bg-graphite/50 px-14 text-[17px] text-silver shadow-[0_20px_60px_rgba(0,0,0,0.45)] outline-none backdrop-blur-2xl transition-all placeholder:text-ash/60 hover:border-white/20 focus:border-velvet-bright/70 focus:bg-graphite/70 focus:shadow-[0_0_0_4px_rgba(176,64,73,0.14),0_20px_60px_rgba(0,0,0,0.5)]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    handleQueryChange("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ash transition-colors hover:bg-white/5 hover:text-silver"
                >
                  <X size={17} aria-hidden="true" />
                </button>
              ) : (
                <span className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ash/70 sm:flex">
                  <CornerDownLeft size={12} aria-hidden="true" /> to open
                </span>
              )}
            </div>

            <div className="mt-5 flex items-center justify-center">
              <div className="inline-flex rounded-full border border-white/10 bg-graphite/50 p-1 backdrop-blur">
                {MEDIA_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = mediaFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleMediaFilter(tab.key)}
                      aria-pressed={isActive}
                      className={`flex h-9 items-center gap-2 rounded-full px-4 text-[12.5px] transition-colors ${
                        isActive ? "bg-silver text-ink" : "text-ash hover:text-silver"
                      }`}
                    >
                      <Icon size={14} aria-hidden="true" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <div className="mt-9 flex items-center justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ash">
              {loading
                ? "Searching…"
                : hasQuery
                  ? `${results.length} result${results.length === 1 ? "" : "s"}`
                  : "Suggestions"}
            </p>
            {hasQuery && shownTitles.length > 0 && (
              <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ash/70 sm:block">
                ↑ ↓ to move · ↵ to open
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto mt-5 max-w-6xl pb-16">
          {shownTitles.length > 0 ? (
            <motion.ul
              id="search-results"
              className="grid grid-cols-2 gap-x-3.5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              variants={staggerContainer(0.03)}
              initial={prefersReducedMotion ? undefined : "hidden"}
              animate="visible"
            >
              <AnimatePresence>
                {shownTitles.map((title, index) => (
                  <motion.li
                    key={titleKey(title)}
                    variants={fadeRise}
                    transition={{ duration: 0.45, ease: EASE_REEL }}
                    className={`min-w-0 rounded-xl transition-shadow ${
                      index === activeIndex ? "ring-2 ring-velvet-bright ring-offset-2 ring-offset-ink" : ""
                    }`}
                  >
                    <MovieCard title={title} onSelect={setSelectedTitle} variant="grid" />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <div className="grid min-h-[240px] place-items-center text-center">
              <div>
                <p className="font-display text-3xl italic text-silver">Nothing in the reel.</p>
                <p className="mt-2 text-sm text-ash">Try a title, actor, genre, or year.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedTitle && (
          <MovieDetailModal title={selectedTitle} onClose={() => setSelectedTitle(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
