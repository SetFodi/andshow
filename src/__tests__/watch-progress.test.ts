import { beforeEach, describe, expect, test } from "vitest";
import { listContinueWatchingFromStorage, markWatchStarted } from "@/lib/watch-progress";

beforeEach(() => {
  window.localStorage.clear();
});

describe("watch-progress", () => {
  test("lists in-progress titles from localStorage", () => {
    window.localStorage.setItem(
      "andshow:watch-progress:movie:550:feature:main",
      JSON.stringify({
        event: "timeupdate",
        currentTime: 1200,
        duration: 7200,
        progress: 40,
        id: "550",
        mediaType: "movie",
      }),
    );

    const entries = listContinueWatchingFromStorage();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.id).toBe(550);
    expect(entries[0]?.progress).toBeCloseTo(0.4);
  });

  test("marks a started title as continue watching", () => {
    markWatchStarted({ id: 27205, mediaType: "movie" });
    const entries = listContinueWatchingFromStorage();
    expect(entries.some((entry) => entry.id === 27205)).toBe(true);
  });

  test("skips nearly finished titles", () => {
    window.localStorage.setItem(
      "andshow:watch-progress:movie:551:feature:main",
      JSON.stringify({
        event: "timeupdate",
        progress: 98,
        id: "551",
        mediaType: "movie",
      }),
    );
    expect(listContinueWatchingFromStorage()).toHaveLength(0);
  });
});
