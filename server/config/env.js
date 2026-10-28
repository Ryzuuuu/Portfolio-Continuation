import dotenv from "dotenv";

// Tests must never pick up real credentials from a local .env file.
if (process.env.NODE_ENV !== "test") {
  dotenv.config({ quiet: true });
}

const DEFAULT_PORT = 5000;
const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

/**
 * Reads and validates configuration. Never throws: anything missing or malformed
 * falls back to a safe default and is reported in `warnings`.
 */
export function loadEnv(source = process.env) {
  const warnings = [];

  const read = (name) => {
    const value = source[name];
    return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
  };

  let port = DEFAULT_PORT;
  const rawPort = read("PORT");
  if (rawPort !== undefined) {
    const parsed = Number(rawPort);
    if (Number.isInteger(parsed) && parsed > 0 && parsed < 65536) port = parsed;
    else warnings.push(`PORT="${rawPort}" is not a valid port; using ${DEFAULT_PORT}.`);
  }

  const rawOrigins = read("CLIENT_ORIGIN");
  let clientOrigins = DEV_ORIGINS;
  if (rawOrigins === undefined) {
    warnings.push(
      "CLIENT_ORIGIN is not set; only the local Vite dev/preview servers may call the API " +
        "from a browser. Set it to your site's origin in production."
    );
  } else {
    clientOrigins = rawOrigins
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .flatMap((entry) => {
        const origin = toOrigin(entry);
        if (!origin)
          warnings.push(
            `Ignoring CLIENT_ORIGIN entry "${entry}" (expected e.g. https://example.com).`
          );
        return origin ? [origin] : [];
      });
    if (clientOrigins.length === 0) {
      warnings.push(
        "CLIENT_ORIGIN has no valid origins; browsers on other origins will be blocked."
      );
    }
  }

  const mongodbUri = read("MONGODB_URI");
  if (!mongodbUri) {
    warnings.push("MONGODB_URI is not set; contact messages will not be stored in MongoDB.");
  }

  const trustProxy = parseTrustProxy(read("TRUST_PROXY"));
  if (trustProxy === true) {
    warnings.push(
      "TRUST_PROXY=true trusts every X-Forwarded-For hop, so clients can spoof their IP and dodge " +
        "the rate limit. Prefer the number of proxies in front of the API (usually 1)."
    );
  }

  const env = {
    port,
    clientOrigins,
    usingDefaultOrigins: rawOrigins === undefined,
    mongodbUri,
    trustProxy,
  };

  return { env: deepFreeze(env), warnings };
}

function toOrigin(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

function parseTrustProxy(raw) {
  if (raw === undefined || /^(false|0|no|off)$/i.test(raw)) return false;
  if (/^(true|yes|on)$/i.test(raw)) return true;
  if (/^\d+$/.test(raw)) return Number(raw);
  // Express also accepts names like "loopback" and comma-separated subnets.
  return raw;
}

function deepFreeze(object) {
  Object.values(object).forEach((value) => {
    if (value && typeof value === "object") deepFreeze(value);
  });
  return Object.freeze(object);
}

/** Strips credentials so the URI is safe to print. */
function describeMongoUri(uri) {
  try {
    const url = new URL(uri);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return "(configured)";
  }
}

const loaded = loadEnv();

export const env = loaded.env;
const envWarnings = loaded.warnings;

export function reportEnv(log = console) {
  const rows = [
    ["Port", String(env.port)],
    [
      "CORS origins",
      `${env.clientOrigins.join(", ") || "(none)"}${env.usingDefaultOrigins ? " (dev default)" : ""}`,
    ],
    ["MongoDB", env.mongodbUri ? describeMongoUri(env.mongodbUri) : "not configured"],
    ["Trust proxy", String(env.trustProxy)],
  ];
  log.info("[config] Portfolio API configuration");
  rows.forEach(([label, value]) => log.info(`  ${label.padEnd(17)}${value}`));
  envWarnings.forEach((warning) => log.warn(`[config] WARNING: ${warning}`));
}
