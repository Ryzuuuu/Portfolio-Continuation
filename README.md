# Neelabja Mukhopadhyay — Portfolio

A responsive, manga-inspired portfolio for AI/ML engineer Neelabja Mukhopadhyay, built with React, Vite, Express, and MongoDB. The front end uses lightweight CSS and native browser APIs for scroll reveals, a reading-progress indicator, and pointer-responsive project cards.

## Getting started

1. Install dependencies. On Windows, keep npm's cache and temporary files on the portfolio drive:
   ```powershell
   New-Item -ItemType Directory -Force .tmp, .npm-cache | Out-Null
   $env:TEMP = "$PWD\.tmp"; $env:TMP = $env:TEMP
   npm install --cache "$PWD\.npm-cache"
   ```
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection string. `.env` and other environment files are ignored by Git; only the credential-free `.env.example` is committed. Configure production secrets in your hosting provider's environment settings.
3. Run `npm run dev` and open the local Vite URL shown in the terminal.

The portfolio itself runs without MongoDB. The contact form stores submissions through the Express API and requires a reachable MongoDB instance. The API runs on port `5000` by default.

## Personalize it

- Update the profile, experience, contact address, and social links in `src/App.jsx`.
- Update project details in the `projects` array in `src/App.jsx`.
- Tune the color tokens near the top of `src/styles.css`.
- Update the page title and description in `index.html`.
