"use client";

import { AnimatePresence } from "framer-motion";
import { Film, Search, Tv, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CatalogImage } from "@/components/CatalogImage";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import { backdropUrl } from "@/lib/tmdb-image";
import type { MediaType, Title } from "@/lib/types";

type MediaFilter = "all" | MediaType;

interface CatalogSearchViewProps {
  titles: readonly Title[];
  liveCatalog?: boolean;
}

const ALL_GENRES = "All genres";

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

export function CatalogSearchView({ titles: initialTitles, liveCatalog = false }: CatalogSearchViewProps) {
  const [titles, setTitles] = useState<readonly Title[]>(initialTitles);
  const [query, setQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [selectedGenre, setSelectedGenre] = useState(ALL_GENRES);
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitles(initialTitles);
  }, [initialTitles]);

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
        setTitles(data.titles);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [liveCatalog, mediaFilter, query]);

  const availableGenres = useMemo(() => {
    const scopedTitles =
      mediaFilter === "all" ? titles : titles.filter((title) => title.mediaType === mediaFilter);
    return [ALL_GENRES, ...new Set(scopedTitles.flatMap((title) => title.genres))];
  }, [mediaFilter, titles]);
  const activeGenre = availableGenres.includes(selectedGenre) ? selectedGenre : ALL_GENRES;

  const results = useMemo(() => {
    return titles
      .filter((title) => mediaFilter === "all" || title.mediaType === mediaFilter)
      .filter((title) => activeGenre === ALL_GENRES || title.genres.includes(activeGenre))
      .filter((title) => liveCatalog || includesQuery(title, query))
      .sort((a, b) => b.rating - a.rating || b.year - a.year);
  }, [activeGenre, liveCatalog, mediaFilter, query, titles]);

  const backdropTitle = results[0] ?? titles[0];

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/[0.06] px-5 pb-8 pt-28 md:px-10 md:pt-32 lg:px-12">
        {backdropTitle && (
          <div className="absolute inset-0 opacity-[0.2]" aria-hidden="true">
            <CatalogImage
              src={backdropUrl(backdropTitle.backdropPath, "w1280")}
              alt=""
              sizes="100vw"
              fallbackLabel={backdropTitle.name.charAt(0)}
              className="scale-105 blur-[2px]"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/88 to-ink/62" />

        <div className="relative z-10 max-w-5xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-velvet-bright">
            Projection index
          </p>
          <h1 className="mt-3 font-display text-5xl italic leading-none text-silver md:text-7xl">
            Search Andshow
          </h1>

          <div className="mt-8 max-w-3xl">
            <label className="relative block">
              <span className="sr-only">Search titles</span>
              <Search
                size={20}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Title, actor, genre, year..."
                className="h-14 w-full rounded-full border border-white/10 bg-ink/72 px-12 text-[16px] text-silver shadow-2xl outline-none backdrop-blur transition-colors placeholder:text-ash/70 hover:border-white/20 focus:border-velvet-bright"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ash transition-colors hover:bg-white/5 hover:text-silver"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </label>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-white/[0.06] bg-ink/84 px-5 py-3 backdrop-blur-2xl md:top-[68px] md:px-10 lg:px-12">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit rounded-full border border-white/10 bg-graphite/60 p-1">
            {[
              { key: "all", label: "All", icon: Search },
              { key: "movie", label: "Movies", icon: Film },
              { key: "tv", label: "TV", icon: Tv },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = mediaFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setMediaFilter(item.key as MediaFilter)}
                  aria-pressed={isActive}
                  className={`flex h-9 items-center gap-2 rounded-full px-4 text-[12px] transition-colors ${
                    isActive ? "bg-silver text-ink" : "text-ash hover:text-silver"
                  }`}
                >
                  <Icon size={14} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Genre filters">
            {availableGenres.map((genre) => {
              const isActive = genre === activeGenre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  aria-pressed={isActive}
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
        </div>
      </section>

      <section className="px-5 py-9 md:px-10 lg:px-12" aria-labelledby="search-results-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ash">
              {loading ? "Searching..." : `${results.length} results`}
            </p>
            <h2 id="search-results-heading" className="mt-1 text-xl font-medium text-silver">
              {query.trim() ? `Matches for "${query.trim()}"` : "All catalog titles"}
            </h2>
          </div>
        </div>

        {results.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-3.5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((title) => (
              <li key={`${title.mediaType}-${title.id}`} className="min-w-0">
                <MovieCard title={title} onSelect={setSelectedTitle} variant="grid" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid min-h-[280px] place-items-center border-y border-white/[0.06] text-center">
            <div>
              <p className="font-display text-3xl italic text-silver">Nothing in the reel.</p>
              <p className="mt-2 text-sm text-ash">Try a title, actor, genre, or year.</p>
            </div>
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
