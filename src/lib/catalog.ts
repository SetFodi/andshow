import {
  CONTINUE_WATCHING,
  FEATURED_IDS,
  MOCK_TITLES,
  RAIL_DEFINITIONS,
} from "@/data/mockMovies";
import { dedupeTitles } from "@/lib/titles";
import type { MediaType, Rail, RailItem, Title } from "@/lib/types";
import {
  discoverMovies,
  discoverTv,
  findGenreIdByName,
  getMovieDetails,
  getMovieGenreMap,
  getTvDetails,
  getTvGenreMap,
  isTmdbConfigured,
  nowPlayingMovies,
  searchMulti,
  topRatedMovies,
  topRatedTv,
  trendingAll,
  trendingDay,
} from "@/lib/tmdb/client";
import {
  filterTitlesByMediaType,
  mapMovieDetails,
  mapMovieSummary,
  mapMultiResult,
  mapTvDetails,
  mapTvSummary,
} from "@/lib/tmdb/map";

export type CatalogScope = "movies" | "tv" | "browse" | "search";

export interface CatalogPage {
  titles: readonly Title[];
  page: number;
  totalPages: number;
  totalResults: number;
  liveCatalog: boolean;
}

export interface CatalogQuery {
  scope: CatalogScope;
  page?: number;
  query?: string;
  genre?: string;
  mediaType?: MediaType | "all";
}

const titlesById = new Map<number, Title>(MOCK_TITLES.map((title) => [title.id, title]));

const progressByTitleId = new Map(
  CONTINUE_WATCHING.map((entry) => [entry.titleId, entry]),
);

function byRatingYearName(a: Title, b: Title): number {
  return b.rating - a.rating || b.year - a.year || a.name.localeCompare(b.name);
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function requireTitle(id: number): Title {
  const title = titlesById.get(id);
  if (!title) {
    throw new Error(`Catalog integrity error: no title with id ${id}`);
  }
  return title;
}

function toCatalogPage(
  titles: readonly Title[],
  page: number,
  totalPages: number,
  totalResults: number,
): CatalogPage {
  return { titles: dedupeTitles(titles), page, totalPages, totalResults, liveCatalog: true };
}

function toMockCatalogPage(titles: readonly Title[]): CatalogPage {
  return { titles, page: 1, totalPages: 1, totalResults: titles.length, liveCatalog: false };
}

export function isLiveCatalogEnabled(): boolean {
  return isTmdbConfigured();
}

function mockMatchesSearch(title: Title, query: string): boolean {
  const haystack = [
    title.name,
    title.yearLabel,
    title.runtimeLabel,
    title.overview,
    ...title.genres,
    ...title.cast,
  ]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(query);
}

function getMockCatalogPage(query: CatalogQuery): CatalogPage {
  let titles: Title[] = [...MOCK_TITLES];

  if (query.scope === "movies") {
    titles = titles.filter((title) => title.mediaType === "movie");
  } else if (query.scope === "tv") {
    titles = titles.filter((title) => title.mediaType === "tv");
  } else if (query.scope === "search") {
    const needle = normalize(query.query ?? "");
    titles = needle ? titles.filter((title) => mockMatchesSearch(title, needle)) : [...MOCK_TITLES];
  }

  if (query.genre) {
    const genre = normalize(query.genre);
    titles = titles.filter((title) => title.genres.some((name) => normalize(name) === genre));
  }

  if (query.mediaType && query.mediaType !== "all") {
    titles = titles.filter((title) => title.mediaType === query.mediaType);
  }

  titles.sort(byRatingYearName);
  return toMockCatalogPage(titles);
}

async function fetchTmdbCatalog(query: CatalogQuery): Promise<CatalogPage> {
  const page = query.page ?? 1;
  const [movieGenres, tvGenres] = await Promise.all([getMovieGenreMap(), getTvGenreMap()]);
  const genreMaps = { movie: movieGenres, tv: tvGenres };
  const scopeMediaType =
    query.scope === "movies" ? "movie" : query.scope === "tv" ? "tv" : "all";
  const genreId = query.genre
    ? await findGenreIdByName(query.genre, scopeMediaType)
    : undefined;

  const applyFilters = (titles: Title[]): Title[] => {
    let filtered = titles;
    if (query.mediaType && query.mediaType !== "all") {
      filtered = filterTitlesByMediaType(filtered, query.mediaType);
    }
    if (query.genre && query.scope !== "movies" && query.scope !== "tv") {
      const genre = normalize(query.genre);
      filtered = filtered.filter((title) =>
        title.genres.some((name) => normalize(name) === genre),
      );
    }
    return filtered;
  };

  if (query.scope === "movies") {
    const data = await discoverMovies(page, genreId);
    return toCatalogPage(
      data.results.map((item) => mapMovieSummary(item, movieGenres)),
      data.page,
      data.total_pages,
      data.total_results,
    );
  }

  if (query.scope === "tv") {
    const data = await discoverTv(page, genreId);
    return toCatalogPage(
      data.results.map((item) => mapTvSummary(item, tvGenres)),
      data.page,
      data.total_pages,
      data.total_results,
    );
  }

  if (query.scope === "search") {
    const searchQuery = (query.query ?? "").trim();
    if (!searchQuery) {
      return fetchTmdbCatalog({ ...query, scope: "browse" });
    }
    const data = await searchMulti(searchQuery, page);
    return toCatalogPage(
      applyFilters(
        data.results
          .map((item) => mapMultiResult(item, genreMaps))
          .filter((title): title is Title => title !== null),
      ),
      data.page,
      data.total_pages,
      data.total_results,
    );
  }

  const data = await trendingAll(page);
  return toCatalogPage(
    applyFilters(
      data.results
        .map((item) => mapMultiResult(item, genreMaps))
        .filter((title): title is Title => title !== null),
    ),
    data.page,
    data.total_pages,
    data.total_results,
  );
}

export async function getCatalogPage(query: CatalogQuery): Promise<CatalogPage> {
  if (isLiveCatalogEnabled()) {
    try {
      return await fetchTmdbCatalog(query);
    } catch (error) {
      console.error("[Andshow catalog] TMDB catalog fetch failed, using mock catalog", error);
    }
  }

  return getMockCatalogPage(query);
}

export async function getFeaturedTitles(): Promise<readonly Title[]> {
  if (isTmdbConfigured()) {
    try {
      const [movieGenres, tvGenres, data] = await Promise.all([
        getMovieGenreMap(),
        getTvGenreMap(),
        trendingDay(1),
      ]);

      const titles = data.results
        .map((item) => mapMultiResult(item, { movie: movieGenres, tv: tvGenres }))
        .filter((title): title is Title => title !== null)
        .slice(0, 5);

      if (titles.length > 0) return titles;
    } catch (error) {
      console.error("[Andshow catalog] TMDB featured fetch failed, using mock featured set", error);
    }
  }

  return FEATURED_IDS.map(requireTitle);
}

export async function getAllTitles(): Promise<readonly Title[]> {
  const page = await getCatalogPage({ scope: "browse", page: 1 });
  return page.titles;
}

export async function getTitlesByMediaType(mediaType: MediaType): Promise<readonly Title[]> {
  const page = await getCatalogPage({
    scope: mediaType === "movie" ? "movies" : "tv",
    page: 1,
  });
  return page.titles;
}

export async function getAllGenres(mediaType?: MediaType): Promise<readonly string[]> {
  if (isTmdbConfigured()) {
    try {
      const maps =
        mediaType === "movie"
          ? [await getMovieGenreMap()]
          : mediaType === "tv"
            ? [await getTvGenreMap()]
            : [await getMovieGenreMap(), await getTvGenreMap()];

      const names = new Set<string>();
      for (const map of maps) {
        for (const name of map.values()) names.add(name);
      }
      return [...names].sort((a, b) => a.localeCompare(b));
    } catch (error) {
      console.error("[Andshow catalog] TMDB genre fetch failed, using mock genres", error);
    }
  }

  const titles = mediaType
    ? MOCK_TITLES.filter((title) => title.mediaType === mediaType)
    : MOCK_TITLES;
  return [...new Set(titles.flatMap((title) => title.genres))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export async function searchTitles(query: string): Promise<readonly Title[]> {
  const page = await getCatalogPage({ scope: "search", query, page: 1 });
  return page.titles;
}

function buildMockHomeRails(): readonly Rail[] {
  return RAIL_DEFINITIONS.map((definition) => ({
    id: definition.id,
    heading: definition.heading,
    layout: definition.layout,
    items: definition.ids.map((id): RailItem => {
      const title = requireTitle(id);
      const watching = definition.layout === "wide" ? progressByTitleId.get(id) : undefined;
      return watching
        ? { title, progress: watching.progress, remainingLabel: watching.remainingLabel }
        : { title };
    }),
  }));
}

async function buildContinueWatchingRail(): Promise<Rail> {
  // Continue Watching is client-owned (localStorage). Server returns an empty rail.
  return {
    id: "continue-watching",
    heading: "Continue Watching",
    layout: "wide",
    items: [],
  };
}

export async function getHomeRails(): Promise<readonly Rail[]> {
  if (isLiveCatalogEnabled()) {
    try {
      const [movieGenres, tvGenres] = await Promise.all([getMovieGenreMap(), getTvGenreMap()]);
      const genreMaps = { movie: movieGenres, tv: tvGenres };
      const mapMulti = (results: Awaited<ReturnType<typeof trendingAll>>["results"]) =>
        results
          .map((item) => mapMultiResult(item, genreMaps))
          .filter((title): title is Title => title !== null);

      const [trending, topMovies, topTv, nowPlaying, continueWatching] = await Promise.all([
        trendingAll(1),
        topRatedMovies(1),
        topRatedTv(1),
        nowPlayingMovies(1),
        buildContinueWatchingRail(),
      ]);

      const topRated = [
        ...topMovies.results.slice(0, 6).map((item) => mapMovieSummary(item, movieGenres)),
        ...topTv.results.slice(0, 6).map((item) => mapTvSummary(item, tvGenres)),
      ]
        .sort(byRatingYearName)
        .map((title): RailItem => ({ title }));

      return [
        {
          id: "trending",
          heading: "Trending Now",
          layout: "poster",
          items: mapMulti(trending.results).map((title): RailItem => ({ title })),
        },
        {
          id: "top-rated",
          heading: "Top Rated",
          layout: "poster",
          items: topRated,
        },
        continueWatching,
        {
          id: "new-releases",
          heading: "New Releases",
          layout: "poster",
          items: nowPlaying.results
            .map((item) => mapMovieSummary(item, movieGenres))
            .map((title): RailItem => ({ title })),
        },
      ];
    } catch (error) {
      console.error("[Andshow catalog] TMDB home rails fetch failed, using mock rails", error);
    }
  }

  return buildMockHomeRails();
}

export async function getTitleById(id: number, mediaType?: MediaType): Promise<Title | null> {
  if (isLiveCatalogEnabled()) {
    try {
      if (mediaType !== "tv") {
        const [movieGenres, movie] = await Promise.all([getMovieGenreMap(), getMovieDetails(id)]);
        if (movie) return mapMovieDetails(movie, movieGenres);
      }
      if (mediaType !== "movie") {
        const [tvGenres, show] = await Promise.all([getTvGenreMap(), getTvDetails(id)]);
        if (show) return mapTvDetails(show, tvGenres);
      }
    } catch (error) {
      console.error(`[Andshow catalog] TMDB title fetch failed for id ${id}`, error);
    }
  }

  const mockTitle = titlesById.get(id);
  if (!mockTitle) return null;
  if (mediaType && mockTitle.mediaType !== mediaType) return null;
  return mockTitle;
}
