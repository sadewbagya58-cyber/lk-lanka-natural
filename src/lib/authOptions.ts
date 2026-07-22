import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// 1. Programmatic environment overrides for production hosting reverse proxies
if (typeof window === "undefined") {
  if (!process.env.NEXTAUTH_URL) {
    // Detect environment or fallback to production URL
    process.env.NEXTAUTH_URL = process.env.NODE_ENV === "production"
      ? "https://kllankanatural.com"
      : "http://localhost:3000";
  }
  
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET || "hostinger_market_place_auth_secret_secure_key_32_chars";
  }
}

const secret = process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const identifier = credentials.email.trim();

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { phone: identifier }
            ]
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid email, phone, or password");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid email, phone, or password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          phone: user.phone,
          role: "USER",
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // 2. Configure unified cookie settings to bypass dynamic secure-prefix mismatches behind reverse proxies
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as { phone?: string | null }).phone;
        token.role = (user as { role?: string }).role || "USER";
      }

      if (!token.id && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email }
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.phone = dbUser.phone;
            token.role = "USER";
          }
        } catch (error) {
          console.error("Error fetching user in jwt callback:", error);
        }
      }

      if (trigger === "update" && session) {
        token.name = session.name;
        token.phone = session.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { phone?: string | null }).phone = token.phone as string | null;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    }
  },
  secret,
};
