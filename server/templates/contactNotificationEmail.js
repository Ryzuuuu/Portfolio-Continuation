import { escapeHtml } from "../utils/escapeHtml.js";

/** The email sent to the site owner. All visitor input is escaped before it touches HTML. */
export function contactNotificationEmail({ name, email, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const text = [
    "New message from your portfolio contact form.",
    "",
    `Name:  ${name}`,
    `Email: ${email}`,
    "",
    message,
    "",
    `Hit Reply to answer ${name} directly.`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New portfolio message</title>
  </head>
  <body style="margin:0;padding:24px 12px;background:#f2eee5;color:#171715;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #171715;">
      <tr>
        <td style="padding:14px 22px;background:#171715;color:#f2eee5;font:12px/1.4 Menlo,Consolas,monospace;letter-spacing:.06em;">
          NEW MESSAGE <span style="color:#e95438;">&#10035;</span> PORTFOLIO CONTACT FORM
        </td>
      </tr>
      <tr>
        <td style="padding:24px 22px 8px;">
          <h1 style="margin:0 0 6px;font-size:24px;line-height:1.2;">${safeName}</h1>
          <a href="mailto:${safeEmail}" style="color:#505be7;font:14px/1.4 Menlo,Consolas,monospace;">${safeEmail}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 22px 24px;">
          <div style="padding:14px 16px;border-left:3px solid #e95438;background:#f2eee5;font-size:15px;line-height:1.6;">${safeMessage}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 22px;border-top:1px solid #d9d3c7;color:#5c5953;font:12px/1.5 Menlo,Consolas,monospace;">
          Hit Reply to answer ${safeName} &mdash; it goes straight to ${safeEmail}.
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: `New portfolio message from ${name}`, text, html };
}
