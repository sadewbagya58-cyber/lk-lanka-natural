import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { Adapter } from "next-auth/adapters";

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "hostinger_default_secret_32_chars_long";
const useSecure = process.env.NODE_ENV === "production" || (process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL.startsWith("https://") : false);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as Adapter,
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
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  useSecureCookies: useSecure,
  cookies: {
    sessionToken: {
      name: useSecure ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecure,
      },
    },
    callbackUrl: {
      name: useSecure ? `__Secure-next-auth.callback-url` : `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecure,
      },
    },
    csrfToken: {
      name: useSecure ? `__Host-next-auth.csrf-token` : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecure,
      },
    },
    pkceCodeVerifier: {
      name: useSecure ? `__Secure-next-auth.pkce.code_verifier` : `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecure,
      },
    },
    state: {
      name: useSecure ? `__Secure-next-auth.state` : `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecure,
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
        token.role = (user as { role?: string }).role;
      }

      // Fallback DB check if token.id or token.role is missing during OAuth callback
      if ((!token.id || !token.role) && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email }
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.phone = dbUser.phone;
            token.role = dbUser.role;
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
