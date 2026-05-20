import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { adminUsers } from "@/db/schema";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      async authorize(creds) {
        const username = creds?.username as string | undefined;
        const password = creds?.password as string | undefined;
        if (!username || !password) return null;
        const user = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.username, username),
        });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: String(user.id), name: user.username };
      },
    }),
  ],
});
