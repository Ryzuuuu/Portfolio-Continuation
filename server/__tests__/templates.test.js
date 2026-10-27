import { describe, expect, it } from "vitest";
import { autoReplyEmail } from "../templates/autoReplyEmail.js";
import { contactNotificationEmail } from "../templates/contactNotificationEmail.js";
import { escapeHtml } from "../utils/escapeHtml.js";

const hostile = {
  name: `<img src=x onerror="alert(1)">`,
  email: "ada@example.com",
  message: "<script>steal()</script>\nline two & 'quotes'",
};

describe("escapeHtml", () => {
  it("escapes every HTML-significant character", () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;"
    );
    expect(escapeHtml(undefined)).toBe("");
  });
});

describe("contactNotificationEmail", () => {
  it("escapes visitor input in the HTML body and keeps line breaks", () => {
    const { html, text, subject } = contactNotificationEmail(hostile);

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain(
      "&lt;script&gt;steal()&lt;/script&gt;<br>line two &amp; &#39;quotes&#39;"
    );
    expect(text).toContain(hostile.message);
    expect(subject).toBe(`New portfolio message from ${hostile.name}`);
  });
});

describe("autoReplyEmail", () => {
  it("escapes the name and never echoes the visitor's message", () => {
    const { html, text, subject } = autoReplyEmail({
      name: hostile.name,
      ownerName: "Neelabja Mukhopadhyay",
    });

    expect(html).not.toContain("<img");
    expect(html).toContain("Hi &lt;img");
    expect(html).not.toContain("steal()");
    expect(text).not.toContain("steal()");
    expect(subject).not.toContain(hostile.name);
  });
});
