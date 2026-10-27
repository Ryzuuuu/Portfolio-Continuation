import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY } from "../../hooks/useTheme.js";
import { ThemeToggle } from "../ThemeToggle.jsx";

const root = document.documentElement;
const themeColor = () => document.querySelector('meta[name="theme-color"]').getAttribute("content");

/** A controllable stand-in for the OS colour-scheme preference. */
function mockSystemTheme(initiallyDark) {
  const listeners = new Set();
  const query = {
    matches: initiallyDark,
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
  };
  vi.stubGlobal("matchMedia", (text) =>
    text.includes("prefers-color-scheme") ? query : { matches: false }
  );
  return (dark) => {
    query.matches = dark;
    listeners.forEach((listener) => listener({ matches: dark }));
  };
}

beforeEach(() => {
  root.dataset.theme = "light";
  localStorage.clear();
  document.head.insertAdjacentHTML("beforeend", '<meta name="theme-color" content="#f2eee5">');
});
afterEach(() => {
  document.querySelector('meta[name="theme-color"]').remove();
  vi.unstubAllGlobals();
});

describe("ThemeToggle", () => {
  it("switches to dark, remembers the choice and recolours the browser chrome", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggle = screen.getByRole("button", { name: "Dark mode" });

    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(root.dataset.theme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(themeColor()).toBe("#131210");

    await user.click(toggle);
    expect(root.dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(themeColor()).toBe("#f2eee5");
  });

  it("starts pressed when the page loaded in dark mode", () => {
    root.dataset.theme = "dark";
    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("follows the system theme until the visitor picks one", async () => {
    const setSystemDark = mockSystemTheme(false);
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggle = screen.getByRole("button", { name: "Dark mode" });

    act(() => setSystemDark(true));
    expect(root.dataset.theme).toBe("dark");
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle); // an explicit choice: light
    act(() => setSystemDark(true));
    expect(root.dataset.theme).toBe("light");
  });

  it("still switches when storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Dark mode" }));
    expect(root.dataset.theme).toBe("dark");
    vi.restoreAllMocks();
  });
});
