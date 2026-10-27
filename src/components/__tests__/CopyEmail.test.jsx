import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyEmail } from "../CopyEmail.jsx";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CopyEmail", () => {
  it("copies the address and confirms it", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<CopyEmail email="ada@example.com" />);

    await user.click(screen.getByRole("button", { name: /copy email address/i }));

    expect(writeText).toHaveBeenCalledWith("ada@example.com");
    expect(screen.getByRole("button")).toHaveTextContent("COPIED");
    expect(screen.getByText("Email address copied")).toBeInTheDocument();
  });

  it("says so when the clipboard is blocked", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    render(<CopyEmail email="ada@example.com" />);

    await user.click(screen.getByRole("button", { name: /copy email address/i }));

    expect(screen.getByRole("button")).toHaveTextContent("COPY FAILED");
    expect(screen.getByText("Couldn't copy the email address")).toBeInTheDocument();
  });
});
