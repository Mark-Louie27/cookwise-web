"use client";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

interface Stats {
  globalUsed: number;
  globalLimit: number;
  globalRemaining: number;
}

export default function QuotaIndicator() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/quota")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const pct = Math.round((stats.globalUsed / stats.globalLimit) * 100);
  const color =
    pct >= 90 ? "var(--terracotta)" :
    pct >= 70 ? "var(--amber)" :
    "var(--sage)";

  return (
    <div
      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border"
      style={{ borderColor: "var(--border)", backgroundColor: "white", color: "var(--soft-brown)" }}
      title={`API quota: ${stats.globalUsed} of ${stats.globalLimit} daily requests used`}
    >
      <Activity size={13} style={{ color }} />
      <span>
        <span style={{ color, fontWeight: 600 }}>{stats.globalRemaining}</span>
        <span> / {stats.globalLimit} API calls left today</span>
      </span>

      {/* Mini progress bar */}
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}