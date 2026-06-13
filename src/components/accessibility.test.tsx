import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function SkipToMainLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
    >
      Skip to main content
    </a>
  );
}

describe("accessibility primitives", () => {
  it("renders a skip link targeting main content", () => {
    render(<SkipToMainLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("associates journal textarea labels with controls", () => {
    render(
      <form aria-label="Journal entry">
        <label htmlFor="journal-content">Today, in your own words</label>
        <textarea id="journal-content" name="content" />
        <button type="submit">Save & analyze</button>
      </form>,
    );
    expect(
      screen.getByLabelText("Today, in your own words"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save & analyze" }),
    ).toHaveAttribute("type", "submit");
  });
});
