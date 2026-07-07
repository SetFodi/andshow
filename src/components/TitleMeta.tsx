import { Star } from "lucide-react";
import type { Title } from "@/lib/types";

/** Long TMDB genre names abbreviated for the mono print-label rows. */
const GENRE_SHORT: Record<string, string> = {
  "Science Fiction": "Sci-Fi",
  "Sci-Fi & Fantasy": "Sci-Fi",
  "Action & Adventure": "Action",
};

export function shortGenre(genre: string): string {
  return GENRE_SHORT[genre] ?? genre;
}

interface TitleMetaProps {
  title: Title;
  /** How many genres to append after year and runtime. */
  genreCount?: number;
  className?: string;
}

/**
 * The film-print label: rating, year, runtime, and genres in tracked
 * mono caps, separated by middle dots. Used by hero, cards, and drawer.
 */
export function TitleMeta({ title, genreCount = 2, className = "" }: TitleMetaProps) {
  const parts = [
    title.yearLabel,
    title.runtimeLabel,
    ...title.genres.slice(0, genreCount).map(shortGenre),
  ];

  return (
    <p
      className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs uppercase tracking-[0.18em] text-ash ${className}`}
    >
      <span className="flex items-center gap-1.5 text-silver">
        <Star size={11} strokeWidth={0} className="fill-velvet-bright" aria-hidden="true" />
        <span aria-label={`Rated ${title.rating.toFixed(1)} out of 10`}>
          {title.rating.toFixed(1)}
        </span>
      </span>
      {parts.map((part) => (
        <span key={part} className="flex items-center gap-x-2.5">
          <span className="text-white/25" aria-hidden="true">
            ·
          </span>
          {part}
        </span>
      ))}
    </p>
  );
}
