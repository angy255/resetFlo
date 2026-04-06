import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getAuthSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold">ResetFlo</h1>
      <p className="mt-3 text-light/80">
        Track training, recovery, and readiness with AI-powered guidance.
      </p>
      <div className="mt-8 flex gap-3">
        <Link className="rounded bg-slate px-4 py-2 text-light hover:bg-light/20" href="/login">
          Log in
        </Link>
        <Link className="rounded border border-slate px-4 py-2 hover:bg-navy" href="/register">
          Register
        </Link>
      </div>
    </main>
  );
}
