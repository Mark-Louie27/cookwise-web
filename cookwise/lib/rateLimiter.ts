/**
 * In-memory rate limiter using a sliding window approach.
 *
 * Two layers of protection:
 *  1. Per-IP  — max 10 requests / 60 seconds  (stops a single user hammering)
 *  2. Global  — max 100 requests / 24 hours   (protects your Edamam free-tier quota)
 */

interface Window {
  timestamps: number[];
}

// ip -> list of request timestamps
const ipWindows = new Map<string, Window>();

// global daily counter
const globalWindow: Window = { timestamps: [] };

// ── Config ────────────────────────────────────────────────────────────────────
const IP_LIMIT = 10;           // requests per IP
const IP_WINDOW_MS = 60_000;   // 60 seconds

const GLOBAL_LIMIT = 100;           // requests total
const GLOBAL_WINDOW_MS = 86_400_000; // 24 hours
// ─────────────────────────────────────────────────────────────────────────────

function prune(window: Window, windowMs: number) {
  const cutoff = Date.now() - windowMs;
  window.timestamps = window.timestamps.filter((t) => t > cutoff);
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: "ip" | "global";
  retryAfterSeconds?: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  // ── Global check ────────────────────────────────────────────────────────────
  prune(globalWindow, GLOBAL_WINDOW_MS);
  if (globalWindow.timestamps.length >= GLOBAL_LIMIT) {
    const oldest = globalWindow.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + GLOBAL_WINDOW_MS - now) / 1000);
    return { allowed: false, reason: "global", retryAfterSeconds };
  }

  // ── Per-IP check ─────────────────────────────────────────────────────────────
  if (!ipWindows.has(ip)) ipWindows.set(ip, { timestamps: [] });
  const ipWindow = ipWindows.get(ip)!;
  prune(ipWindow, IP_WINDOW_MS);

  if (ipWindow.timestamps.length >= IP_LIMIT) {
    const oldest = ipWindow.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + IP_WINDOW_MS - now) / 1000);
    return { allowed: false, reason: "ip", retryAfterSeconds };
  }

  // ── Allow & record ────────────────────────────────────────────────────────
  ipWindow.timestamps.push(now);
  globalWindow.timestamps.push(now);

  return { allowed: true };
}

export function getRateLimitStats() {
  prune(globalWindow, GLOBAL_WINDOW_MS);
  return {
    globalUsed: globalWindow.timestamps.length,
    globalLimit: GLOBAL_LIMIT,
    globalRemaining: GLOBAL_LIMIT - globalWindow.timestamps.length,
  };
}