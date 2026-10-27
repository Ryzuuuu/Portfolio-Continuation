import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { sections } from "../../data/nav.js";
import { profile } from "../../data/profile.js";
import { Header } from "../Header.jsx";

function renderHeader() {
  render(<Header profile={profile} sections={sections} />);
  return {
    toggle: screen.getByRole("button", { name: "Navigation menu" }),
    nav: screen.getByRole("navigation", { name: "Main navigation" }),
  };
}

describe("Header mobile navigation", () => {
  it("opens and closes from the menu button", async () => {
    const user = userEvent.setup();
    const { toggle, nav } = renderHeader();

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", nav.id);
    expect(nav).not.toHaveClass("is-open");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(nav).toHaveClass("is-open");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(nav).not.toHaveClass("is-open");
  });

  it("closes when a link is chosen", async () => {
    const user = userEvent.setup();
    const { toggle, nav } = renderHeader();

    await user.click(toggle);
    await user.click(screen.getByRole("link", { name: "TOOLBOX" }));

    expect(nav).not.toHaveClass("is-open");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape and returns focus to the menu button", async () => {
    const user = userEvent.setup();
    const { toggle, nav } = renderHeader();

    await user.click(toggle);
    await user.tab();
    await user.keyboard("{Escape}");

    expect(nav).not.toHaveClass("is-open");
    expect(toggle).toHaveFocus();
  });

  it("lists every section, Toolbox included", () => {
    const { nav } = renderHeader();
    const labels = sections.map((section) => section.navLabel);

    expect(labels).toContain("TOOLBOX");
    labels.forEach((label) => expect(screen.getByRole("link", { name: label })).toBeVisible());
    expect(nav.querySelectorAll("a")).toHaveLength(sections.length + 1);
  });
});
