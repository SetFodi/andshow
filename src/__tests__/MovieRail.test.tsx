import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { MovieRail } from "@/components/MovieRail";
import { getHomeRails } from "@/lib/catalog";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MovieRail", () => {
  test("renders heading, title count, and one card per item", async () => {
    // Arrange
    const [posterRail] = await getHomeRails();

    // Act
    render(<MovieRail rail={posterRail} onSelect={vi.fn()} />);

    // Assert
    expect(screen.getByRole("heading", { name: posterRail.heading })).toBeInTheDocument();
    expect(screen.getByText(`${posterRail.items.length} titles`)).toBeInTheDocument();
    const cards = screen.getAllByRole("button", { name: /— details$/ });
    expect(cards).toHaveLength(posterRail.items.length);
  });

  test("renders resume cards with remaining labels for the wide rail", async () => {
    // Arrange
    const rails = await getHomeRails();
    const wideRail = rails.find((rail) => rail.layout === "wide")!;

    // Act
    render(<MovieRail rail={wideRail} onSelect={vi.fn()} />);

    // Assert
    const resumeLinks = screen.getAllByRole("link", { name: /^Resume / });
    expect(resumeLinks).toHaveLength(wideRail.items.length);
    expect(screen.getByText(wideRail.items[0].remainingLabel!)).toBeInTheDocument();
  });

  test("scrolls the shelf when a chevron is clicked", async () => {
    // Arrange
    const [posterRail] = await getHomeRails();
    const scrollBySpy = vi
      .spyOn(Element.prototype, "scrollBy")
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<MovieRail rail={posterRail} onSelect={vi.fn()} />);

    // Act
    await user.click(
      screen.getByRole("button", { name: `Scroll ${posterRail.heading} forward` }),
    );

    // Assert
    expect(scrollBySpy).toHaveBeenCalledTimes(1);
  });
});
