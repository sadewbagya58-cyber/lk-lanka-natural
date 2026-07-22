import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "hostinger_market_place_auth_secret_secure_key_32_chars";

interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
}

export function signSession(payload: SessionUser): string {
  return jwt.sign(payload, secret, { expiresIn: "30d" });
}

export function verifySession(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, secret);
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
