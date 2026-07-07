import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { MovieCard } from "@/components/MovieCard";
import { MOCK_TITLES } from "@/data/mockMovies";

const sampleTitle = MOCK_TITLES[0];

describe("MovieCard", () => {
  test("renders poster, name, rating, and year", () => {
    // Arrange & Act
    render(<MovieCard title={sampleTitle} onSelect={vi.fn()} />);

    // Assert
    expect(screen.getByAltText(`${sampleTitle.name} poster`)).toBeInTheDocument();
    expect(screen.getByText(sampleTitle.name)).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        const text = element?.textContent ?? "";
        return (
          element?.tagName.toLowerCase() === "p" &&
          text.includes(sampleTitle.rating.toFixed(1)) &&
          text.includes(sampleTitle.yearLabel) &&
          text.includes("Film")
        );
      }),
    ).toBeInTheDocument();
  });

  test("calls onSelect with its title when clicked", async () => {
    // Arrange
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<MovieCard title={sampleTitle} onSelect={onSelect} />);

    // Act
    await user.click(screen.getByRole("button", { name: `${sampleTitle.name} — details` }));

    // Assert
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(sampleTitle);
  });

  test("announces that it opens a dialog", () => {
    render(<MovieCard title={sampleTitle} onSelect={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-haspopup", "dialog");
  });
});
