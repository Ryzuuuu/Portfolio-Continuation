import PropTypes from "prop-types";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const RESET_MS = 1800;

/** Copies the address to the clipboard and says so, visually and to screen readers. */
export function CopyEmail({ email }) {
  const [state, setState] = useState("idle"); // idle | copied | failed
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), RESET_MS);
  }

  const labels = { idle: "COPY", copied: "COPIED", failed: "COPY FAILED" };
  const announcements = {
    idle: "",
    copied: "Email address copied",
    failed: "Couldn't copy the email address",
  };

  return (
    <>
      <button
        className={`copy-email mono${state === "copied" ? " is-copied" : ""}`}
        type="button"
        aria-label="Copy email address"
        onClick={handleClick}
      >
        {state === "copied" ? (
          <Check size={13} aria-hidden="true" />
        ) : (
          <Copy size={13} aria-hidden="true" />
        )}
        <span aria-hidden="true">{labels[state]}</span>
      </button>
      <span className="visually-hidden" aria-live="polite">
        {announcements[state]}
      </span>
    </>
  );
}

CopyEmail.propTypes = {
  email: PropTypes.string.isRequired,
};
