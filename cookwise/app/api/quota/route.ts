import { NextResponse } from "next/server";
import { getRateLimitStats } from "@/lib/rateLimiter";

export async function GET() {
  const stats = getRateLimitStats();
  return NextResponse.json(stats);
}