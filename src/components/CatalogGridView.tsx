"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Loader2, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CatalogImage } from "@/components/CatalogImage";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import type { CatalogScope } from "@/lib/catalog";
import { EASE_REEL, fadeRise, staggerContainer } from "@/lib/motion";
import { dedupeTitles, titleKey } from "@/lib/titles";
import { backdropUrl } from "@/lib/tmdb-image";
import type { Title } from "@/lib/types";

type SortKey = "curated" | "rating" | "newest" | "az";

interface CatalogGridViewProps {
  eyebrow: string;
  heading: string;
  description: string;
  titles: readonly Title[];
  scope?: CatalogScope;
  liveCatalog?: boolean;
  page?: number;
  totalPages?: number;
  totalResults?: number;
  genreOptions?: readonly string[];
}

const ALL_GENRES = "All";

const SORT_LABELS: Record<SortKey, string> = {
  curated: "Curated order",
  rating: "Highest rated",
  newest: "Newest first",
  az: "A to Z",
};

function sortTitles(titles: readonly Title[], sortKey: SortKey): Title[] {
  const sorted = [...titles];

  if (sortKey === "rating") {
    return sorted.sort((a, b) => b.rating - a.rating || b.year - a.year);
  }

  if (sortKey === "newest") {
    return sorted.sort((a, b) => b.year - a.year || b.rating - a.rating);
  }

  if (sortKey === "az") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  return sorted;
}

function getAverageRating(titles: readonly Title[]): string {
  if (titles.length === 0) return "0.0";
  const total = titles.reduce((sum, title) => sum + title.rating, 0);
  return (total / titles.length).toFixed(1);
}

export function CatalogGridView({
  eyebrow,
  heading,
  description,
  titles: initialTitles,
  scope = "browse",
  liveCatalog = false,
  page: initialPage = 1,
  totalPages: initialTotalPages = 1,
  totalResults: initialTotalResults,
  genreOptions,
}: CatalogGridViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const [titles, setTitles] = useState<readonly Title[]>(() => dedupeTitles(initialTitles));
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalResults, setTotalResults] = useState(initialTotalResults ?? initialTitles.length);
  const [selectedGenre, setSelectedGenre] = useState(ALL_GENRES);
  const [sortKey, setSortKey] = useState<SortKey>("curated");
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [loading, setLoading] = useState(false);
  const inflightRequestRef = useRef<string | null>(null);

  useEffect(() => {
    setTitles(dedupeTitles(initialTitles));
    setPage(initialPage);
    setTotalPages(initialTotalPages);
    setTotalResults(initialTotalResults ?? initialTitles.length);
  }, [initialTitles, initialPage, initialTotalPages, initialTotalResults]);

  const fetchPage = useCallback(
    async (nextPage: number, genre: string, append: boolean) => {
      const requestKey = `${nextPage}:${genre}`;
      if (inflightRequestRef.current === requestKey) return;

      inflightRequestRef.current = requestKey;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          scope,
          page: String(nextPage),
        });
        if (genre !== ALL_GENRES) params.set("genre", genre);

        const response = await fetch(`/api/catalog?${params.toString()}`);
        if (!response.ok) throw new Error("Catalog fetch failed");

        const data = (await response.json()) as {
          titles: Title[];
          page: number;
          totalPages: number;
          totalResults: number;
        };

        setTitles((current) =>
          append ? dedupeTitles([...current, ...data.titles]) : dedupeTitles(data.titles),
        );
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalResults(data.totalResults);
      } finally {
        setLoading(false);
        if (inflightRequestRef.current === requestKey) {
          inflightRequestRef.current = null;
        }
      }
    },
    [scope],
  );

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    if (liveCatalog) {
      void fetchPage(1, genre, false);
    }
  };

  const handleLoadMore = () => {
    if (!liveCatalog || page >= totalPages || loading) return;
    void fetchPage(page + 1, selectedGenre, true);
  };

  const genres = useMemo(() => {
    if (genreOptions && genreOptions.length > 0) {
      return [ALL_GENRES, ...genreOptions];
    }
    return [ALL_GENRES, ...new Set(titles.flatMap((title) => title.genres))];
  }, [genreOptions, titles]);

  const filteredTitles = useMemo(() => {
    if (liveCatalog) return titles;
    const matchesGenre = (title: Title) =>
      selectedGenre === ALL_GENRES || title.genres.includes(selectedGenre);
    return titles.filter(matchesGenre);
  }, [liveCatalog, selectedGenre, titles]);

  const visibleTitles = useMemo(
    () => sortTitles(filteredTitles, sortKey),
    [filteredTitles, sortKey],
  );

  const spotlight = visibleTitles[0] ?? titles[0];
  const movieCount = titles.filter((title) => title.mediaType === "movie").length;
  const seriesCount = titles.length - movieCount;
  const shownCount = liveCatalog ? titles.length : visibleTitles.length;
  const catalogCount = liveCatalog ? totalResults : titles.length;

  const metaParts = [
    `${catalogCount} titles`,
    movieCount > 0 ? `${movieCount} films` : null,
    seriesCount > 0 ? `${seriesCount} series` : null,
    `avg ${getAverageRating(titles)}`,
  ].filter(Boolean) as string[];

  return (
    <>
      <section className="relative overflow-hidden px-5 pb-9 pt-28 md:px-10 md:pt-36 lg:px-12">
        {spotlight && (
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute inset-0 opacity-[0.22]">
              <CatalogImage
                src={backdropUrl(spotlight.backdropPath, "w1280")}
                alt=""
                sizes="100vw"
                fallbackLabel={spotlight.name.charAt(0)}
                className="scale-110 blur-[2px]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/45" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
          </div>
        )}

        <motion.div
          className="max-w-3xl"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_REEL }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-velvet-bright">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-6xl italic leading-[0.92] tracking-[-0.015em] text-silver md:text-8xl">
            {heading}
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ash md:text-base">
            {description}
          </p>
          <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
            {metaParts.map((part, index) => (
              <span key={part} className="flex items-center gap-x-3">
                {index > 0 && (
                  <span className="text-white/25" aria-hidden="true">
                    ·
                  </span>
                )}
                {part}
              </span>
            ))}
          </p>
        </motion.div>
      </section>

      <section
        aria-label="Catalog controls"
        className="sticky top-16 z-30 border-y border-white/[0.06] bg-ink/80 px-5 py-3 backdrop-blur-2xl md:top-[68px] md:px-10 lg:px-12"
      >
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="no-scrollbar flex gap-2 overflow-x-auto" role="list" aria-label="Genres">
            {genres.map((genre) => {
              const isActive = genre === selectedGenre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreChange(genre)}
                  aria-pressed={isActive}
                  disabled={loading}
                  className={`h-9 shrink-0 rounded-full border px-4 text-[12px] tracking-wide transition-colors disabled:opacity-60 ${
                    isActive
                      ? "border-velvet-bright/70 bg-velvet/25 text-silver"
                      : "border-white/10 text-ash hover:border-white/25 hover:text-silver"
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>

          <label className="relative block w-full max-w-xs text-ash xl:w-[220px]">
            <span className="sr-only">Sort catalog</span>
            <SlidersHorizontal
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="h-10 w-full appearance-none rounded-full border border-white/10 bg-graphite/80 px-9 text-[13px] text-silver outline-none transition-colors hover:border-white/25 focus:border-velvet-bright"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          </label>
        </div>
      </section>

      <section className="px-5 py-9 md:px-10 lg:px-12" aria-labelledby="catalog-results-heading">
        <div className="mb-6 flex items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ash">
              {shownCount} of {catalogCount} shown
            </p>
            <h2 id="catalog-results-heading" className="mt-1 text-xl font-medium text-silver">
              {selectedGenre === ALL_GENRES ? "All selections" : selectedGenre}
            </h2>
          </div>
          <p className="hidden max-w-sm text-right text-[13px] leading-relaxed text-ash md:block">
            Sorted by {SORT_LABELS[sortKey].toLocaleLowerCase()}.
          </p>
        </div>

        {visibleTitles.length > 0 ? (
          <motion.ul
            className="grid grid-cols-2 gap-x-3.5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            variants={staggerContainer(0.035)}
            initial={prefersReducedMotion ? undefined : "hidden"}
            animate="visible"
          >
            {visibleTitles.map((title) => (
              <motion.li
                key={titleKey(title)}
                variants={fadeRise}
                transition={{ duration: 0.5, ease: EASE_REEL }}
                className="min-w-0"
              >
                <MovieCard title={title} onSelect={setSelectedTitle} variant="grid" />
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <div className="grid min-h-[280px] place-items-center border-y border-white/[0.06] text-center">
            <div>
              <p className="font-display text-3xl italic text-silver">No titles found.</p>
              <p className="mt-2 text-sm text-ash">Try another genre or sort mode.</p>
            </div>
          </div>
        )}

        {liveCatalog && page < totalPages && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-6 text-[13px] text-silver transition-colors hover:border-white/25 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
              Load more
            </button>
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedTitle && (
          <MovieDetailModal title={selectedTitle} onClose={() => setSelectedTitle(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
