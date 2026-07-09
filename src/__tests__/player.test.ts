import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MOCK_TITLES } from "@/data/mockMovies";
import {
  applyWatchSourceTemplate,
  getCinebyWatchUrl,
  getVidsrcPlayerUrl,
  getVidkingPlayerUrl,
  getWatchSources,
} from "@/lib/player";
import { getWatchPath } from "@/lib/watch-path";

const movie = MOCK_TITLES.find((title) => title.mediaType === "movie")!;
const series = MOCK_TITLES.find((title) => title.mediaType === "tv")!;

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_VIDSRC_EMBED_BASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_ANDSHOW_CUSTOM_MOVIE_EMBED_TEMPLATE", "");
  vi.stubEnv("NEXT_PUBLIC_ANDSHOW_CUSTOM_TV_EMBED_TEMPLATE", "");
  vi.stubEnv("NEXT_PUBLIC_ANDSHOW_CUSTOM_EMBED_LABEL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getWatchPath", () => {
  test("returns movie watch routes", () => {
    expect(getWatchPath(movie)).toBe(`/watch/movie/${movie.id}`);
  });

  test("returns default TV episode watch routes", () => {
    expect(getWatchPath(series)).toBe(`/watch/tv/${series.id}/1/1`);
  });
});

describe("getVidsrcPlayerUrl", () => {
  test("returns Vidsrc movie embed URLs with autoplay", () => {
    expect(getVidsrcPlayerUrl({ mediaType: "movie", id: movie.id })).toBe(
      `https://vidsrcme.su/embed/movie/${movie.id}?autoplay=1`,
    );
  });

  test("returns Vidsrc TV episode embed URLs with autoplay and autonext", () => {
    expect(
      getVidsrcPlayerUrl({
        mediaType: "tv",
        id: series.id,
        season: 2,
        episode: 7,
      }),
    ).toBe(
      `https://vidsrcme.su/embed/tv/${series.id}/2-7?autoplay=1&autonext=1`,
    );
  });
});

describe("getVidkingPlayerUrl", () => {
  test("returns Vidking movie embed URLs with Andshow styling", () => {
    expect(getVidkingPlayerUrl({ mediaType: "movie", id: movie.id })).toBe(
      `https://www.vidking.net/embed/movie/${movie.id}?color=dd6a71`,
    );
  });

  test("returns Vidking TV embed URLs with episode controls", () => {
    expect(
      getVidkingPlayerUrl({
        mediaType: "tv",
        id: series.id,
        season: 2,
        episode: 7,
      }),
    ).toBe(
      `https://www.vidking.net/embed/tv/${series.id}/2/7?color=dd6a71&nextEpisode=true&episodeSelector=true`,
    );
  });
});

describe("getCinebyWatchUrl", () => {
  test("returns Cineby movie fallback URLs", () => {
    expect(getCinebyWatchUrl({ mediaType: "movie", id: movie.id })).toBe(
      `https://www.cineby.at/movie/${movie.id}?play=true`,
    );
  });

  test("returns Cineby TV fallback URLs", () => {
    expect(getCinebyWatchUrl({ mediaType: "tv", id: series.id, season: 2, episode: 7 })).toBe(
      `https://www.cineby.at/tv/${series.id}/2/7?play=true`,
    );
  });
});

describe("applyWatchSourceTemplate", () => {
  test("renders movie templates with TMDB placeholders", () => {
    expect(
      applyWatchSourceTemplate("https://watch.example.test/{mediaType}/{tmdbId}", {
        mediaType: "movie",
        id: movie.id,
      }),
    ).toBe(`https://watch.example.test/movie/${movie.id}`);
  });

  test("renders TV templates with season and episode placeholders", () => {
    expect(
      applyWatchSourceTemplate(
        "https://watch.example.test/tv/{tmdbId}/{season}-{episode}",
        {
          mediaType: "tv",
          id: series.id,
          season: 2,
          episode: 7,
        },
      ),
    ).toBe(`https://watch.example.test/tv/${series.id}/2-7`);
  });

  test("rejects non-http templates", () => {
    expect(
      applyWatchSourceTemplate("javascript:alert({tmdbId})", {
        mediaType: "movie",
        id: movie.id,
      }),
    ).toBeNull();
  });
});

describe("getWatchSources", () => {
  test("returns Vidsrc, Vidking, and Cineby by default", () => {
    expect(getWatchSources({ mediaType: "movie", id: movie.id })).toEqual([
      {
        id: "vidsrc",
        label: "Vidsrc",
        detail: "Embed",
        kind: "iframe",
        url: `https://vidsrcme.su/embed/movie/${movie.id}?autoplay=1`,
      },
      {
        id: "vidking",
        label: "Vidking",
        detail: "Embed",
        kind: "iframe",
        url: `https://www.vidking.net/embed/movie/${movie.id}?color=dd6a71`,
        progressOrigin: "https://www.vidking.net",
      },
      {
        id: "cineby",
        label: "Cineby",
        detail: "External",
        kind: "external",
        url: `https://www.cineby.at/movie/${movie.id}?play=true`,
      },
    ]);
  });

  test("adds a configured movie iframe source", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_ANDSHOW_CUSTOM_MOVIE_EMBED_TEMPLATE",
      "https://watch.example.test/movie/{tmdbId}",
    );
    vi.stubEnv("NEXT_PUBLIC_ANDSHOW_CUSTOM_EMBED_LABEL", "House");

    expect(getWatchSources({ mediaType: "movie", id: movie.id })).toContainEqual({
      id: "custom",
      label: "House",
      detail: "Configured iframe",
      kind: "iframe",
      url: `https://watch.example.test/movie/${movie.id}`,
    });
  });

  test("adds a configured TV iframe source", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_ANDSHOW_CUSTOM_TV_EMBED_TEMPLATE",
      "https://watch.example.test/tv/{tmdbId}/{season}/{episode}",
    );

    expect(
      getWatchSources({
        mediaType: "tv",
        id: series.id,
        season: 2,
        episode: 7,
      }),
    ).toContainEqual({
      id: "custom",
      label: "Custom",
      detail: "Configured iframe",
      kind: "iframe",
      url: `https://watch.example.test/tv/${series.id}/2/7`,
    });
  });
});
