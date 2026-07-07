import type {
  TmdbCastMember,
  TmdbMovieDetails,
  TmdbMovieSummary,
  TmdbMultiResult,
  TmdbTvDetails,
  TmdbTvSummary,
} from "@/lib/tmdb/client";
import type { MediaType, Title } from "@/lib/types";

function parseYear(date: string | undefined): number {
  if (!date) return 0;
  const year = Number(date.slice(0, 4));
  return Number.isFinite(year) ? year : 0;
}

function roundRating(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.round(value * 10) / 10;
}

function mapGenres(genreIds: readonly number[], genreMap: Map<number, string>): string[] {
  return genreIds.map((id) => genreMap.get(id)).filter((name): name is string => Boolean(name));
}

function mapCast(cast: readonly TmdbCastMember[] | undefined, limit = 4): string[] {
  return [...(cast ?? [])]
    .sort((a, b) => a.order - b.order)
    .slice(0, limit)
    .map((member) => member.name);
}

function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatTvYearLabel(firstAirDate: string, lastAirDate: string, status: string): string {
  const firstYear = parseYear(firstAirDate);
  if (!firstYear) return "—";

  if (status === "Ended" || status === "Canceled") {
    const lastYear = parseYear(lastAirDate);
    if (lastYear && lastYear !== firstYear) return `${firstYear}–${lastYear}`;
  }

  if (status === "Returning Series" || status === "In Production") {
    return `${firstYear}–`;
  }

  return String(firstYear);
}

function formatSeasonLabel(seasons: number | undefined): string {
  if (!seasons || seasons <= 0) return "Series";
  return seasons === 1 ? "Miniseries" : `${seasons} Seasons`;
}

export function mapMovieSummary(item: TmdbMovieSummary, genreMap: Map<number, string>): Title {
  const year = parseYear(item.release_date);
  return {
    id: item.id,
    mediaType: "movie",
    name: item.title,
    year,
    yearLabel: year ? String(year) : "—",
    runtimeLabel: "—",
    rating: roundRating(item.vote_average),
    genres: mapGenres(item.genre_ids, genreMap),
    overview: item.overview,
    cast: [],
    posterPath: item.poster_path ?? "",
    backdropPath: item.backdrop_path ?? "",
  };
}

export function mapTvSummary(item: TmdbTvSummary, genreMap: Map<number, string>): Title {
  const year = parseYear(item.first_air_date);
  return {
    id: item.id,
    mediaType: "tv",
    name: item.name,
    year,
    yearLabel: year ? `${year}–` : "—",
    runtimeLabel: "Series",
    rating: roundRating(item.vote_average),
    genres: mapGenres(item.genre_ids, genreMap),
    overview: item.overview,
    cast: [],
    posterPath: item.poster_path ?? "",
    backdropPath: item.backdrop_path ?? "",
  };
}

export function mapMultiResult(item: TmdbMultiResult, genreMaps: {
  movie: Map<number, string>;
  tv: Map<number, string>;
}): Title | null {
  if (item.media_type === "person") return null;

  if (item.media_type === "movie") {
    return mapMovieSummary(
      {
        id: item.id,
        title: item.title ?? "Untitled",
        overview: item.overview ?? "",
        poster_path: item.poster_path ?? null,
        backdrop_path: item.backdrop_path ?? null,
        release_date: item.release_date ?? "",
        vote_average: item.vote_average ?? 0,
        genre_ids: item.genre_ids ?? [],
      },
      genreMaps.movie,
    );
  }

  return mapTvSummary(
    {
      id: item.id,
      name: item.name ?? "Untitled",
      overview: item.overview ?? "",
      poster_path: item.poster_path ?? null,
      backdrop_path: item.backdrop_path ?? null,
      first_air_date: item.first_air_date ?? "",
      vote_average: item.vote_average ?? 0,
      genre_ids: item.genre_ids ?? [],
    },
    genreMaps.tv,
  );
}

export function mapMovieDetails(item: TmdbMovieDetails, genreMap: Map<number, string>): Title {
  const summary = mapMovieSummary(item, genreMap);
  return {
    ...summary,
    runtimeLabel: formatRuntime(item.runtime),
    cast: mapCast(item.credits?.cast),
  };
}

export function mapTvDetails(item: TmdbTvDetails, genreMap: Map<number, string>): Title {
  const summary = mapTvSummary(item, genreMap);
  return {
    ...summary,
    yearLabel: formatTvYearLabel(item.first_air_date, item.last_air_date, item.status),
    runtimeLabel: formatSeasonLabel(item.number_of_seasons),
    cast: mapCast(item.credits?.cast),
  };
}

export function filterTitlesByMediaType(
  titles: readonly Title[],
  mediaType?: MediaType,
): Title[] {
  if (!mediaType) return [...titles];
  return titles.filter((title) => title.mediaType === mediaType);
}
