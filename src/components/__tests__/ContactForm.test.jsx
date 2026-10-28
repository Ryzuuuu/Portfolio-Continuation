import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "../ContactForm.jsx";

const jsonResponse = (status, body) =>
  Promise.resolve(
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
  );

let fetchMock;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("VITE_WEB3FORMS_ACCESS_KEY", "test-public-key");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function fillValidForm(user) {
  await user.type(screen.getByLabelText("YOUR NAME"), "Ada Lovelace");
  await user.type(screen.getByLabelText("YOUR EMAIL"), "ada@example.com");
  await user.type(screen.getByLabelText("WHAT'S ON YOUR MIND?"), "Let's build something.");
}

const submitButton = () => screen.getByRole("button", { name: /SEND THE MESSAGE|SENDING/ });

describe("ContactForm", () => {
  it("shows field errors, marks fields invalid and focuses the first one", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("YOUR EMAIL"), "not-an-email");
    await user.click(submitButton());

    const name = screen.getByLabelText("YOUR NAME");
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Please tell me your name.");
    expect(screen.getByLabelText("YOUR EMAIL")).toHaveAccessibleDescription(
      "That email address doesn't look right."
    );
    expect(screen.getByLabelText("WHAT'S ON YOUR MIND?")).toHaveAccessibleDescription(
      "Please write a message."
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clears a field's error as soon as it's fixed", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(submitButton());
    await user.type(screen.getByLabelText("YOUR NAME"), "Ada");

    expect(screen.getByLabelText("YOUR NAME")).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText("Please tell me your name.")).not.toBeInTheDocument();
  });

  it("shows a sending state, then the success message, and resets the form", async () => {
    let respondApi;
    fetchMock
      .mockReturnValueOnce(new Promise((resolve) => (respondApi = resolve)))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          message: "Email sent successfully.",
        })
      );
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(submitButton());

    expect(submitButton()).toHaveTextContent("SENDING...");
    expect(submitButton()).toHaveAttribute("aria-disabled", "true");
    await user.click(submitButton());
    expect(fetchMock).toHaveBeenCalledTimes(1);

    respondApi(await jsonResponse(200, { message: "Contact validated.", stored: false }));

    expect(await screen.findByRole("status")).toHaveTextContent("Message sent.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(document.querySelector(".form-stamp")).toHaveAttribute("aria-hidden", "true");
    expect(submitButton()).toHaveTextContent("SEND THE MESSAGE");
    expect(screen.getByLabelText("YOUR NAME")).toHaveValue("");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(init.body)).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Let's build something.",
      website: "",
    });
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.web3forms.com/submit");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      access_key: "test-public-key",
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Let's build something.",
      replyto: "ada@example.com",
    });
  });

  it("shows the server's error and keeps what the visitor typed", async () => {
    fetchMock.mockReturnValue(
      jsonResponse(502, { error: "Your message couldn't be delivered right now." })
    );
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(submitButton());

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Your message couldn't be delivered right now."
    );
    expect(screen.getByRole("status")).toHaveClass("form-feedback--error");
    expect(screen.getByLabelText("YOUR NAME")).toHaveValue("Ada Lovelace");
  });

  it("shows provider errors and keeps what the visitor typed", async () => {
    fetchMock
      .mockReturnValueOnce(jsonResponse(200, { message: "Contact validated." }))
      .mockReturnValueOnce(
        jsonResponse(403, { success: false, message: "This method is not allowed." })
      );
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(submitButton());

    expect(await screen.findByRole("status")).toHaveTextContent("This method is not allowed.");
    expect(screen.getByLabelText("YOUR NAME")).toHaveValue("Ada Lovelace");
  });

  it("maps server-side field errors onto the fields", async () => {
    fetchMock.mockReturnValue(
      jsonResponse(400, {
        error: "Please provide a valid name, email, and message.",
        fields: { email: "That email address doesn't look right." },
      })
    );
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(submitButton());

    expect(await screen.findByLabelText("YOUR EMAIL")).toHaveAttribute("aria-invalid", "true");
  });

  it("explains rate limiting and network failures", async () => {
    fetchMock.mockReturnValueOnce(
      jsonResponse(429, { error: "Too many messages from your connection." })
    );
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(submitButton());
    expect(await screen.findByText("Too many messages from your connection.")).toBeInTheDocument();

    await user.click(submitButton());
    expect(await screen.findByText(/Couldn't reach the server/)).toBeInTheDocument();
  });

  it("keeps the honeypot out of the tab order and away from assistive tech", () => {
    render(<ContactForm />);
    const honeypot = document.querySelector('input[name="website"]');

    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot.closest("[aria-hidden='true']")).not.toBeNull();
  });
});
