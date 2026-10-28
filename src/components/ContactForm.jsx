import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { sendContactEmail, submitContact } from "../lib/api.js";
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  validateContact,
  validateContactField,
} from "../lib/contact.js";

const FIELD_LABELS = {
  name: "YOUR NAME",
  email: "YOUR EMAIL",
  message: "WHAT'S ON YOUR MIND?",
};

export function ContactForm() {
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [errors, setErrors] = useState({});
  const sending = status.state === "sending";

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const fieldErrors = validateContact(payload);
    setErrors(fieldErrors);

    const firstInvalid = CONTACT_FIELDS.find((field) => fieldErrors[field]);
    if (firstInvalid) {
      setStatus({ state: "idle", message: "" });
      form.elements.namedItem(firstInvalid).focus();
      return;
    }

    setStatus({ state: "sending", message: "" });
    try {
      await submitContact(payload);
      await sendContactEmail(payload);
      setStatus({ state: "success", message: "Message sent. Thanks for reaching out!" });
      form.reset();
    } catch (error) {
      setErrors(error.fields ?? {});
      setStatus({ state: "error", message: error.message });
    }
  }

  // Once a field has an error, re-check it as the visitor fixes it.
  function handleChange(event) {
    const { name, value } = event.target;
    if (!errors[name]) return;
    setErrors((current) => ({ ...current, [name]: validateContactField(name, value) }));
  }

  function fieldProps(field) {
    const errorId = `contact-${field}-error`;
    return {
      id: `contact-${field}`,
      name: field,
      maxLength: CONTACT_LIMITS[field],
      required: true,
      "aria-invalid": errors[field] ? true : undefined,
      "aria-describedby": errors[field] ? errorId : undefined,
      onChange: handleChange,
    };
  }

  function fieldError(field) {
    return (
      errors[field] && (
        <p className="field-error" id={`contact-${field}-error`}>
          {errors[field]}
        </p>
      )
    );
  }

  return (
    <form
      className="contact-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="contact-form-title"
    >
      <div className="form-title">
        <span className="mono" id="contact-form-title">
          A QUICK NOTE
        </span>
        <span aria-hidden="true">✳</span>
      </div>

      <label htmlFor="contact-name">{FIELD_LABELS.name}</label>
      <input
        {...fieldProps("name")}
        autoComplete="name"
        placeholder="The name I should know you by"
      />
      {fieldError("name")}

      <label htmlFor="contact-email">{FIELD_LABELS.email}</label>
      <input
        {...fieldProps("email")}
        type="email"
        autoComplete="email"
        placeholder="you@somewhere.com"
      />
      {fieldError("email")}

      <label htmlFor="contact-message">{FIELD_LABELS.message}</label>
      <textarea {...fieldProps("message")} placeholder="Tell me a little about it..." rows={4} />
      {fieldError("message")}

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button className="submit-button" type="submit" aria-disabled={sending || undefined}>
        {sending ? "SENDING..." : "SEND THE MESSAGE"} <ArrowUpRight size={18} aria-hidden="true" />
      </button>
      {/* Always rendered so screen readers pick up changes to this live region. */}
      <p className={`form-feedback form-feedback--${status.state}`} role="status">
        {status.message}
      </p>
      <p className="form-foot mono">NO SPAM. JUST A HUMAN REPLY.</p>
      {/* 済 ("done"): the seal stamped on a finished document. Purely decorative; the
          status line above announces the success. */}
      {status.state === "success" && (
        <span className="form-stamp" aria-hidden="true">
          <b>済</b>
          <small className="mono">SENT</small>
        </span>
      )}
    </form>
  );
}
