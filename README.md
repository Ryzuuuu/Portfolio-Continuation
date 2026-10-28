# Neelabja Mukhopadhyay — Portfolio

A responsive, manga-inspired portfolio for AI/ML engineer Neelabja Mukhopadhyay, built with React, Vite, Express, and MongoDB. The front end is plain CSS plus native browser APIs: no animation or UI libraries. The contact form delivers email through Web3Forms, and when MongoDB is configured, keeps a backup copy of every message.

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
2. Copy `.env.example` to `.env` and set `WEB3FORMS_ACCESS_KEY` (see [Web3Forms setup](#web3forms-setup)). Everything else is optional.
3. Run `npm run dev` and open the Vite URL shown in the terminal. Vite proxies `/api` to the Express server on port `5000`.

The site renders without any configuration. The API also boots with no `.env` at all and logs a warning for each missing setting; the contact form then answers with `503` until Web3Forms or MongoDB is configured.

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

| Variable               | Default                        | Purpose                                                                                                                                          |
| ---------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PORT`                 | `5000`                         | API port                                                                                                                                         |
| `CLIENT_ORIGIN`        | local Vite dev/preview origins | Comma-separated CORS allow-list. Set to your site's origin(s) in production.                                                                     |
| `TRUST_PROXY`          | off                            | Number of reverse proxies in front of the API (usually `1` on Render, Railway, Fly.io, or behind Nginx), so rate limiting sees real visitor IPs. |
| `MONGODB_URI`          | unset                          | Optional backup store for messages                                                                                                               |
| `WEB3FORMS_ACCESS_KEY` | unset                          | Web3Forms access key used by the Render API to deliver contact-form email                                                                        |
| `VITE_API_BASE_URL`    | unset (same origin)            | Build-time only. Set when the API is hosted on a different origin than the site, e.g. `https://api.yourdomain.com`.                              |

## Web3Forms setup

1. Create an access key at <https://web3forms.com/> and verify the recipient email address with Web3Forms.
2. Set `WEB3FORMS_ACCESS_KEY` in the API environment (locally in `.env`; in production, in Render's Environment settings). Keep it out of source control and the browser bundle.
3. Restart or redeploy the API. Its startup configuration reports `Web3Forms HTTPS API` when the key is present. That confirms configuration only; send a real test from the deployed site to verify delivery.

Web3Forms delivers the notification to the recipient configured for the access key. The visitor's email is included as the Reply-To address, so replying to the notification responds to them. Web3Forms' built-in visitor autoresponder is a Pro feature; enable it in the Web3Forms dashboard if you want visitor confirmations.

### Send a test message

With the API running (`npm start` or `npm run dev`), submit a test message using an inbox you can check:

```bash
curl -i -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Visitor","email":"you@another-inbox.com","message":"Testing the contact form."}'
```

Expect `201 Created`. The notification is delivered to the recipient verified with the Web3Forms access key. The rate limit allows 5 requests per 15 minutes per IP.

## How the contact form works

`POST /api/contact` passes through, in order:

1. **Rate limiter**: 5 requests per IP per 15 minutes, then `429`.
2. **Validation**: name (≤ 80 chars), email (≤ 254, same rules as `<input type="email">`), message (≤ 3000), plus the hidden `website` honeypot field. Bots that fill it get `400`. Invalid input gets `400` with a `fields` object of per-field messages.
3. **Controller**: sends you a notification through Web3Forms (Reply-To = the visitor) and saves a copy to MongoDB if connected.

| Outcome                                     | Response |
| ------------------------------------------- | -------- |
| Notification sent **or** message stored     | `201`    |
| Both notification and MongoDB save failed   | `502`    |
| Neither Web3Forms nor MongoDB is configured | `503`    |

Every individual failure is logged server-side. Names are collapsed to a single line during validation so they can't inject email headers.

`GET /api/health` reports `{ status, database, mail }`. The `mail` value only indicates whether the Web3Forms key is configured; a successful contact-form test is needed to verify delivery.

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
  index.js                         startup: config summary, DB connection, graceful shutdown
  app.js                           Express app: CORS allow-list, JSON limit, routes, errors
  config/
    env.js                         reads + validates env vars; warns, never throws
    db.js                          MongoDB connection (optional, non-blocking, retries)
  routes/contactRoutes.js          POST /api/contact
  middleware/
    rateLimiter.js                 5 requests / 15 min per IP
    validateContact.js             field validation + honeypot
    errorHandler.js                JSON 404s, bad JSON, oversized bodies, 500s
  controllers/contactController.js mail + DB in parallel, decides the status code
  services/
    mailService.js                 sends contact notifications through Web3Forms
    messageService.js              saveMessage (null when MongoDB isn't connected)
  models/Message.js                Mongoose schema
  __tests__/                       API, environment, and email delivery tests
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
