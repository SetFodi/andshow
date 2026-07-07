import { describe, expect, test } from "vitest";
import {
  CONTINUE_WATCHING,
  FEATURED_IDS,
  MOCK_TITLES,
  RAIL_DEFINITIONS,
} from "@/data/mockMovies";

const MIN_RELEASE_YEAR = 1900;
const MAX_RELEASE_YEAR = 2100;

describe("mock catalog integrity", () => {
  test("title ids are unique", () => {
    // Arrange
    const ids = MOCK_TITLES.map((title) => title.id);

    // Act
    const uniqueIds = new Set(ids);

    // Assert
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("every title has valid image paths, rating, year, overview, and cast", () => {
    for (const title of MOCK_TITLES) {
      expect(title.posterPath).toMatch(/^\/.+\.(jpg|png)$/);
      expect(title.backdropPath).toMatch(/^\/.+\.(jpg|png)$/);
      expect(title.rating).toBeGreaterThanOrEqual(0);
      expect(title.rating).toBeLessThanOrEqual(10);
      expect(title.year).toBeGreaterThan(MIN_RELEASE_YEAR);
      expect(title.year).toBeLessThan(MAX_RELEASE_YEAR);
      expect(title.overview.length).toBeGreaterThan(0);
      expect(title.cast.length).toBeGreaterThan(0);
      expect(title.genres.length).toBeGreaterThan(0);
      expect(title.runtimeLabel.length).toBeGreaterThan(0);
    }
  });

  test("every rail, featured, and continue-watching id resolves to a title", () => {
    // Arrange
    const knownIds = new Set(MOCK_TITLES.map((title) => title.id));
    const referencedIds = [
      ...FEATURED_IDS,
      ...RAIL_DEFINITIONS.flatMap((rail) => rail.ids),
      ...CONTINUE_WATCHING.map((entry) => entry.titleId),
    ];

    // Assert
    for (const id of referencedIds) {
      expect(knownIds.has(id), `id ${id} missing from MOCK_TITLES`).toBe(true);
    }
  });

  test("continue-watching progress stays within 0 and 1", () => {
    for (const entry of CONTINUE_WATCHING) {
      expect(entry.progress).toBeGreaterThanOrEqual(0);
      expect(entry.progress).toBeLessThanOrEqual(1);
      expect(entry.remainingLabel.length).toBeGreaterThan(0);
    }
  });

  test("rails contain no duplicate titles within a rail", () => {
    for (const rail of RAIL_DEFINITIONS) {
      expect(new Set(rail.ids).size).toBe(rail.ids.length);
    }
  });
});
