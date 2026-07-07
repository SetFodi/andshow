import { describe, expect, test } from "vitest";
import type {
  TmdbMovieDetails,
  TmdbMovieSummary,
  TmdbMultiResult,
  TmdbTvDetails,
  TmdbTvSummary,
} from "@/lib/tmdb/client";
import {
  filterTitlesByMediaType,
  mapMovieDetails,
  mapMovieSummary,
  mapMultiResult,
  mapTvDetails,
  mapTvSummary,
} from "@/lib/tmdb/map";

const movieGenres = new Map<number, string>([
  [28, "Action"],
  [878, "Science Fiction"],
]);

const tvGenres = new Map<number, string>([
  [18, "Drama"],
  [10765, "Sci-Fi & Fantasy"],
]);

const movieSummary: TmdbMovieSummary = {
  id: 27205,
  title: "Inception",
  overview: "A thief enters dreams.",
  poster_path: "/poster.jpg",
  backdrop_path: "/backdrop.jpg",
  release_date: "2010-07-16",
  vote_average: 8.36,
  genre_ids: [28, 878],
};

const tvSummary: TmdbTvSummary = {
  id: 1396,
  name: "Breaking Bad",
  overview: "A chemistry teacher turns criminal.",
  poster_path: "/tv-poster.jpg",
  backdrop_path: "/tv-backdrop.jpg",
  first_air_date: "2008-01-20",
  vote_average: 8.92,
  genre_ids: [18],
};

describe("mapMovieSummary", () => {
  test("maps TMDB movie fields into a Title", () => {
    const title = mapMovieSummary(movieSummary, movieGenres);

    expect(title).toMatchObject({
      id: 27205,
      mediaType: "movie",
      name: "Inception",
      year: 2010,
      yearLabel: "2010",
      runtimeLabel: "—",
      rating: 8.4,
      genres: ["Action", "Science Fiction"],
      posterPath: "/poster.jpg",
      backdropPath: "/backdrop.jpg",
    });
  });
});

describe("mapTvSummary", () => {
  test("maps TMDB series fields into a Title", () => {
    const title = mapTvSummary(tvSummary, tvGenres);

    expect(title).toMatchObject({
      id: 1396,
      mediaType: "tv",
      name: "Breaking Bad",
      year: 2008,
      yearLabel: "2008–",
      runtimeLabel: "Series",
      rating: 8.9,
      genres: ["Drama"],
    });
  });
});

describe("mapMultiResult", () => {
  test("maps movie and tv multi results and skips people", () => {
    const movie: TmdbMultiResult = {
      id: 27205,
      media_type: "movie",
      title: "Inception",
      overview: "Dream heist.",
      poster_path: "/poster.jpg",
      backdrop_path: "/backdrop.jpg",
      release_date: "2010-07-16",
      vote_average: 8.3,
      genre_ids: [28],
    };
    const show: TmdbMultiResult = {
      id: 1396,
      media_type: "tv",
      name: "Breaking Bad",
      overview: "Crime drama.",
      poster_path: "/tv-poster.jpg",
      backdrop_path: "/tv-backdrop.jpg",
      first_air_date: "2008-01-20",
      vote_average: 8.9,
      genre_ids: [18],
    };
    const person: TmdbMultiResult = { id: 1, media_type: "person", name: "Actor" };

    expect(mapMultiResult(movie, { movie: movieGenres, tv: tvGenres })?.mediaType).toBe("movie");
    expect(mapMultiResult(show, { movie: movieGenres, tv: tvGenres })?.mediaType).toBe("tv");
    expect(mapMultiResult(person, { movie: movieGenres, tv: tvGenres })).toBeNull();
  });
});

describe("mapMovieDetails", () => {
  test("adds runtime and cast from detail payload", () => {
    const details: TmdbMovieDetails = {
      ...movieSummary,
      runtime: 148,
      credits: {
        cast: [
          { name: "Leonardo DiCaprio", order: 0 },
          { name: "Joseph Gordon-Levitt", order: 1 },
        ],
      },
    };

    const title = mapMovieDetails(details, movieGenres);
    expect(title.runtimeLabel).toBe("2h 28m");
    expect(title.cast).toEqual(["Leonardo DiCaprio", "Joseph Gordon-Levitt"]);
  });
});

describe("mapTvDetails", () => {
  test("formats year range and season label", () => {
    const details: TmdbTvDetails = {
      ...tvSummary,
      number_of_seasons: 5,
      status: "Ended",
      last_air_date: "2013-09-29",
      credits: { cast: [{ name: "Bryan Cranston", order: 0 }] },
    };

    const title = mapTvDetails(details, tvGenres);
    expect(title.yearLabel).toBe("2008–2013");
    expect(title.runtimeLabel).toBe("5 Seasons");
    expect(title.cast).toEqual(["Bryan Cranston"]);
  });
});

describe("filterTitlesByMediaType", () => {
  test("filters by media type when provided", () => {
    const titles = [mapMovieSummary(movieSummary, movieGenres), mapTvSummary(tvSummary, tvGenres)];

    expect(filterTitlesByMediaType(titles, "movie")).toHaveLength(1);
    expect(filterTitlesByMediaType(titles, "tv")[0].name).toBe("Breaking Bad");
    expect(filterTitlesByMediaType(titles)).toHaveLength(2);
  });
});
