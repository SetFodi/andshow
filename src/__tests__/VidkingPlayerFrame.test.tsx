import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { VidkingPlayerFrame } from "@/components/VidkingPlayerFrame";

const playerUrl = "https://www.vidking.net/embed/movie/157336?color=dd6a71";
const cinebyUrl = "https://www.cineby.at/movie/157336?play=true";
const customUrl = "https://watch.example.test/embed/157336";
const sources = [
  {
    id: "vidking",
    label: "Vidking",
    detail: "Embed",
    kind: "iframe" as const,
    url: playerUrl,
    progressOrigin: "https://www.vidking.net",
  },
  {
    id: "cineby",
    label: "Cineby",
    detail: "External",
    kind: "external" as const,
    url: cinebyUrl,
  },
];
const customSource = {
  id: "custom",
  label: "House",
  detail: "Configured iframe",
  kind: "iframe" as const,
  url: customUrl,
};
const sourcesWithCustom = [sources[0], customSource, sources[1]];
const storageKey = "andshow:watch-progress:movie:157336:feature:main";
const sourceStorageKey = "andshow:watch-source:movie:157336:feature:main";
let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useRealTimers();
  const store = new Map<string, string>();
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    },
  });
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("VidkingPlayerFrame", () => {
  test("renders the iframe and diagnostic controls", () => {
    render(
      <VidkingPlayerFrame
        title="Interstellar"
        sources={sources}
        id={157336}
        mediaType="movie"
      />,
    );

    expect(screen.getByTitle("Interstellar Vidking player")).toHaveAttribute("src", playerUrl);
    expect(screen.getByRole("button", { name: /vidking embed/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText(/player diagnostics/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open/i })).toHaveAttribute("href", playerUrl);
    expect(screen.getAllByRole("link", { name: /cineby/i })[0]).toHaveAttribute(
      "href",
      cinebyUrl,
    );
  });

  test("records load and player events", async () => {
    render(
      <VidkingPlayerFrame
        title="Interstellar"
        sources={sources}
        id={157336}
        mediaType="movie"
      />,
    );

    fireEvent.load(screen.getByTitle("Interstellar Vidking player"));
    expect(screen.getByText(/iframe loaded/i)).toBeInTheDocument();

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://www.vidking.net",
        data: JSON.stringify({
          type: "PLAYER_EVENT",
          data: {
            event: "play",
            currentTime: 12,
            duration: 100,
            progress: 12,
            id: "157336",
            mediaType: "movie",
          },
        }),
      }),
    );

    await waitFor(() => expect(screen.getByText(/player event: play/i)).toBeInTheDocument());
    expect(window.localStorage.getItem(storageKey)).toContain('"event":"play"');
  });

  test("promotes Cineby when Vidking reports zero-time playback", async () => {
    render(
      <VidkingPlayerFrame
        title="Interstellar"
        sources={sources}
        id={157336}
        mediaType="movie"
      />,
    );

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://www.vidking.net",
        data: JSON.stringify({
          type: "PLAYER_EVENT",
          data: {
            event: "pause",
            currentTime: 0,
            duration: 0,
            progress: 0,
            id: "157336",
            mediaType: "movie",
          },
        }),
      }),
    );

    await waitFor(() => expect(screen.getByText(/vidking stalled at 0:00/i)).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /open cineby fallback/i })).toHaveAttribute(
      "href",
      cinebyUrl,
    );
  });

  test("automatically retries zero-time playback", () => {
    vi.useFakeTimers();
    render(
      <VidkingPlayerFrame
        title="Interstellar"
        sources={sources}
        id={157336}
        mediaType="movie"
      />,
    );

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://www.vidking.net",
          data: JSON.stringify({
            type: "PLAYER_EVENT",
            data: {
              event: "play",
              currentTime: 0,
              duration: 0,
              progress: 0,
              id: "157336",
              mediaType: "movie",
            },
          }),
        }),
      );
    });

    expect(screen.getByText(/retrying 1\/3/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1\/3 scheduled/i).length).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(1250);
    });

    expect(screen.getAllByText(/iframe auto retry 1\/3/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/1\/3 loaded/i)).toBeInTheDocument();
  });

  test("copies the Vidking source URL", async () => {
    const user = userEvent.setup();
    render(
      <VidkingPlayerFrame
        title="Interstellar"
        sources={sources}
        id={157336}
        mediaType="movie"
      />,
    );

    await user.click(screen.getByRole("button", { name: /copy/i }));

    await waitFor(() => expect(screen.getByText(/source URL copied/i)).toBeInTheDocument());
  });

  test("switches to a configured iframe source", async () => {
    const user = userEvent.setup();
    render(
      <VidkingPlayerFrame
        title="Interstellar"
        sources={sourcesWithCustom}
        id={157336}
        mediaType="movie"
      />,
    );

    await user.click(screen.getByRole("button", { name: /house configured iframe/i }));

    expect(screen.getByTitle("Interstellar House player")).toHaveAttribute("src", customUrl);
    expect(screen.getByText(/does not publish player events/i)).toBeInTheDocument();
    expect(window.localStorage.getItem(sourceStorageKey)).toBe("custom");
  });

  test("restores the remembered iframe source", async () => {
    window.localStorage.setItem(sourceStorageKey, "custom");

    render(
      <VidkingPlayerFrame
        title="Interstellar"
        sources={sourcesWithCustom}
        id={157336}
        mediaType="movie"
      />,
    );

    await waitFor(() =>
      expect(screen.getByTitle("Interstellar House player")).toHaveAttribute("src", customUrl),
    );
    expect(screen.getAllByText(/house restored/i).length).toBeGreaterThan(0);
  });

  test("switches to the next iframe source after retry exhaustion", () => {
    vi.useFakeTimers();
    render(
      <VidkingPlayerFrame
        title="Interstellar"
        sources={sourcesWithCustom}
        id={157336}
        mediaType="movie"
      />,
    );

    for (let retry = 1; retry <= 3; retry += 1) {
      act(() => {
        window.dispatchEvent(
          new MessageEvent("message", {
            origin: "https://www.vidking.net",
            data: JSON.stringify({
              type: "PLAYER_EVENT",
              data: {
                event: "play",
                currentTime: 0,
                duration: 0,
                progress: 0,
                id: "157336",
                mediaType: "movie",
              },
            }),
          }),
        );
      });

      expect(screen.getByText(new RegExp(`retrying ${retry}/3`, "i"))).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1250);
      });
    }

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://www.vidking.net",
          data: JSON.stringify({
            type: "PLAYER_EVENT",
            data: {
              event: "play",
              currentTime: 0,
              duration: 0,
              progress: 0,
              id: "157336",
              mediaType: "movie",
            },
          }),
        }),
      );
    });

    expect(screen.getByTitle("Interstellar House player")).toHaveAttribute("src", customUrl);
    expect(screen.getAllByText(/vidking exhausted; switched to house/i).length).toBeGreaterThan(0);
    expect(window.localStorage.getItem(sourceStorageKey)).toBe("custom");
  });
});
