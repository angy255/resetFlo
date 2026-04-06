"use client";

import Link from "next/link";
import { useState } from "react";
import type { WorkoutType } from "@prisma/client";

type EntryCardData = {
  id: string;
  date: string;
  workoutType: WorkoutType;
  workoutDuration: number;
  perceivedExertion: number;
  sorenessLevel: number;
  sleepDuration: number;
  sleepQuality: number;
  energyLevel: number;
  notes: string | null;
};

export default function EntryCard({ entry }: { entry: EntryCardData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-lg border border-slate bg-navy p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-light/60">{entry.date}</p>
          <p className="mt-1 text-sm font-semibold">{entry.workoutType}</p>
          <p className="text-sm text-light/80">
            {entry.workoutDuration}m, exertion {entry.perceivedExertion}/10
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/entries/${entry.id}/edit`}
            className="rounded border border-slate px-3 py-1.5 text-xs hover:bg-navy-dark"
          >
            Edit
          </Link>
          <button
            type="button"
            className="rounded bg-slate px-3 py-1.5 text-xs text-light hover:bg-light/20"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Hide details" : "View details"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-light/80 sm:grid-cols-3">
          <p>Soreness: {entry.sorenessLevel}/10</p>
          <p>Sleep: {entry.sleepDuration}h</p>
          <p>Sleep Quality: {entry.sleepQuality}/10</p>
          <p>Energy: {entry.energyLevel}/10</p>
          <p className="col-span-2 sm:col-span-3">Notes: {entry.notes || "None"}</p>
        </div>
      ) : null}
    </article>
  );
}
