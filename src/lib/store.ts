import { Redis } from "@upstash/redis";
import type { LinkRecord } from "./types";

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export const storageMode: "redis" | "memory" = redis ? "redis" : "memory";

// ---------------------------------------------------------------------------
// In-memory fallback. Used automatically when UPSTASH_REDIS_REST_URL /
// UPSTASH_REDIS_REST_TOKEN aren't set — handy for `next dev`, but it resets
// on every restart and isn't shared across serverless instances. Configure
// Upstash (see .env.example) before relying on this in production.
// ---------------------------------------------------------------------------
interface MemoryEntry {
  longUrl: string;
  createdAt: number;
  custom: boolean;
  clicks: number;
}

const globalForMemory = globalThis as unknown as {
  __sniplineLinks?: Map<string, MemoryEntry>;
  __sniplineRateLimit?: Map<string, { count: number; resetAt: number }>;
};

const memoryLinks = globalForMemory.__sniplineLinks ?? new Map<string, MemoryEntry>();
globalForMemory.__sniplineLinks = memoryLinks;

const memoryRateLimit =
  globalForMemory.__sniplineRateLimit ?? new Map<string, { count: number; resetAt: number }>();
globalForMemory.__sniplineRateLimit = memoryRateLimit;

// ---------------------------------------------------------------------------
// Link CRUD
// ---------------------------------------------------------------------------

export async function codeExists(code: string): Promise<boolean> {
  if (redis) {
    const exists = await redis.exists(`link:${code}`);
    return exists === 1;
  }
  return memoryLinks.has(code);
}

export async function createLink(
  code: string,
  longUrl: string,
  custom: boolean
): Promise<LinkRecord> {
  const createdAt = Date.now();

  if (redis) {
    await redis.set(`link:${code}`, { longUrl, createdAt, custom });
    return { code, longUrl, createdAt, custom, clicks: 0 };
  }

  memoryLinks.set(code, { longUrl, createdAt, custom, clicks: 0 });
  return { code, longUrl, createdAt, custom, clicks: 0 };
}

export async function getLink(code: string): Promise<LinkRecord | null> {
  if (redis) {
    const stored = await redis.get<{ longUrl: string; createdAt: number; custom: boolean }>(
      `link:${code}`
    );
    if (!stored) return null;

    const clicks = (await redis.get<number>(`clicks:${code}`)) ?? 0;
    return {
      code,
      longUrl: stored.longUrl,
      createdAt: stored.createdAt,
      custom: stored.custom,
      clicks: Number(clicks),
    };
  }

  const entry = memoryLinks.get(code);
  if (!entry) return null;
  return { code, ...entry };
}

export async function incrementClicks(code: string): Promise<number> {
  if (redis) {
    return redis.incr(`clicks:${code}`);
  }

  const entry = memoryLinks.get(code);
  if (!entry) return 0;
  entry.clicks += 1;
  return entry.clicks;
}

export async function getManyClicks(codes: string[]): Promise<Record<string, number>> {
  if (codes.length === 0) return {};

  if (redis) {
    const keys = codes.map((code) => `clicks:${code}`);
    const values = await redis.mget(...keys);
    const result: Record<string, number> = {};
    codes.forEach((code, i) => {
      result[code] = Number(values[i] ?? 0);
    });
    return result;
  }

  const result: Record<string, number> = {};
  codes.forEach((code) => {
    result[code] = memoryLinks.get(code)?.clicks ?? 0;
  });
  return result;
}

// ---------------------------------------------------------------------------
// Rate limiting — a fixed window per identifier (typically the caller's IP),
// so one address can't flood the manifest with junk links.
// ---------------------------------------------------------------------------

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export async function checkRateLimit(
  identifier: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowIndex = Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS);
  const key = `ratelimit:${identifier}:${windowIndex}`;

  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000));
    }
    return { allowed: count <= RATE_LIMIT_MAX, remaining: Math.max(0, RATE_LIMIT_MAX - count) };
  }

  const now = Date.now();
  const existing = memoryRateLimit.get(identifier);
  if (!existing || existing.resetAt < now) {
    memoryRateLimit.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - existing.count),
  };
}
