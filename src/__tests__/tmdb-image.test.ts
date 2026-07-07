import { describe, expect, test } from "vitest";
import { backdropUrl, posterUrl } from "@/lib/tmdb-image";

describe("tmdb image urls", () => {
  test("posterUrl composes base, default size, and path", () => {
    expect(posterUrl("/abc.jpg")).toBe("https://image.tmdb.org/t/p/w500/abc.jpg");
  });

  test("posterUrl honors an explicit size", () => {
    expect(posterUrl("/abc.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/abc.jpg");
  });

  test("backdropUrl composes base, default size, and path", () => {
    expect(backdropUrl("/xyz.jpg")).toBe("https://image.tmdb.org/t/p/w1280/xyz.jpg");
  });

  test("backdropUrl honors an explicit size", () => {
    expect(backdropUrl("/xyz.jpg", "original")).toBe(
      "https://image.tmdb.org/t/p/original/xyz.jpg",
    );
  });
});
