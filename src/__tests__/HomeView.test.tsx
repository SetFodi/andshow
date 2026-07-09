import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { HomeView } from "@/components/HomeView";
import { getFeaturedTitles, getHomeRails } from "@/lib/catalog";

async function renderHome() {
  const [featured, rails] = await Promise.all([getFeaturedTitles(), getHomeRails()]);
  render(<HomeView featured={featured} rails={rails} />);
  return { featured, rails };
}

describe("HomeView", () => {
  test("renders the hero with the first featured title and all rails", async () => {
    // Arrange & Act
    const { featured, rails } = await renderHome();

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: featured[0].name })).toBeInTheDocument();
    for (const rail of rails) {
      // Continue Watching is client-owned and hidden until real progress exists.
      if (rail.id === "continue-watching") continue;
      expect(screen.getByRole("heading", { name: rail.heading })).toBeInTheDocument();
    }
  });

  test("opens the detail drawer when a poster card is selected", async () => {
    // Arrange
    const user = userEvent.setup();
    await renderHome();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Act
    const [firstCard] = screen.getAllByRole("button", { name: /— details$/ });
    await user.click(firstCard);

    // Assert
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("opens the drawer for the featured title via More Info", async () => {
    // Arrange
    const user = userEvent.setup();
    const { featured } = await renderHome();

    // Act
    await user.click(screen.getByRole("button", { name: /more info/i }));

    // Assert
    expect(screen.getByRole("dialog")).toHaveAccessibleName(featured[0].name);
  });

  test("links the featured CTA to the watch route", async () => {
    // Arrange & Act
    const { featured } = await renderHome();

    // Assert
    expect(screen.getByRole("link", { name: /start watching/i })).toHaveAttribute(
      "href",
      `/watch/movie/${featured[0].id}`,
    );
  });

  test("shows an empty state when no featured titles exist", async () => {
    // Arrange & Act
    render(<HomeView featured={[]} rails={[]} />);

    // Assert
    expect(screen.getByText(/projection room is empty/i)).toBeInTheDocument();
  });
});
