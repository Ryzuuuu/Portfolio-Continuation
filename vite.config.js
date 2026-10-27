import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { profile, SITE_URL } from "./src/data/profile.js";
import { skills } from "./src/data/skills.js";

const hasRealSiteUrl = /^https?:\/\/[^/]+$/.test(SITE_URL);

function personJsonLd() {
  const pageUrl = hasRealSiteUrl ? `${SITE_URL}/` : undefined;
  const [locality, country] = profile.location.split(",").map((part) => part.trim());
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    ...(pageUrl && { url: pageUrl }),
    name: `${profile.name} — ${profile.jobTitle}`,
    mainEntity: {
      "@type": "Person",
      name: profile.name,
      jobTitle: profile.jobTitle,
      description: profile.description,
      ...(pageUrl && { url: pageUrl }),
      email: `mailto:${profile.email}`,
      address: { "@type": "PostalAddress", addressLocality: locality, addressCountry: country },
      sameAs: Object.values(profile.social),
      knowsAbout: skills,
    },
  };
  // A raw "<" could close the <script> early; < is the same character to a JSON parser.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Keeps the site URL in one place (src/data/profile.js): fills the %SITE_URL% and
 * %JSON_LD% tokens in index.html and emits robots.txt and sitemap.xml at build time.
 * Until SITE_URL is set, tags that need an absolute URL are left out.
 */
function siteMeta() {
  return {
    name: "site-meta",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        // Without a domain there's no image URL either, so its size/alt tags go too.
        const withUrls = hasRealSiteUrl
          ? html.replaceAll("%SITE_URL%", SITE_URL)
          : html.replace(
              /[ \t]*<(?:link|meta)\b[^>]*(?:%SITE_URL%|og:image|twitter:image)[^>]*>\r?\n?/g,
              ""
            );
        return withUrls.replace("%JSON_LD%", personJsonLd());
      },
    },
    generateBundle() {
      if (!hasRealSiteUrl) {
        this.warn(
          "SITE_URL in src/data/profile.js isn't set to a full origin (e.g. https://yourdomain.com), " +
            "so the canonical link, og:url, og:image, twitter:image and sitemap.xml were left out of this build."
        );
      }

      const robots = ["User-agent: *", "Allow: /"];
      if (hasRealSiteUrl) robots.push("", `Sitemap: ${SITE_URL}/sitemap.xml`);
      this.emitFile({ type: "asset", fileName: "robots.txt", source: `${robots.join("\n")}\n` });

      if (hasRealSiteUrl) {
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            `  <url><loc>${SITE_URL}/</loc></url>`,
            "</urlset>",
            "",
          ].join("\n"),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), siteMeta()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "client",
          environment: "jsdom",
          include: ["src/**/*.test.{js,jsx}"],
          setupFiles: ["./src/test/setup.js"],
        },
      },
      {
        test: {
          name: "server",
          environment: "node",
          include: ["server/**/*.test.js"],
        },
      },
    ],
  },
});
