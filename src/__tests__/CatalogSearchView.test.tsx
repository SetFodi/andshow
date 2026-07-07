import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { CatalogSearchView } from "@/components/CatalogSearchView";
import { MOCK_TITLES } from "@/data/mockMovies";

function renderSearch() {
  render(<CatalogSearchView titles={MOCK_TITLES} />);
}

describe("CatalogSearchView", () => {
  test("shows curated suggestions before searching", () => {
    // Arrange & Act
    renderSearch();

    // Assert — a high-rated title surfaces without typing.
    expect(screen.getByText("Suggestions")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "The Godfather — details" }),
    ).toBeInTheDocument();
  });

  test("searches titles by name", async () => {
    // Arrange
    const user = userEvent.setup();
    renderSearch();

    // Act
    await user.type(screen.getByLabelText("Search titles"), "Interstellar");

    // Assert
    expect(screen.getByRole("button", { name: "Interstellar — details" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Inception — details" })).not.toBeInTheDocument();
  });

  test("filters results by media type", async () => {
    // Arrange
    const user = userEvent.setup();
    renderSearch();

    // Act — "the" matches both films and series; the TV tab drops the films.
    await user.type(screen.getByLabelText("Search titles"), "the");
    await user.click(screen.getByRole("button", { name: "TV" }));

    // Assert
    expect(
      screen.queryByRole("button", { name: "The Dark Knight — details" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "The Bear — details" })).toBeInTheDocument();
  });

  test("opens the detail drawer from a search result", async () => {
    // Arrange
    const user = userEvent.setup();
    renderSearch();

    // Act
    await user.type(screen.getByLabelText("Search titles"), "Interstellar");
    await user.click(screen.getByRole("button", { name: "Interstellar — details" }));

    // Assert
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Interstellar");
  });
});
