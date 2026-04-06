"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Registration failed.");
      setIsSubmitting(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setIsSubmitting(false);

    if (!signInResult || signInResult.error) {
      setError("Account created, but auto-login failed. Please log in.");
      return;
    }

    router.push(signInResult.url ?? "/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full rounded-xl border border-slate bg-navy p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-light/80">Start your fitness recovery journal.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-md border border-slate bg-navy-dark px-3 py-2 outline-none focus:border-light"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-md border border-slate bg-navy-dark px-3 py-2 outline-none focus:border-light"
            />
          </div>

          <div className="relative">
            <label className="mb-1 block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              className="w-full rounded-md border border-slate bg-navy-dark px-3 py-2 pr-20 outline-none focus:border-light"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-[2.1rem] rounded px-2 py-1 text-xs text-light/70 hover:bg-navy hover:text-light"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error ? (
            <p className="rounded-md border border-red-400/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-slate px-3 py-2 text-sm font-medium text-light hover:bg-light/20 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-light/80">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-light underline hover:text-light/80">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
