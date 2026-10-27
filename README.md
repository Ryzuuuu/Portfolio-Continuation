# Neelabja Mukhopadhyay — Portfolio

A responsive, manga-inspired portfolio for AI/ML engineer Neelabja Mukhopadhyay, built with React, Vite, Express, and MongoDB. The front end is plain CSS plus native browser APIs: no animation or UI libraries. The contact form emails you through Gmail and, when MongoDB is configured, keeps a backup copy of every message.

## What's on the page

- **Hero**: a manga splash page seen through a camera. Headline lines rise out of slots, speed lines and a ジーッ sound effect frame the portrait, a detection box locks onto the face, and a live CCTV clock ticks in Kolkata time.
- **The first scroll**: the hero pins while the camera zooms into the character's eyes. Manga impact frames flash as it locks on, ink blooms out of both eyes, and then lifts to reveal the next section. Pausing halfway finishes the move in the direction you were scrolling.
- **Sections**: kanji chapter titles, headings that rise line by line with hand-drawn doodles, counting stats, tilting project cards, a timeline that fills as you read, and a marquee that speeds up with your scrolling.
- **Light and dark themes**: follows the system until you pick one, remembers the choice, and switches with an iris wipe.
- **Accessibility**: everything is keyboard-reachable with visible focus, colours meet WCAG AA, and with reduced motion on, every animation (the scroll zoom included) is switched off.

## Getting started

Requires Node.js 22.12 or newer.

1. Install dependencies:
   ```bash
   npm install
   ```
   On Windows, keep npm's cache and temporary files on the portfolio drive:
   ```powershell
   New-Item -ItemType Directory -Force .tmp, .npm-cache | Out-Null
   $env:TEMP = "$PWD\.tmp"; $env:TMP = $env:TEMP
   npm install --cache "$PWD\.npm-cache"
   ```
2. Copy `.env.example` to `.env` and fill in `EMAIL_APP_PASSWORD` (see [Gmail App Password](#gmail-app-password)). Everything else is optional.
3. Run `npm run dev` and open the Vite URL shown in the terminal. Vite proxies `/api` to the Express server on port `5000`.

The site renders without any configuration. The API also boots with no `.env` at all and logs a warning for each missing setting; the contact form then answers with `503` until mail or MongoDB is configured.

## Scripts

| Command           | What it does                                             |
| ----------------- | -------------------------------------------------------- |
| `npm run dev`     | Vite dev server and the API (with `--watch`) together    |
| `npm run build`   | Production build into `dist/`                            |
| `npm run preview` | Serves `dist/` locally on port 4173                      |
| `npm start`       | Runs the API only                                        |
| `npm test`        | Runs the test suite once (`npm run test:watch` to watch) |
| `npm run lint`    | ESLint (React, hooks, jsx-a11y)                          |
| `npm run format`  | Prettier (`npm run format:check` to verify only)         |

## Environment variables

All of them live in `.env` (git-ignored). `.env.example` documents each one.

| Variable                 | Default                        | Purpose                                                                                                                                          |
| ------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PORT`                   | `5000`                         | API port                                                                                                                                         |
| `CLIENT_ORIGIN`          | local Vite dev/preview origins | Comma-separated CORS allow-list. Set to your site's origin(s) in production.                                                                     |
| `TRUST_PROXY`            | off                            | Number of reverse proxies in front of the API (usually `1` on Render, Railway, Fly.io, or behind Nginx), so rate limiting sees real visitor IPs. |
| `MONGODB_URI`            | unset                          | Optional backup store for messages                                                                                                               |
| `EMAIL_USER`             | unset                          | Gmail address that sends the emails                                                                                                              |
| `EMAIL_APP_PASSWORD`     | unset                          | 16-character Gmail App Password (not your account password)                                                                                      |
| `CONTACT_RECEIVER_EMAIL` | `EMAIL_USER`                   | Where notifications are delivered                                                                                                                |
| `SEND_AUTO_REPLY`        | `true`                         | Email visitors a short confirmation                                                                                                              |
| `VITE_API_BASE_URL`      | unset (same origin)            | Build-time only. Set when the API is hosted on a different origin than the site, e.g. `https://api.yourdomain.com`.                              |

## Gmail App Password

The API signs in to Gmail over SMTP with an **App Password**, a separate 16-character password that only works for this app and can be revoked on its own. Your normal Google password will not work.

1. Turn on **2-Step Verification** for the Gmail account: Google Account → **Security** → **2-Step Verification**. App Passwords don't exist without it.
2. Open <https://myaccount.google.com/apppasswords>. The page often isn't linked from the Security menu, so go to the URL directly.
3. Enter a name such as `Portfolio contact form` and choose **Create**.
4. Copy the 16-character password (Google only shows it once) into `.env`:
   ```dotenv
   EMAIL_USER=neel.abja114@gmail.com
   EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
   ```
   Spaces are optional; they're stripped automatically.
5. Restart the API. You should see `[mail] Gmail SMTP login OK` in the startup log. If you see `Gmail rejected the login`, the password is wrong, was revoked, or is your account password.

Good to know:

- Changing your Google account password revokes every App Password; create a new one afterwards.
- Accounts enrolled in Advanced Protection, and some work or school accounts, can't use App Passwords.
- Consumer Gmail accounts can send roughly 500 emails a day. Each contact submission sends two (notification + auto-reply).

### Send a test message

With the API running (`npm start` or `npm run dev`), use an address you can check other than your Gmail as the visitor email, so you can see the auto-reply arrive too:

```bash
curl -i -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Visitor","email":"you@another-inbox.com","message":"Testing the contact form."}'
```

Expect `201 Created`. The notification lands in `CONTACT_RECEIVER_EMAIL` with Reply-To set to the visitor, so hitting **Reply** in Gmail answers them directly. The rate limit allows 5 requests per 15 minutes per IP, so a restart resets it if you need more tries.

## How the contact form works

`POST /api/contact` passes through, in order:

1. **Rate limiter**: 5 requests per IP per 15 minutes, then `429`.
2. **Validation**: name (≤ 80 chars), email (≤ 254, same rules as `<input type="email">`), message (≤ 3000), plus the hidden `website` honeypot field. Bots that fill it get `400`. Invalid input gets `400` with a `fields` object of per-field messages.
3. **Controller**: runs three tasks in parallel:
   - emails you a notification (Reply-To = the visitor);
   - emails the visitor a confirmation (if `SEND_AUTO_REPLY` is on). It never echoes their message, so the form can't relay arbitrary text through your Gmail;
   - saves a copy to MongoDB, if connected.

| Outcome                                   | Response |
| ----------------------------------------- | -------- |
| Notification sent **or** message stored   | `201`    |
| Both the notification and the save failed | `502`    |
| Neither mail nor MongoDB is configured    | `503`    |

Every individual failure is logged server-side. All visitor input is HTML-escaped before it goes into an email, and names are collapsed to a single line so they can't inject mail headers.

`GET /api/health` reports `{ status, database, mail }`.

## Project structure

```
src/
  App.jsx                          composes the page from the sections below
  data/                            all site content: edit these, not the components
    profile.js                     name, bio, stats, email, socials, SITE_URL
    nav.js                         section order, nav labels and kicker numbering
    projects.js                    project cards (repo links optional)
    experience.js                  timeline, education, certifications
    skills.js                      toolbox pills
  components/                      one file per section and building block (+ __tests__/)
    hero/                          HeroStage (scroll zoom + impact frames), DetectionOverlay,
                                   ScrambleText, SpeedLines
  hooks/
    useEyeZoom.js                  the first-scroll zoom, ink and impact-frame timing
    useTheme.js                    light/dark theme, persistence, iris-wipe transition
    useScrollReveal.js             reveal-on-scroll for [data-reveal] blocks
    useScrollProgress.js           how far an element has scrolled (timeline rail)
    useVelocityMarquee.js          the scroll-reactive marquee
    usePointerTilt.js              hero tilt and parallax
    useReadingProgress.js          the reading-progress bar
  lib/                             contact API client and validation, burst-line generator,
                                   motion preferences, formatting, PropTypes shapes
  styles.css                       design tokens and all styles
public/                            favicon.svg/.ico, apple-touch-icon.png, og-image.png
server/
  index.js                         startup: config summary, DB + SMTP checks, graceful shutdown
  app.js                           Express app: CORS allow-list, JSON limit, routes, errors
  config/
    env.js                         reads + validates env vars; warns, never throws
    db.js                          MongoDB connection (optional, non-blocking, retries)
    mailer.js                      cached Gmail SMTP transporter (null without credentials)
  routes/contactRoutes.js          POST /api/contact
  middleware/
    rateLimiter.js                 5 requests / 15 min per IP
    validateContact.js             field validation + honeypot
    errorHandler.js                JSON 404s, bad JSON, oversized bodies, 500s
  controllers/contactController.js mail + DB in parallel, decides the status code
  services/
    mailService.js                 sendContactNotification, sendAutoReply
    messageService.js              saveMessage (null when MongoDB isn't connected)
  templates/
    contactNotificationEmail.js    the email you receive
    autoReplyEmail.js              the visitor's confirmation
  utils/escapeHtml.js
  models/Message.js                Mongoose schema
  __tests__/                       API, env, and template tests (mail and DB mocked)
```

## Deploying

- Set `SITE_URL` in `src/data/profile.js` to the production origin before building. It fills in the canonical link, Open Graph/Twitter URLs and the JSON-LD, and generates `robots.txt` and `sitemap.xml` into `dist/`. Until it's set, the build prints a warning and leaves the URL-dependent tags out rather than shipping wrong ones.
- If the API runs on a different origin than the site, build with `VITE_API_BASE_URL` set to it and add the site's origin to the API's `CLIENT_ORIGIN`.
- Set `CLIENT_ORIGIN` to the exact origin(s) the site is served from, e.g. `https://yourdomain.com,https://www.yourdomain.com`.
- Behind a host's proxy, set `TRUST_PROXY=1`. Without it every visitor shares the proxy's IP and one rate-limit bucket.
- Configure secrets in your host's environment settings, not in committed files.

## Personalize it

- Content lives in `src/data/`: profile, bio, stats, contact address and socials in `profile.js`; projects in `projects.js`; jobs, education and certifications in `experience.js`; skills in `skills.js`.
- Add, rename or reorder sections in `src/data/nav.js`. The header nav and each section's numbered kicker both read from it.
- Tune the color tokens near the top of `src/styles.css`, light theme first, then the `[data-theme="dark"]` overrides. `--muted` and `--red-text` are the AA-contrast variants used for small text.
- Each section's kanji chapter title is the `kanji` field in `src/data/nav.js`. The Japanese display font is loaded as a small subset in `index.html`, so if you add new characters, add them to that font URL too.
- Update the page title, description and social-card copy in `index.html`, and regenerate `public/og-image.png` if the name or headline changes.
