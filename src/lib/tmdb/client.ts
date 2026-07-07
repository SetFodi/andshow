const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface TmdbPagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbMovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TmdbTvSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TmdbMultiResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

export interface TmdbCastMember {
  name: string;
  order: number;
}

export interface TmdbMovieDetails extends TmdbMovieSummary {
  runtime: number | null;
  credits?: { cast: TmdbCastMember[] };
}

export interface TmdbTvDetails extends TmdbTvSummary {
  number_of_seasons: number;
  status: string;
  last_air_date: string;
  credits?: { cast: TmdbCastMember[] };
}

export function isTmdbConfigured(): boolean {
  return Boolean(process.env.TMDB_API_KEY?.trim() || process.env.TMDB_READ_ACCESS_TOKEN?.trim());
}

async function tmdbFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  const readToken = process.env.TMDB_READ_ACCESS_TOKEN?.trim();
  if (!apiKey && !readToken) {
    throw new Error("TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN is not configured");
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  }
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: readToken ? { Authorization: `Bearer ${readToken}` } : {},
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}

let movieGenresPromise: Promise<Map<number, string>> | null = null;
let tvGenresPromise: Promise<Map<number, string>> | null = null;

async function loadGenreMap(path: "/genre/movie/list" | "/genre/tv/list"): Promise<Map<number, string>> {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>(path);
  return new Map(data.genres.map((genre) => [genre.id, genre.name]));
}

export async function getMovieGenreMap(): Promise<Map<number, string>> {
  movieGenresPromise ??= loadGenreMap("/genre/movie/list");
  return movieGenresPromise;
}

export async function getTvGenreMap(): Promise<Map<number, string>> {
  tvGenresPromise ??= loadGenreMap("/genre/tv/list");
  return tvGenresPromise;
}

export async function discoverMovies(
  page: number,
  genreId?: number,
): Promise<TmdbPagedResponse<TmdbMovieSummary>> {
  const params: Record<string, string | number> = {
    page,
    sort_by: "popularity.desc",
    include_adult: "false",
  };
  if (genreId) params.with_genres = genreId;
  return tmdbFetch("/discover/movie", params);
}

export async function discoverTv(
  page: number,
  genreId?: number,
): Promise<TmdbPagedResponse<TmdbTvSummary>> {
  const params: Record<string, string | number> = {
    page,
    sort_by: "popularity.desc",
    include_adult: "false",
  };
  if (genreId) params.with_genres = genreId;
  return tmdbFetch("/discover/tv", params);
}

export async function trendingAll(page: number): Promise<TmdbPagedResponse<TmdbMultiResult>> {
  return tmdbFetch("/trending/all/week", { page });
}

export async function trendingDay(page: number): Promise<TmdbPagedResponse<TmdbMultiResult>> {
  return tmdbFetch("/trending/all/day", { page });
}

export async function topRatedMovies(page: number): Promise<TmdbPagedResponse<TmdbMovieSummary>> {
  return tmdbFetch("/discover/movie", {
    page,
    sort_by: "vote_average.desc",
    "vote_count.gte": 1000,
    include_adult: "false",
  });
}

export async function topRatedTv(page: number): Promise<TmdbPagedResponse<TmdbTvSummary>> {
  return tmdbFetch("/discover/tv", {
    page,
    sort_by: "vote_average.desc",
    "vote_count.gte": 500,
    include_adult: "false",
  });
}

export async function nowPlayingMovies(page: number): Promise<TmdbPagedResponse<TmdbMovieSummary>> {
  return tmdbFetch("/movie/now_playing", { page });
}

export async function searchMulti(
  query: string,
  page: number,
): Promise<TmdbPagedResponse<TmdbMultiResult>> {
  return tmdbFetch("/search/multi", {
    page,
    query,
    include_adult: "false",
  });
}

export async function getMovieDetails(id: number): Promise<TmdbMovieDetails | null> {
  try {
    return await tmdbFetch(`/movie/${id}`, { append_to_response: "credits" });
  } catch {
    return null;
  }
}

export async function getTvDetails(id: number): Promise<TmdbTvDetails | null> {
  try {
    return await tmdbFetch(`/tv/${id}`, { append_to_response: "credits" });
  } catch {
    return null;
  }
}

export async function findGenreIdByName(
  name: string,
  mediaType: "movie" | "tv" | "all",
): Promise<number | undefined> {
  const normalized = name.trim().toLocaleLowerCase();
  if (!normalized) return undefined;

  const maps =
    mediaType === "all"
      ? [await getMovieGenreMap(), await getTvGenreMap()]
      : mediaType === "movie"
        ? [await getMovieGenreMap()]
        : [await getTvGenreMap()];

  for (const map of maps) {
    for (const [id, genreName] of map.entries()) {
      if (genreName.toLocaleLowerCase() === normalized) return id;
    }
  }

  return undefined;
}
