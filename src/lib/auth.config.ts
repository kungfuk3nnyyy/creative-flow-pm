import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

/**
 * Edge-safe auth configuration.
 * This config is used by middleware and must not import Prisma, bcrypt, or
 * other Node-only modules so it stays within the Edge Function size limit.
 */
export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [], // Populated in the full auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.organizationId = (user as { organizationId: string }).organizationId;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isAuthenticated = !!auth?.user;
      const isPublicRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register") ||
        nextUrl.pathname.startsWith("/forgot-password") ||
        nextUrl.pathname.startsWith("/api/auth");

      if (isPublicRoute) return true;
      return isAuthenticated;
    },
  },
};
