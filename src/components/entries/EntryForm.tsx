"use client";

import type { WorkoutType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const workoutTypes: WorkoutType[] = ["STRENGTH", "CARDIO", "MOBILITY", "REST", "OTHER"];

export type EntryFormValues = {
  date: string;
  workoutType: WorkoutType;
  workoutDuration: number;
  perceivedExertion: number;
  sorenessLevel: number;
  sleepDuration: number;
  sleepQuality: number;
  energyLevel: number;
  notes: string;
};

type Props = {
  mode: "create" | "edit";
  entryId?: string;
  initialValues?: EntryFormValues;
};

function getLocalDateString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().split("T")[0];
}

const defaultValues: EntryFormValues = {
  date: "",
  workoutType: "STRENGTH",
  workoutDuration: 45,
  perceivedExertion: 6,
  sorenessLevel: 4,
  sleepDuration: 7,
  sleepQuality: 7,
  energyLevel: 7,
  notes: "",
};

export default function EntryForm({ mode, entryId, initialValues }: Props) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialState = useMemo(
    () => ({
      ...defaultValues,
      date: getLocalDateString(),
      ...initialValues,
    }),
    [initialValues],
  );

  const [form, setForm] = useState<EntryFormValues>(initialState);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);
    setIsSubmitting(true);

    const isEdit = mode === "edit" && entryId;
    const endpoint = isEdit ? `/api/entries/${entryId}` : "/api/entries";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setIsSubmitting(false);

    if (!response.ok) {
      setApiError(payload?.error ?? "Failed to save entry.");
      return;
    }

    router.push("/entries");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {apiError ? (
        <p className="rounded-md border border-red-400/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {apiError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm text-light/90">
          <span className="mb-1 block">Date</span>
          <input
            className="w-full rounded border border-slate bg-navy px-3 py-2"
            type="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            required
          />
        </label>

        <label className="text-sm text-light/90">
          <span className="mb-1 block">Workout Type</span>
          <select
            className="w-full rounded border border-slate bg-navy px-3 py-2"
            value={form.workoutType}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, workoutType: event.target.value as WorkoutType }))
            }
          >
            {workoutTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm text-light/90">
          <span className="mb-1 block">Workout Duration (min)</span>
          <input
            className="w-full rounded border border-slate bg-navy px-3 py-2"
            type="number"
            min={0}
            value={form.workoutDuration}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, workoutDuration: Number(event.target.value) }))
            }
            required
          />
        </label>

        <label className="text-sm text-light/90">
          <span className="mb-1 block">Sleep Duration (hours)</span>
          <input
            className="w-full rounded border border-slate bg-navy px-3 py-2"
            type="number"
            min={0.1}
            step="0.1"
            value={form.sleepDuration}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, sleepDuration: Number(event.target.value) }))
            }
            required
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["perceivedExertion", "Exertion"],
          ["sorenessLevel", "Soreness"],
          ["sleepQuality", "Sleep Quality"],
          ["energyLevel", "Energy"],
        ].map(([key, label]) => (
          <label className="text-sm text-light/90" key={key}>
            <span className="mb-1 block">{label} (1-10)</span>
            <input
              className="w-full rounded border border-slate bg-navy px-3 py-2"
              type="number"
              min={1}
              max={10}
              value={form[key as keyof EntryFormValues] as number}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, [key]: Number(event.target.value) }))
              }
              required
            />
          </label>
        ))}
      </div>

      <label className="block text-sm text-light/90">
        <span className="mb-1 block">Notes</span>
        <textarea
          className="w-full rounded border border-slate bg-navy px-3 py-2"
          rows={4}
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-slate px-4 py-2 text-sm text-light hover:bg-light/20 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : mode === "edit" ? "Update Entry" : "Save Entry"}
        </button>
        {mode === "edit" ? (
          <Link
            href="/entries"
            className="rounded border border-slate px-4 py-2 text-sm text-light/90 hover:bg-navy"
          >
            Cancel
          </Link>
        ) : null}
      </div>
    </form>
  );
}
