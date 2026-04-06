import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";

export const metadata: Metadata = {
  title: "ResetFlo",
  description: "Track training and recovery with AI-powered insights.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-navy-dark text-light">
        <AuthSessionProvider session={session}>
          <Navbar />
          <div className="min-h-[calc(100vh-3.5rem)]">{children}</div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
