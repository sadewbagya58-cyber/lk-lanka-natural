import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const requestUrl = new URL(request.url);

    if (!clientId) {
      console.error("Google OAuth error: GOOGLE_CLIENT_ID environment variable is missing.");
      return NextResponse.redirect(new URL("/login?error=google_auth_config_missing", requestUrl.origin));
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || (process.env.NODE_ENV === "production" ? "https://kllankanatural.com" : requestUrl.origin);
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const state = crypto.randomBytes(32).toString("hex");

    const cookieStore = await cookies();
    cookieStore.set("oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600, // 10 minutes
      secure: process.env.NODE_ENV === "production",
    });

    const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleUrl.searchParams.set("client_id", clientId);
    googleUrl.searchParams.set("redirect_uri", redirectUri);
    googleUrl.searchParams.set("response_type", "code");
    googleUrl.searchParams.set("scope", "openid email profile");
    googleUrl.searchParams.set("state", state);
    googleUrl.searchParams.set("prompt", "select_account");

    return NextResponse.redirect(googleUrl.toString());
  } catch (error) {
    console.error("Error initiating Google OAuth redirect:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", origin));
  }
}

export const dynamic = "force-dynamic";
