import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration. NO database imports here so it can be
 * used in `middleware.ts`, which runs on the Edge runtime.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isAdmin = request.nextUrl.pathname.startsWith("/admin");
      const isLogin = request.nextUrl.pathname === "/admin/login";
      if (isAdmin && !isLogin) return !!auth;
      return true;
    },
  },
};
