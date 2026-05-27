import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitStats } from "@/lib/rateLimiter";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;

export async function GET(req: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const limit = checkRateLimit(ip);

  if (!limit.allowed) {
    const message =
      limit.reason === "global"
        ? `We've hit today's recipe search limit 😔 — come back in ${Math.ceil((limit.retryAfterSeconds || 0) / 3600)} hour(s)!`
        : `Whoa, slow down! 😅 Please wait ${limit.retryAfterSeconds} second(s) before searching again.`;

    return NextResponse.json(
      { error: message, reason: limit.reason },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds ?? 60),
          "X-RateLimit-Reason": limit.reason ?? "unknown",
        },
      }
    );
  }

  const stats = getRateLimitStats();

  // ── Build query params ─────────────────────────────────────────────────────
  const { searchParams } = new URL(req.url);
  const q        = searchParams.get("q") || "chicken";
  const from     = searchParams.get("from") || "0";
  const to       = searchParams.get("to") || "12";
  const mealType = searchParams.get("mealType") || "";
  const diet     = searchParams.get("diet") || "";

  const params = new URLSearchParams({
    type: "public",
    beta: "true",
    q,
    from,
    to,
    ...(mealType ? { mealType } : {}),
    ...(diet ? { diet } : {}),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(
      `https://edamam-recipe-search.p.rapidapi.com/api/recipes/v2?${params}`,
      {
        headers: {
          "Accept": "application/json",
          "Accept-Language": "en",
          "x-rapidapi-host": "edamam-recipe-search.p.rapidapi.com",
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
        signal: controller.signal,
        cache: "no-store",
      }
    );
    clearTimeout(timeout);

    const text = await res.text();
    console.log(`Edamam RapidAPI ${res.status}:`, text.slice(0, 150));

    if (!res.ok) {
      return NextResponse.json(
        { error: `API error ${res.status}: ${text}` },
        { status: res.status }
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json(data, {
      headers: {
        "X-RateLimit-Global-Used":      String(stats.globalUsed),
        "X-RateLimit-Global-Remaining": String(stats.globalRemaining),
        "X-RateLimit-Global-Limit":     String(stats.globalLimit),
      },
    });
  } catch (e: unknown) {
    clearTimeout(timeout);
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Fetch error:", msg);
    if (msg.includes("abort") || msg.includes("socket")) {
      return NextResponse.json(
        { error: "Connection timed out. Please try again." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}