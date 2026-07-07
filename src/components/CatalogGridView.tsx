"use client";

import { AnimatePresence } from "framer-motion";
import { ChevronDown, Clapperboard, Layers3, Loader2, SlidersHorizontal, Sparkles, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CatalogImage } from "@/components/CatalogImage";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import type { CatalogScope } from "@/lib/catalog";
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
  const [titles, setTitles] = useState<readonly Title[]>(initialTitles);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalResults, setTotalResults] = useState(initialTotalResults ?? initialTitles.length);
  const [selectedGenre, setSelectedGenre] = useState(ALL_GENRES);
  const [sortKey, setSortKey] = useState<SortKey>("curated");
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitles(initialTitles);
    setPage(initialPage);
    setTotalPages(initialTotalPages);
    setTotalResults(initialTotalResults ?? initialTitles.length);
  }, [initialTitles, initialPage, initialTotalPages, initialTotalResults]);

  const fetchPage = useCallback(
    async (nextPage: number, genre: string, append: boolean) => {
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

        setTitles((current) => (append ? [...current, ...data.titles] : data.titles));
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalResults(data.totalResults);
      } finally {
        setLoading(false);
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

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/[0.06] px-5 pb-10 pt-28 md:px-10 md:pt-32 lg:px-12">
        {spotlight && (
          <div className="absolute inset-0 opacity-[0.28]" aria-hidden="true">
            <CatalogImage
              src={backdropUrl(spotlight.backdropPath, "w1280")}
              alt=""
              sizes="100vw"
              fallbackLabel={spotlight.name.charAt(0)}
              className="scale-105 blur-[1px]"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/82 to-ink/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />

        <div className="relative z-10 max-w-6xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-velvet-bright">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl italic leading-none text-silver md:text-7xl">
            {heading}
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ash md:text-base">
            {description}
          </p>

          <dl className="mt-8 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-4">
            {[
              { label: "Titles", value: String(catalogCount), icon: Clapperboard },
              { label: "Average", value: getAverageRating(titles), icon: Star },
              { label: "Genres", value: String(genres.length - 1), icon: Layers3 },
              {
                label: seriesCount > 0 && movieCount > 0 ? "Movies / TV" : "Mode",
                value:
                  seriesCount > 0 && movieCount > 0
                    ? `${movieCount} / ${seriesCount}`
                    : movieCount > 0
                      ? "Films"
                      : "Series",
                icon: Sparkles,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-ink/55 px-4 py-4 backdrop-blur">
                  <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                    <Icon size={13} aria-hidden="true" />
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-2xl font-medium text-silver">{stat.value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      <section
        aria-label="Catalog controls"
        className="sticky top-16 z-30 border-y border-white/[0.06] bg-ink/82 px-5 py-3 backdrop-blur-2xl md:top-[68px] md:px-10 lg:px-12"
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
                  className={`h-9 shrink-0 rounded-full border px-4 text-[12px] transition-colors ${
                    isActive
                      ? "border-velvet-bright bg-velvet/30 text-silver"
                      : "border-white/10 text-ash hover:border-white/20 hover:text-silver"
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>

          <label className="relative block w-full max-w-xs text-ash xl:w-[230px]">
            <span className="sr-only">Sort catalog</span>
            <SlidersHorizontal
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="h-10 w-full appearance-none rounded-full border border-white/10 bg-graphite/80 px-9 text-[13px] text-silver outline-none transition-colors hover:border-white/20 focus:border-velvet-bright"
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
        <div className="mb-5 flex items-end justify-between gap-5">
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
          <ul className="grid grid-cols-2 gap-x-3.5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {visibleTitles.map((title) => (
              <li key={`${title.mediaType}-${title.id}`} className="min-w-0">
                <MovieCard title={title} onSelect={setSelectedTitle} variant="grid" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid min-h-[280px] place-items-center border-y border-white/[0.06] text-center">
            <div>
              <p className="font-display text-3xl italic text-silver">No titles found.</p>
              <p className="mt-2 text-sm text-ash">Try another genre or sort mode.</p>
            </div>
          </div>
        )}

        {liveCatalog && page < totalPages && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-6 text-[13px] text-silver transition-colors hover:border-white/20 disabled:opacity-60"
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
