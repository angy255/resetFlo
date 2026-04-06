import Link from "next/link";

import EntryCard from "@/components/entries/EntryCard";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

type Props = {
  searchParams: Promise<{ page?: string; month?: string }>;
};

export default async function EntriesPage({ searchParams }: Props) {
  const session = await getAuthSession();
  if (!session) return null;

  const resolved = await searchParams;
  const pageParam = Number.parseInt(resolved.page ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const month = /^\d{4}-\d{2}$/.test(resolved.month ?? "") ? (resolved.month as string) : "";

  const monthFilter = (() => {
    if (!month) return undefined;
    const [yearText, monthText] = month.split("-");
    const year = Number.parseInt(yearText, 10);
    const monthIndex = Number.parseInt(monthText, 10) - 1;
    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 1));
    return { gte: start, lt: end };
  })();

  const where = {
    userId: session.user.id,
    ...(monthFilter ? { date: monthFilter } : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.entry.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.entry.count({
      where,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const previousHref = `/entries?page=${Math.max(1, page - 1)}${month ? `&month=${month}` : ""}`;
  const nextHref = `/entries?page=${Math.min(totalPages, page + 1)}${month ? `&month=${month}` : ""}`;

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Entry History</h1>
        <Link className="rounded bg-slate px-3 py-2 text-sm text-light hover:bg-light/20" href="/entries/new">
          New Entry
        </Link>
      </div>
      <form className="mb-4 flex items-end gap-3" method="GET" action="/entries">
        <label className="text-sm text-light/80">
          <span className="mb-1 block">Filter by month</span>
          <input
            type="month"
            name="month"
            defaultValue={month}
            className="rounded border border-slate bg-navy px-3 py-2 text-light outline-none focus:border-light"
          />
        </label>
        <button
          type="submit"
          className="rounded border border-slate px-3 py-2 text-sm text-light/90 hover:bg-navy"
        >
          Apply
        </button>
        {month ? (
          <Link href="/entries" className="text-sm text-light/80 underline hover:text-light">
            Clear
          </Link>
        ) : null}
      </form>
      <div className="space-y-3">
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={{
              id: entry.id,
              date: entry.date.toISOString().slice(0, 10),
              workoutType: entry.workoutType,
              workoutDuration: entry.workoutDuration,
              perceivedExertion: entry.perceivedExertion,
              sorenessLevel: entry.sorenessLevel,
              sleepDuration: entry.sleepDuration,
              sleepQuality: entry.sleepQuality,
              energyLevel: entry.energyLevel,
              notes: entry.notes,
            }}
          />
        ))}
        {entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate p-4 text-sm text-light/80">
            No entries yet.
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link
          href={previousHref}
          className={`rounded border px-3 py-2 text-sm ${
            page <= 1
              ? "pointer-events-none border-slate/50 text-light/40"
              : "border-slate hover:bg-navy"
          }`}
        >
          Previous
        </Link>
        <p className="text-sm text-light/80">
          Page {page} of {totalPages}
        </p>
        <Link
          href={nextHref}
          className={`rounded border px-3 py-2 text-sm ${
            page >= totalPages
              ? "pointer-events-none border-slate/50 text-light/40"
              : "border-slate hover:bg-navy"
          }`}
        >
          Next
        </Link>
      </div>
    </main>
  );
}
