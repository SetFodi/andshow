import { describe, expect, test } from "vitest";
import { FEATURED_IDS, MOCK_TITLES, RAIL_DEFINITIONS } from "@/data/mockMovies";
import {
  getAllGenres,
  getAllTitles,
  getCatalogPage,
  getFeaturedTitles,
  getHomeRails,
  getTitlesByMediaType,
  getTitleById,
  isLiveCatalogEnabled,
  searchTitles,
} from "@/lib/catalog";

describe("getAllTitles", () => {
  test("returns every title sorted for catalog browsing", async () => {
    // Act
    const titles = await getAllTitles();

    // Assert
    expect(titles).toHaveLength(MOCK_TITLES.length);
    expect(titles.map((title) => title.id)).toEqual(
      [...MOCK_TITLES]
        .sort((a, b) => b.rating - a.rating || b.year - a.year || a.name.localeCompare(b.name))
        .map((title) => title.id),
    );
  });
});

describe("getFeaturedTitles", () => {
  test("returns featured titles in curated order", async () => {
    // Act
    const featured = await getFeaturedTitles();

    // Assert
    expect(featured.map((title) => title.id)).toEqual([...FEATURED_IDS]);
  });
});

describe("getTitlesByMediaType", () => {
  test("returns only requested media type", async () => {
    // Act
    const movies = await getTitlesByMediaType("movie");
    const series = await getTitlesByMediaType("tv");

    // Assert
    expect(movies.length).toBeGreaterThan(0);
    expect(series.length).toBeGreaterThan(0);
    expect(movies.every((title) => title.mediaType === "movie")).toBe(true);
    expect(series.every((title) => title.mediaType === "tv")).toBe(true);
  });
});

describe("getAllGenres", () => {
  test("returns unique genres in alphabetical order", async () => {
    // Act
    const genres = await getAllGenres();

    // Assert
    const expected = [...new Set(MOCK_TITLES.flatMap((title) => title.genres))].sort((a, b) =>
      a.localeCompare(b),
    );
    expect(genres).toEqual(expected);
  });
});

describe("searchTitles", () => {
  test("matches title fields and cast fields", async () => {
    // Act
    const byName = await searchTitles("interstellar");
    const byCast = await searchTitles("Matthew McConaughey");

    // Assert
    expect(byName.map((title) => title.name)).toContain("Interstellar");
    expect(byCast.map((title) => title.name)).toContain("Interstellar");
  });

  test("empty query returns the browsable catalog", async () => {
    await expect(searchTitles("   ")).resolves.toEqual(await getAllTitles());
  });
});

describe("getHomeRails", () => {
  test("returns every defined rail with resolved titles", async () => {
    // Act
    const rails = await getHomeRails();

    // Assert
    expect(rails.map((rail) => rail.id)).toEqual(RAIL_DEFINITIONS.map((rail) => rail.id));
    for (const rail of rails) {
      expect(rail.items.length).toBeGreaterThan(0);
      for (const item of rail.items) {
        expect(item.title.name.length).toBeGreaterThan(0);
      }
    }
  });

  test("wide rail items carry progress and remaining label", async () => {
    // Arrange
    const rails = await getHomeRails();
    const wideRail = rails.find((rail) => rail.layout === "wide");

    // Assert
    expect(wideRail).toBeDefined();
    for (const item of wideRail!.items) {
      expect(item.progress).toBeGreaterThanOrEqual(0);
      expect(item.progress).toBeLessThanOrEqual(1);
      expect(item.remainingLabel).toBeTruthy();
    }
  });

  test("poster rail items carry no watch progress", async () => {
    // Arrange
    const rails = await getHomeRails();
    const posterRail = rails.find((rail) => rail.layout === "poster");

    // Assert
    expect(posterRail).toBeDefined();
    for (const item of posterRail!.items) {
      expect(item.progress).toBeUndefined();
    }
  });

  test("returns fresh arrays so callers cannot mutate shared state", async () => {
    // Arrange
    const firstResult = (await getHomeRails()) as Array<unknown>;
    const originalLength = firstResult.length;

    // Act
    firstResult.pop();
    const secondResult = await getHomeRails();

    // Assert
    expect(secondResult.length).toBe(originalLength);
  });
});

describe("getTitleById", () => {
  test("resolves a known id", async () => {
    const title = await getTitleById(FEATURED_IDS[0]);
    expect(title?.id).toBe(FEATURED_IDS[0]);
  });

  test("returns null for an unknown id", async () => {
    expect(await getTitleById(-1)).toBeNull();
  });
});


describe("isLiveCatalogEnabled", () => {
  test("is false without TMDB_API_KEY in tests", () => {
    expect(isLiveCatalogEnabled()).toBe(false);
  });
});

describe("getCatalogPage", () => {
  test("returns mock browse page metadata", async () => {
    const page = await getCatalogPage({ scope: "browse", page: 1 });

    expect(page.liveCatalog).toBe(false);
    expect(page.page).toBe(1);
    expect(page.totalPages).toBe(1);
    expect(page.titles).toHaveLength(MOCK_TITLES.length);
  });

  test("filters movies scope to films only", async () => {
    const page = await getCatalogPage({ scope: "movies", page: 1 });

    expect(page.titles.every((title) => title.mediaType === "movie")).toBe(true);
  });
});
