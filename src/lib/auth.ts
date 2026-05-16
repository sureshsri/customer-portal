import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./mongodb";
import User from "@/models/User";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

// ─── Session Config ────────────────────────────────────────────────────────
// SESSION_MAX_AGE: how long the session lasts in hours (default: 8 hours)
// Set SESSION_MAX_AGE in .env.local to change e.g. SESSION_MAX_AGE=4
const SESSION_MAX_AGE_HOURS = Number(process.env.SESSION_MAX_AGE || 8);
const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_HOURS * 60 * 60;

// INACTIVITY_TIMEOUT: auto logout after X minutes of no activity (default: 30 mins)
// Set INACTIVITY_TIMEOUT in .env.local to change e.g. INACTIVITY_TIMEOUT=60
export const INACTIVITY_TIMEOUT_MINUTES = Number(process.env.INACTIVITY_TIMEOUT || 30);
export const INACTIVITY_TIMEOUT_MS = INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;
// ───────────────────────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // Check admin from environment variables
        if (
          credentials.username === ADMIN_USERNAME &&
          credentials.password === ADMIN_PASSWORD
        ) {
          return {
            id: "admin",
            username: ADMIN_USERNAME,
            email: "admin@portal.com",
            role: "admin",
            name: "Administrator",
          };
        }

        // Check DB users
        await connectDB();
        const user = await User.findOne({ username: credentials.username });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          name: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.lastActivity = Date.now();
      }

      // Check inactivity timeout
      if (token.lastActivity) {
        const inactiveDuration = Date.now() - (token.lastActivity as number);
        if (inactiveDuration > INACTIVITY_TIMEOUT_MS) {
          // Return empty token to force logout
          return {};
        }
      }

      // Update last activity on every request
      token.lastActivity = Date.now();
      return token;
    },
    async session({ session, token }) {
      // If token is empty (inactivity logout), return empty session
      if (!token.id) {
        return { ...session, user: undefined, expires: new Date(0).toISOString() };
      }
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
};
