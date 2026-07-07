import { describe, expect, test } from "vitest";
import { MOCK_TITLES } from "@/data/mockMovies";
import { dedupeTitles, titleKey } from "@/lib/titles";

describe("titleKey", () => {
  test("combines mediaType and id", () => {
    const title = MOCK_TITLES[0];
    expect(titleKey(title)).toBe(`${title.mediaType}-${title.id}`);
  });
});

describe("dedupeTitles", () => {
  test("keeps first occurrence and preserves order", () => {
    const first = MOCK_TITLES[0];
    const duplicate = { ...first, name: "Duplicate copy" };
    const other = MOCK_TITLES[1];

    expect(dedupeTitles([first, duplicate, other])).toEqual([first, other]);
  });

  test("returns empty array for empty input", () => {
    expect(dedupeTitles([])).toEqual([]);
  });
});
