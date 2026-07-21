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

  test("keeps separate continue rows for different episodes of the same show", () => {
    window.localStorage.setItem(
      "andshow:watch-progress:tv:130464:1:1",
      JSON.stringify({
        event: "timeupdate",
        progress: 30,
        id: "130464",
        mediaType: "tv",
        season: 1,
        episode: 1,
      }),
    );
    window.localStorage.setItem(
      "andshow:watch-progress:tv:130464:2:3",
      JSON.stringify({
        event: "timeupdate",
        progress: 55,
        id: "130464",
        mediaType: "tv",
        season: 2,
        episode: 3,
      }),
    );

    const entries = listContinueWatchingFromStorage();
    expect(entries).toHaveLength(2);
    expect(entries.map((e) => `${e.season}-${e.episode}`).sort()).toEqual(["1-1", "2-3"]);
  });
});
