const MAX_URL_LENGTH = 2048;
const ALIAS_PATTERN = /^[a-zA-Z0-9_-]{3,24}$/;
const RESERVED_PATHS = new Set([
  "api",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "_next",
  "icon",
]);

type UrlResult = { ok: true; url: string } | { ok: false; error: string };
type AliasResult = { ok: true } | { ok: false; error: string };

/**
 * Accepts a raw user-typed string, fills in a protocol if missing, and
 * returns a normalized absolute URL — or a plain-language error.
 */
export function normalizeUrl(input: string): UrlResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false, error: "Paste a link first - that's the part we shorten." };
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return {
      ok: false,
      error: `That link is too long - keep it under ${MAX_URL_LENGTH} characters.`,
    };
  }

  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: "That doesn't look like a valid link. Check it and try again." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http and https links can be shortened." };
  }

  if (!parsed.hostname || !parsed.hostname.includes(".")) {
    return { ok: false, error: "That doesn't look like a valid link. Check it and try again." };
  }

  return { ok: true, url: parsed.toString() };
}

export function validateAlias(alias: string): AliasResult {
  if (!ALIAS_PATTERN.test(alias)) {
    return {
      ok: false,
      error: "Aliases are 3-24 characters: letters, numbers, hyphens, and underscores only.",
    };
  }

  if (RESERVED_PATHS.has(alias.toLowerCase())) {
    return { ok: false, error: "That alias is reserved - try another." };
  }

  return { ok: true };
}
