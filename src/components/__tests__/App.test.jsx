import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../App.jsx";
import { sections } from "../../data/nav.js";
import { profile } from "../../data/profile.js";

describe("App", () => {
  it("renders the hero with a single h1", () => {
    render(<App />);

    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/I BUILD\s*SYSTEMS\s*THAT SEE\./);
    expect(screen.getByRole("img", { name: /manga-inspired portrait/i })).toBeInTheDocument();
  });

  it("never skips a heading level", () => {
    const { container } = render(<App />);
    const levels = [...container.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((heading) =>
      Number(heading.tagName[1])
    );

    levels.forEach((level, index) => {
      if (index > 0) expect(level - levels[index - 1]).toBeLessThanOrEqual(1);
    });
  });

  it("numbers every section the same way in the nav and in its kicker", () => {
    const { container } = render(<App />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });

    sections.forEach((section) => {
      const link = within(nav).getByRole("link", { name: section.navLabel });
      expect(link).toHaveAttribute("href", `#${section.id}`);
      expect(link).toHaveTextContent(section.number);

      const kicker = container.querySelector(`#${section.id} .section-kicker`);
      expect(kicker).toHaveTextContent(`${section.number} — ${section.kicker}`);
    });
  });

  it("offers a skip link to the main content", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute(
      "href",
      "#main"
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
  });

  it("shows reveal content even without IntersectionObserver", () => {
    // jsdom has no IntersectionObserver, which is exactly the fallback path.
    const { container } = render(<App />);
    const revealed = container.querySelectorAll("[data-reveal]");

    expect(revealed.length).toBeGreaterThan(0);
    revealed.forEach((element) => expect(element).toHaveClass("is-visible"));
    expect(document.documentElement).not.toHaveClass("reveal-ready");
  });

  it("links each project card to its own repository", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: /StoreSight source code on GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/Ryzuuuu/StoreSight"
    );
    expect(screen.getByRole("link", { name: /ParaBridge source code on GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/Ryzuuuu/ParaBridge"
    );
  });

  it("gives every icon-only link an accessible name", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: /GitHub profile/ })).toHaveAttribute(
      "href",
      profile.social.github
    );
    expect(screen.getByRole("link", { name: /LinkedIn profile/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: `Email ${profile.email}` })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore selected work" })).toBeInTheDocument();
    screen.getAllByRole("link").forEach((link) => expect(link).toHaveAccessibleName());
  });
});
