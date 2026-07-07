import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Header } from "@/components/Header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Header", () => {
  test("renders the wordmark and primary navigation", () => {
    // Arrange & Act
    render(<Header />);

    // Assert
    expect(screen.getByRole("link", { name: "Andshow home" })).toHaveAttribute("href", "/");
    const primaryNav = screen.getByRole("navigation", { name: "Primary" });
    for (const [label, href] of [
      ["Home", "/"],
      ["Movies", "/movies"],
      ["TV Shows", "/tv"],
      ["Browse", "/browse"],
    ] as const) {
      const link = screen.getByRole("link", { name: label });
      expect(primaryNav).toContainElement(link);
      expect(link).toHaveAttribute("href", href);
    }
    expect(screen.getByRole("link", { name: "Search" })).toHaveAttribute("href", "/search");
  });

  test("marks the current route with aria-current", () => {
    render(<Header />);
    expect(screen.getByRole("navigation", { name: "Primary" })).toContainElement(
      screen.getByRole("link", { name: "Home", current: "page" }),
    );
  });

  test("toggles the mobile menu", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Header />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(screen.queryByRole("navigation", { name: "Mobile" })).not.toBeInTheDocument();

    // Act
    await user.click(toggle);

    // Assert
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
