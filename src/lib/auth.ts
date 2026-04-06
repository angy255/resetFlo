import bcrypt from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) return null;

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarColor: user.avatarColor,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.avatarColor = (user as { avatarColor?: string | null }).avatarColor ?? null;
      }

      if (trigger === "update") {
        const incoming = session as
          | {
              name?: unknown;
              avatarColor?: unknown;
              user?: { name?: unknown; avatarColor?: unknown };
            }
          | undefined;
        const incomingName =
          typeof incoming?.name === "string"
            ? incoming.name
            : typeof incoming?.user?.name === "string"
              ? incoming.user.name
              : null;
        const incomingAvatarColor =
          typeof incoming?.avatarColor === "string"
            ? incoming.avatarColor
            : typeof incoming?.user?.avatarColor === "string"
              ? incoming.user.avatarColor
              : null;

        if (incomingName) {
          token.name = incomingName;
        }
        token.avatarColor = incomingAvatarColor;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        session.user.avatarColor =
          typeof token.avatarColor === "string" ? token.avatarColor : null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session;
}
