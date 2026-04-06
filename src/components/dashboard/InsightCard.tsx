"use client";

import { useEffect, useState } from "react";

type Insight = {
  id: string;
  content: string;
  createdAt: string;
} | null;

type Props = {
  initialInsight: Insight;
};

const COOLDOWN_SECONDS = 300;

export default function InsightCard({ initialInsight }: Props) {
  const [insight, setInsight] = useState<Insight>(initialInsight);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds]);

  const inCooldown = remainingSeconds > 0;

  async function generateInsight() {
    if (loading || inCooldown) return;

    setError(null);
    setLoading(true);
    setRemainingSeconds(COOLDOWN_SECONDS);

    const response = await fetch("/api/insights", { method: "POST" });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; insight?: Insight }
      | null;

    setLoading(false);

    if (!response.ok) {
      setError(payload?.error ?? "Failed to generate insight.");
      return;
    }

    if (payload?.insight) {
      setInsight(payload.insight);
    }
  }

  return (
    <section className="rounded-lg border border-slate bg-navy p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">AI Insight</h2>
        <button
          type="button"
          onClick={generateInsight}
          disabled={loading || inCooldown}
          className="rounded bg-slate px-3 py-1.5 text-xs font-medium text-light hover:bg-light/20 disabled:opacity-50"
        >
          {loading
            ? "Generating..."
            : inCooldown
              ? `Wait ${remainingSeconds}s`
              : "Generate New Insight"}
        </button>
      </div>

      {error ? (
        <p className="mb-3 rounded border border-red-400/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <p className="whitespace-pre-wrap text-sm text-light/85">
        {insight?.content ?? "No insight yet. Add entries and generate one."}
      </p>
    </section>
  );
}
