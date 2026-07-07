import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { CatalogSearchView } from "@/components/CatalogSearchView";
import { MOCK_TITLES } from "@/data/mockMovies";

const movieTitle = MOCK_TITLES.find((title) => title.mediaType === "movie")!;
const seriesTitle = MOCK_TITLES.find((title) => title.mediaType === "tv")!;

function renderSearch() {
  render(<CatalogSearchView titles={MOCK_TITLES} />);
}

describe("CatalogSearchView", () => {
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

    // Act
    await user.click(screen.getByRole("button", { name: "TV" }));

    // Assert
    expect(
      screen.queryByRole("button", { name: `${movieTitle.name} — details` }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `${seriesTitle.name} — details` }),
    ).toBeInTheDocument();
  });

  test("opens the detail drawer from a search result", async () => {
    // Arrange
    const user = userEvent.setup();
    renderSearch();

    // Act
    await user.click(screen.getByRole("button", { name: `${movieTitle.name} — details` }));

    // Assert
    expect(screen.getByRole("dialog")).toHaveAccessibleName(movieTitle.name);
  });
});
