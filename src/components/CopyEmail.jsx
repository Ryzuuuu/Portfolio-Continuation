import PropTypes from "prop-types";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SakugaButton } from "./Sakuga.jsx";

const RESET_MS = 1800;

/** Copies the address to the clipboard and says so, visually and to screen readers. */
export function CopyEmail({ email }) {
  const [state, setState] = useState("idle"); // idle | copied | failed
  const timer = useRef(0);
  const buttonRef = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
      buttonRef.current?.done();
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
      <SakugaButton
        ref={buttonRef}
        className={`copy-email mono${state === "copied" ? " is-copied" : ""}`}
        variant="secondary"
        label="Copy email address"
        onClick={handleClick}
      >
        {state === "copied" ? (
          <Check size={13} aria-hidden="true" />
        ) : (
          <Copy size={13} aria-hidden="true" />
        )}
        <span aria-hidden="true">{labels[state]}</span>
      </SakugaButton>
      <span className="visually-hidden" aria-live="polite">
        {announcements[state]}
      </span>
    </>
  );
}

CopyEmail.propTypes = {
  email: PropTypes.string.isRequired,
};
