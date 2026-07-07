import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { CatalogGridView } from "@/components/CatalogGridView";
import { MOCK_TITLES } from "@/data/mockMovies";

const sampleTitles = [
  MOCK_TITLES.find((title) => title.name === "Inception")!,
  MOCK_TITLES.find((title) => title.name === "Interstellar")!,
  MOCK_TITLES.find((title) => title.name === "Oppenheimer")!,
];

function renderCatalog() {
  render(
    <CatalogGridView
      eyebrow="Feature archive"
      heading="Movies"
      description="A test catalog."
      titles={sampleTitles}
    />,
  );
}

describe("CatalogGridView", () => {
  test("renders page framing and catalog cards", () => {
    // Arrange & Act
    renderCatalog();

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Movies" })).toBeInTheDocument();
    for (const title of sampleTitles) {
      expect(screen.getByRole("button", { name: `${title.name} — details` })).toBeInTheDocument();
    }
  });

  test("filters visible cards by genre", async () => {
    // Arrange
    const user = userEvent.setup();
    renderCatalog();

    // Act
    await user.click(screen.getByRole("button", { name: "Science Fiction" }));

    // Assert
    expect(screen.getByRole("button", { name: "Inception — details" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Oppenheimer — details" })).not.toBeInTheDocument();
  });

  test("opens the shared detail drawer from a grid card", async () => {
    // Arrange
    const user = userEvent.setup();
    renderCatalog();

    // Act
    await user.click(screen.getByRole("button", { name: "Interstellar — details" }));

    // Assert
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Interstellar");
  });
});
