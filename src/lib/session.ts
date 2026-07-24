import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
}

/**
 * Returns the JWT secret from environment variables.
 * In production, NEXTAUTH_SECRET or AUTH_SECRET is strictly required to prevent
 * weak predictable fallback keys.
 */
function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY ERROR: NEXTAUTH_SECRET or AUTH_SECRET environment variable must be configured in production."
      );
    }
    return "development_fallback_auth_secret_key_32_chars_min";
  }
  return secret;
}

/**
 * Resolves the effective role for a user ("ADMIN" or "USER").
 * Checks database role, or matches against configured ADMIN_EMAILS.
 */
export function getEffectiveRole(user: { role?: string | null; email?: string | null }): "ADMIN" | "USER" {
  if (user.role === "ADMIN") {
    return "ADMIN";
  }

  const configuredAdmins = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : ["admin@kllankanatural.lk", "admin@kllankanatural.com", "kllankanatural@gmail.com"];

  if (user.email && configuredAdmins.includes(user.email.trim().toLowerCase())) {
    return "ADMIN";
  }

  return "USER";
}

export function signSession(payload: SessionUser): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "30d" });
}

export function verifySession(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, getSecret());
    return decoded as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set("session-token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session-token")?.value;
    if (!token) return null;
    return verifySession(token);
  } catch {
    return null;
  }
}

/**
 * Server-side helper to verify admin session for API endpoints.
 * Returns HTTP 401 if unauthenticated, HTTP 403 if non-admin.
 */
export async function verifyAdminSession(): Promise<
  { user: SessionUser; error: null; status: 200 } | { user: null; error: string; status: 401 | 403 }
> {
  const user = await getSessionUser();

  if (!user) {
    return { user: null, error: "Unauthorized: Please log in first", status: 401 };
  }

  if (user.role !== "ADMIN") {
    return { user: null, error: "Forbidden: Admin access required", status: 403 };
  }

  return { user, error: null, status: 200 };
}
