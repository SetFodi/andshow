"use client";

import { Star } from "lucide-react";
import { CatalogImage } from "@/components/CatalogImage";
import { posterUrl } from "@/lib/tmdb-image";
import type { Title } from "@/lib/types";

interface MovieCardProps {
  title: Title;
  onSelect: (title: Title) => void;
  variant?: "rail" | "grid";
}

/**
 * Poster card: quiet at rest, lifts on hover and slides up a glass
 * label with name, rating, and year. Click opens the detail drawer.
 */
export function MovieCard({ title, onSelect, variant = "rail" }: MovieCardProps) {
  const isGrid = variant === "grid";

  return (
    <button
      type="button"
      onClick={() => onSelect(title)}
      aria-label={`${title.name} — details`}
      aria-haspopup="dialog"
      className={`group relative transform-gpu rounded-xl text-left transition-transform duration-500 ease-reel hover:z-10 hover:scale-[1.045] focus-visible:z-10 focus-visible:scale-[1.045] ${
        isGrid ? "w-full" : "w-[148px] shrink-0 snap-start sm:w-[164px] lg:w-[180px]"
      }`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-graphite ring-1 ring-white/[0.07]">
        <CatalogImage
          src={posterUrl(title.posterPath, "w342")}
          alt={`${title.name} poster`}
          sizes={
            isGrid
              ? "(min-width: 1280px) 180px, (min-width: 768px) 20vw, 42vw"
              : "(min-width: 1024px) 180px, (min-width: 640px) 164px, 148px"
          }
          fallbackLabel={title.name.charAt(0)}
          className="transition-transform duration-700 ease-reel group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
        <div className="glass absolute inset-x-2 bottom-2 translate-y-2 rounded-lg px-3 py-2.5 text-left opacity-0 transition-all duration-300 ease-reel group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <p className="truncate text-[13px] font-medium text-silver">{title.name}</p>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
            <Star size={9} strokeWidth={0} className="fill-velvet-bright" aria-hidden="true" />
            {title.rating.toFixed(1)}
            <span className="text-white/25" aria-hidden="true">
              ·
            </span>
            {title.yearLabel}
            <span className="text-white/25" aria-hidden="true">
              ·
            </span>
            {title.mediaType === "movie" ? "Film" : "Series"}
          </p>
        </div>
      </div>
      {isGrid && (
        <div className="mt-3 min-h-[54px]">
          <p className="line-clamp-2 text-[14px] font-medium leading-snug text-silver">
            {title.name}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
            <Star size={9} strokeWidth={0} className="fill-velvet-bright" aria-hidden="true" />
            {title.rating.toFixed(1)}
            <span className="text-white/25" aria-hidden="true">
              ·
            </span>
            {title.yearLabel}
            <span className="text-white/25" aria-hidden="true">
              ·
            </span>
            {title.mediaType === "movie" ? "Film" : "Series"}
          </p>
        </div>
      )}
    </button>
  );
}
