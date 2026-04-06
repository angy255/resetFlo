"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { avatarColorClassMap, defaultAvatarColor, type AvatarColor } from "@/lib/avatar";

const protectedLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/entries/new", label: "New Entry" },
  { href: "/entries", label: "History" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = status === "authenticated";
  const userDisplayName = session?.user?.name ?? session?.user?.email ?? "User";
  const userInitial = userDisplayName.trim().charAt(0).toUpperCase() || "U";
  const avatarColorKey =
    (session?.user?.avatarColor as AvatarColor | null | undefined) ?? defaultAvatarColor;
  const avatarClass = avatarColorClassMap[avatarColorKey] ?? avatarColorClassMap[defaultAvatarColor];

  const authLinks = useMemo(
    () =>
      isAuthenticated
        ? protectedLinks
        : [
            { href: "/login", label: "Login" },
            { href: "/register", label: "Register" },
          ],
    [isAuthenticated],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate bg-navy-dark/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold sm:text-base">
          ResetFlo
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${
                pathname === link.href
                  ? "font-semibold text-light"
                  : "text-light/80 hover:text-light"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded border border-slate px-3 py-1.5 text-sm hover:bg-navy"
            >
              Sign out
            </button>
          ) : null}

          {isAuthenticated ? (
            <Link
              href="/profile"
              aria-label="Open profile"
              title={userDisplayName}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-light/30 text-xs font-semibold ${avatarClass} hover:brightness-110`}
            >
              {userInitial}
            </Link>
          ) : null}
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded p-2 text-light/80 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3">
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-sm ${
                  pathname === link.href ? "font-semibold text-light" : "text-light/80"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    void signOut({ callbackUrl: "/login" });
                  }}
                  className="w-fit rounded border border-slate px-3 py-1.5 text-sm"
                >
                  Sign out
                </button>
                <Link href="/profile" className="inline-flex items-center gap-2 text-xs text-light/70 hover:text-light">
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-light/30 text-[11px] font-semibold ${avatarClass}`}
                  >
                    {userInitial}
                  </span>
                  Profile
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
