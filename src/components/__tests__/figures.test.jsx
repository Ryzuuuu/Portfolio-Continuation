import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BridgeFigure } from "../figures/BridgeFigure.jsx";
import { StoreFigure } from "../figures/StoreFigure.jsx";

describe("BridgeFigure", () => {
  it("starts from the default bridge and describes it", () => {
    render(<BridgeFigure />);

    expect(screen.getByRole("img")).toHaveAccessibleName(/4 girders at 2\.60 m spacing/);
    expect(screen.getByText("Deck width").nextSibling).toHaveTextContent("9.60 m");
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
  });

  it("re-derives the deck and pier-cap widths when the girder layout changes", () => {
    render(<BridgeFigure />);

    fireEvent.change(screen.getByLabelText("Girders"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Girder spacing"), { target: { value: "3000" } });

    // (5 − 1) × 3.00 + 2 × 0.90
    expect(screen.getByText("Deck width").nextSibling).toHaveTextContent("13.80 m");
    expect(screen.getByText("Pier-cap width").nextSibling).toHaveTextContent("13.34 m");
    expect(screen.getByRole("img")).toHaveAccessibleName(/5 girders at 3\.00 m spacing/);
    expect(screen.getByLabelText("Girder spacing")).toHaveAttribute("aria-valuetext", "3.00 m");
  });

  it("draws one I-section per girder", () => {
    const { container } = render(<BridgeFigure />);
    const girders = () => container.querySelectorAll(".bridge__bearing").length;

    expect(girders()).toBe(4);
    fireEvent.change(screen.getByLabelText("Girders"), { target: { value: "3" } });
    expect(girders()).toBe(3);
    expect(container.querySelectorAll(".bridge__frame")).toHaveLength(2);
  });

  it("resets to the default bridge", async () => {
    const user = userEvent.setup();
    render(<BridgeFigure />);

    fireEvent.change(screen.getByLabelText("Pier height"), { target: { value: "3000" } });
    const reset = screen.getByRole("button", { name: "Reset" });
    expect(reset).toBeEnabled();

    await user.click(reset);
    expect(screen.getByLabelText("Pier height")).toHaveValue("4250");
    expect(reset).toBeDisabled();
  });
});

describe("StoreFigure", () => {
  it("opens on a store that is already busy, and stays still off screen", () => {
    // jsdom has no IntersectionObserver, so the figure never counts as in view.
    const { container } = render(<StoreFigure />);
    const stages = screen.getAllByRole("listitem");

    expect(stages.map((stage) => stage.firstChild.textContent)).toEqual([
      "Entry",
      "Zone visit",
      "Billing queue",
      "Purchase",
    ]);
    expect(within(stages[0]).getByText("100%")).toBeInTheDocument();
    expect(Number(stages[0].children[1].textContent)).toBeGreaterThan(10);
    expect(container.querySelectorAll(".store__zone")).toHaveLength(5);
    expect(container.querySelectorAll(".store__visitor").length).toBeGreaterThan(0);
  });

  it("empties the store on reset", async () => {
    const user = userEvent.setup();
    const { container } = render(<StoreFigure />);

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(container.querySelectorAll(".store__visitor")).toHaveLength(0);
    screen
      .getAllByRole("listitem")
      .forEach((stage) => expect(stage.children[1]).toHaveTextContent("0"));
    expect(screen.getByText("Conversion").nextSibling).toHaveTextContent("—");
  });

  it("toggles between play and pause", async () => {
    const user = userEvent.setup();
    render(<StoreFigure />);

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });
});
