import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import { MOCK_TITLES } from "@/data/mockMovies";
import { getWatchPath } from "@/lib/watch-path";

const sampleTitle = MOCK_TITLES[1];

describe("MovieDetailModal", () => {
  test("renders name, overview, genres, cast, and Watch Now", () => {
    // Arrange & Act
    render(<MovieDetailModal title={sampleTitle} onClose={vi.fn()} />);

    // Assert
    expect(screen.getByRole("dialog")).toHaveAccessibleName(sampleTitle.name);
    expect(screen.getByText(sampleTitle.overview)).toBeInTheDocument();
    for (const genre of sampleTitle.genres) {
      expect(screen.getByText(genre)).toBeInTheDocument();
    }
    for (const castMember of sampleTitle.cast) {
      expect(screen.getByText(castMember)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: /watch now/i })).toHaveAttribute(
      "href",
      getWatchPath(sampleTitle),
    );
  });

  test("calls onClose when the close button is clicked", async () => {
    // Arrange
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<MovieDetailModal title={sampleTitle} onClose={onClose} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Close details" }));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when Escape is pressed", () => {
    // Arrange
    const onClose = vi.fn();
    render(<MovieDetailModal title={sampleTitle} onClose={onClose} />);

    // Act
    fireEvent.keyDown(window, { key: "Escape" });

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("locks body scroll while open and restores it on unmount", () => {
    // Arrange
    const { unmount } = render(<MovieDetailModal title={sampleTitle} onClose={vi.fn()} />);

    // Assert (open)
    expect(document.body.style.overflow).toBe("hidden");

    // Act
    unmount();

    // Assert (closed)
    expect(document.body.style.overflow).toBe("");
  });
});
