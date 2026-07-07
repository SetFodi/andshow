import { render } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { WatchProgressBridge } from "@/components/WatchProgressBridge";

const storageKey = "andshow:watch-progress:movie:299534:feature:main";

beforeEach(() => {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    },
  });
});

describe("WatchProgressBridge", () => {
  test("stores Vidking player progress events", () => {
    render(<WatchProgressBridge id={299534} mediaType="movie" />);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://www.vidking.net",
        data: JSON.stringify({
          type: "PLAYER_EVENT",
          data: {
            event: "timeupdate",
            currentTime: 120.5,
            duration: 7200,
            progress: 1.6,
            id: "299534",
            mediaType: "movie",
            timestamp: 1640995200000,
          },
        }),
      }),
    );

    expect(JSON.parse(window.localStorage.getItem(storageKey) ?? "{}")).toMatchObject({
      event: "timeupdate",
      progress: 1.6,
      id: "299534",
    });
  });

  test("ignores messages from other origins", () => {
    render(<WatchProgressBridge id={299534} mediaType="movie" />);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://example.com",
        data: JSON.stringify({
          type: "PLAYER_EVENT",
          data: { event: "play", id: "299534", mediaType: "movie" },
        }),
      }),
    );

    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });
});
