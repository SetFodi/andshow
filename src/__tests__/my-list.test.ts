import { beforeEach, describe, expect, test } from "vitest";
import { MOCK_TITLES } from "@/data/mockMovies";
import { isInMyList, myListToTitles, readMyList, toggleMyList } from "@/lib/my-list";

const sample = MOCK_TITLES[0];

beforeEach(() => {
  window.localStorage.clear();
});

describe("my-list", () => {
  test("toggles titles in and out of the list", () => {
    expect(isInMyList(sample.id, sample.mediaType)).toBe(false);
    expect(toggleMyList(sample)).toBe(true);
    expect(isInMyList(sample.id, sample.mediaType)).toBe(true);
    expect(readMyList()).toHaveLength(1);
    expect(toggleMyList(sample)).toBe(false);
    expect(readMyList()).toHaveLength(0);
  });

  test("converts entries back to titles", () => {
    toggleMyList(sample);
    const titles = myListToTitles(readMyList());
    expect(titles[0]?.id).toBe(sample.id);
    expect(titles[0]?.name).toBe(sample.name);
  });
});
