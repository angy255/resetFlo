"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { avatarColorClassMap, avatarColorOptions, defaultAvatarColor, type AvatarColor } from "@/lib/avatar";

type ProfileForm = {
  name: string;
  avatarColor: AvatarColor;
  age: string;
  gender: "" | "male" | "female" | "other" | "prefer_not_to_say";
  weight: string;
  height: string;
  trainingLevel: "" | "beginner" | "intermediate" | "advanced";
  trainingGoal: "" | "strength" | "endurance" | "rehab" | "general_fitness";
  injuryNotes: string;
};

type ProfilePayload = {
  profile: {
    email: string;
    name: string;
    avatarColor: AvatarColor | null;
    age: number | null;
    gender: ProfileForm["gender"] | null;
    weight: number | null;
    height: number | null;
    trainingLevel: ProfileForm["trainingLevel"] | null;
    trainingGoal: ProfileForm["trainingGoal"] | null;
    injuryNotes: string | null;
  };
};

const initialForm: ProfileForm = {
  name: "",
  avatarColor: defaultAvatarColor,
  age: "",
  gender: "",
  weight: "",
  height: "",
  trainingLevel: "",
  trainingGoal: "",
  injuryNotes: "",
};

export default function ProfilePage() {
  const { update } = useSession();
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setError(null);
      const response = await fetch("/api/profile");
      const payload = (await response.json().catch(() => null)) as
        | ({ error?: string } & Partial<ProfilePayload>)
        | null;

      if (!response.ok || !payload?.profile) {
        setError(payload?.error ?? "Failed to load profile.");
        setLoading(false);
        return;
      }

      setEmail(payload.profile.email);
      setForm({
        name: payload.profile.name,
        avatarColor: payload.profile.avatarColor ?? defaultAvatarColor,
        age: payload.profile.age?.toString() ?? "",
        gender: payload.profile.gender ?? "",
        weight: payload.profile.weight?.toString() ?? "",
        height: payload.profile.height?.toString() ?? "",
        trainingLevel: payload.profile.trainingLevel ?? "",
        trainingGoal: payload.profile.trainingGoal ?? "",
        injuryNotes: payload.profile.injuryNotes ?? "",
      });
      setLoading(false);
    }

    void loadProfile();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      name: form.name,
      avatarColor: form.avatarColor,
      age: form.age ? Number(form.age) : null,
      gender: form.gender || null,
      weight: form.weight ? Number(form.weight) : null,
      height: form.height ? Number(form.height) : null,
      trainingLevel: form.trainingLevel || null,
      trainingGoal: form.trainingGoal || null,
      injuryNotes: form.injuryNotes.trim() ? form.injuryNotes : null,
    };

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as
      | { error?: string; profile?: { name?: string; avatarColor?: AvatarColor | null } }
      | null;
    setSaving(false);

    if (!response.ok) {
      setError(body?.error ?? "Failed to save profile.");
      return;
    }

    await update({
      name: body?.profile?.name ?? form.name.trim(),
      avatarColor: body?.profile?.avatarColor ?? form.avatarColor,
    });
    setSuccess("Profile updated.");
  }

  if (loading) {
    return <main className="mx-auto w-full max-w-3xl p-6 text-light/80">Loading profile...</main>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="mt-1 text-sm text-light/80">{email}</p>

      <form className="mt-5 space-y-4 rounded-lg border border-slate bg-navy p-4" onSubmit={onSubmit}>
        {error ? (
          <p className="rounded-md border border-red-400/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-md border border-emerald-400/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
            {success}
          </p>
        ) : null}

        <label className="block text-sm text-light/90">
          <span className="mb-1 block">Name</span>
          <input
            className="w-full rounded border border-slate bg-navy-dark px-3 py-2 outline-none focus:border-light"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </label>

        <fieldset className="text-sm text-light/90">
          <legend className="mb-2 block">Avatar Color</legend>
          <div className="flex flex-wrap items-center gap-3">
            {avatarColorOptions.map((option) => (
              <label
                key={option}
                className="inline-flex cursor-pointer items-center"
                aria-label={`Set avatar color to ${option}`}
                title={`Set avatar color to ${option}`}
              >
                <input
                  type="radio"
                  name="avatarColor"
                  value={option}
                  checked={form.avatarColor === option}
                  onChange={() => setForm((prev) => ({ ...prev, avatarColor: option }))}
                  className="sr-only"
                />
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-light/30 text-xs font-semibold uppercase ${avatarColorClassMap[option]} ${
                    form.avatarColor === option ? "ring-2 ring-light/70 ring-offset-2 ring-offset-navy" : ""
                  }`}
                >
                  {form.name.trim().charAt(0).toUpperCase() || "U"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm text-light/90">
            <span className="mb-1 block">Age</span>
            <input
              className="w-full rounded border border-slate bg-navy-dark px-3 py-2 outline-none focus:border-light"
              type="number"
              min={13}
              max={120}
              value={form.age}
              onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
            />
          </label>
          <label className="text-sm text-light/90">
            <span className="mb-1 block">Gender</span>
            <select
              className="w-full rounded border border-slate bg-navy-dark px-3 py-2 outline-none focus:border-light"
              value={form.gender}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, gender: event.target.value as ProfileForm["gender"] }))
              }
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm text-light/90">
            <span className="mb-1 block">Weight (kg)</span>
            <input
              className="w-full rounded border border-slate bg-navy-dark px-3 py-2 outline-none focus:border-light"
              type="number"
              min={1}
              step="0.1"
              value={form.weight}
              onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))}
            />
          </label>
          <label className="text-sm text-light/90">
            <span className="mb-1 block">Height (cm)</span>
            <input
              className="w-full rounded border border-slate bg-navy-dark px-3 py-2 outline-none focus:border-light"
              type="number"
              min={1}
              step="0.1"
              value={form.height}
              onChange={(event) => setForm((prev) => ({ ...prev, height: event.target.value }))}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm text-light/90">
            <span className="mb-1 block">Training Level</span>
            <select
              className="w-full rounded border border-slate bg-navy-dark px-3 py-2 outline-none focus:border-light"
              value={form.trainingLevel}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  trainingLevel: event.target.value as ProfileForm["trainingLevel"],
                }))
              }
            >
              <option value="">Not specified</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label className="text-sm text-light/90">
            <span className="mb-1 block">Training Goal</span>
            <select
              className="w-full rounded border border-slate bg-navy-dark px-3 py-2 outline-none focus:border-light"
              value={form.trainingGoal}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  trainingGoal: event.target.value as ProfileForm["trainingGoal"],
                }))
              }
            >
              <option value="">Not specified</option>
              <option value="strength">Strength</option>
              <option value="endurance">Endurance</option>
              <option value="rehab">Rehab</option>
              <option value="general_fitness">General Fitness</option>
            </select>
          </label>
        </div>

        <label className="block text-sm text-light/90">
          <span className="mb-1 block">Injury Notes</span>
          <textarea
            className="w-full rounded border border-slate bg-navy-dark px-3 py-2 outline-none focus:border-light"
            rows={4}
            value={form.injuryNotes}
            onChange={(event) => setForm((prev) => ({ ...prev, injuryNotes: event.target.value }))}
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-slate px-4 py-2 text-sm text-light hover:bg-light/20 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </main>
  );
}
