import { escapeHtml } from "../utils/escapeHtml.js";

/**
 * The confirmation sent to the visitor. It deliberately does not echo their message:
 * anyone can type any address into the form, and echoing content would let the form
 * relay arbitrary text through the owner's Gmail account.
 */
export function autoReplyEmail({ name, ownerName }) {
  const safeName = escapeHtml(name);
  const safeOwnerName = escapeHtml(ownerName);
  const signOff = ownerName.split(" ")[0];
  const safeSignOff = escapeHtml(signOff);

  const text = [
    `Hi ${name},`,
    "",
    "Thanks for reaching out through my portfolio. Your message reached me, and I'll reply personally as soon as I can.",
    "",
    `- ${signOff}`,
    "",
    "--",
    `This is an automatic confirmation from ${ownerName}'s portfolio contact form.`,
    "If you didn't send a message, you can safely ignore this email.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Thanks for your message</title>
  </head>
  <body style="margin:0;padding:24px 12px;background:#f2eee5;color:#171715;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #171715;">
      <tr>
        <td style="padding:14px 22px;background:#171715;color:#f2eee5;font:12px/1.4 Menlo,Consolas,monospace;letter-spacing:.06em;">
          MESSAGE RECEIVED <span style="color:#e95438;">&#10035;</span>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 22px;font-size:15px;line-height:1.65;">
          <p style="margin:0 0 14px;">Hi ${safeName},</p>
          <p style="margin:0 0 14px;">Thanks for reaching out through my portfolio. Your message reached me, and I'll reply personally as soon as I can.</p>
          <p style="margin:0;">&mdash; ${safeSignOff}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 22px;border-top:1px solid #d9d3c7;color:#5c5953;font:12px/1.5 Menlo,Consolas,monospace;">
          Automatic confirmation from ${safeOwnerName}&rsquo;s portfolio contact form. If you didn&rsquo;t send a message, you can safely ignore this email.
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: `Thanks for your message - ${ownerName}`, text, html };
}
