import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { profile } from "../../data/profile.js";
import { Hero } from "../Hero.jsx";

describe("Hero", () => {
  it("gives assistive tech the real eyebrow text while the visible copy decodes", () => {
    const { container } = render(<Hero profile={profile} pageCount={6} />);

    expect(screen.getByText(profile.focus)).toHaveClass("visually-hidden");
    expect(container.querySelector(".scramble")).toHaveAttribute("aria-hidden", "true");
  });

  it("reads the headline as one sentence", () => {
    render(<Hero profile={profile} pageCount={6} />);

    expect(screen.getByRole("heading", { level: 1 }).textContent.replace(/\s+/g, " ")).toBe(
      "I BUILD SYSTEMS THAT SEE."
    );
  });

  it("shows a live clock in the profile's time zone", () => {
    const { container } = render(<Hero profile={profile} pageCount={6} />);
    const clock = container.querySelector(".hero__clock");

    expect(clock).toHaveTextContent(/CAM 01 · \d{2}:\d{2}:\d{2} IST/);
    expect(clock).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps the decorative layers out of the accessibility tree", () => {
    const { container } = render(<Hero profile={profile} pageCount={6} />);

    for (const selector of [".hero__speedlines", ".hero__sfx", ".detect", ".round-link__ring"]) {
      expect(container.querySelector(selector)).toHaveAttribute("aria-hidden", "true");
    }
    expect(screen.getByRole("link", { name: "Explore selected work" })).toHaveAttribute(
      "href",
      "#work"
    );
  });
});
