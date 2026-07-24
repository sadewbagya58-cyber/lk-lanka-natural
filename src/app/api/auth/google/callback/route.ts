import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie, getEffectiveRole } from "@/lib/session";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || (process.env.NODE_ENV === "production" ? "https://kllankanatural.com" : origin);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    const searchParams = requestUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");

    const cookieStore = await cookies();
    const storedState = cookieStore.get("oauth_state")?.value;

    // Clear state cookie immediately for security
    cookieStore.set("oauth_state", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
    });

    if (oauthError || !code || !state || !storedState || state !== storedState) {
      console.warn("Google OAuth callback state mismatch or authorization error.");
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", baseUrl));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Google OAuth error: Missing clientId or clientSecret environment variables.");
      return NextResponse.redirect(new URL("/login?error=google_auth_config_missing", baseUrl));
    }

    // Server-side code exchange for access_token and id_token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Failed to exchange code for tokens with Google.");
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", baseUrl));
    }

    const tokenData = await tokenResponse.json();
    const { access_token, id_token, token_type, scope } = tokenData;

    if (!access_token) {
      console.error("Google OAuth response missing access_token.");
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", baseUrl));
    }

    // Retrieve user profile information using access_token
    const userProfileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userProfileResponse.ok) {
      console.error("Failed to fetch Google user profile.");
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", baseUrl));
    }

    const googleUser = await userProfileResponse.json();
    const { sub: googleSub, email, name, picture } = googleUser;

    if (!email) {
      console.error("Google user profile missing email address.");
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", baseUrl));
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find or create user and link Google account
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      // User exists: Link Google account if not linked already
      const existingAccount = await prisma.account.findFirst({
        where: {
          provider: "google",
          providerAccountId: googleSub,
        },
      });

      if (!existingAccount) {
        await prisma.account.create({
          data: {
            userId: user.id,
            type: "oauth",
            provider: "google",
            providerAccountId: googleSub,
            access_token,
            id_token: id_token || null,
            token_type: token_type || null,
            scope: scope || null,
          },
        });
      }

      if (!user.image && picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { image: picture },
        });
      }
    } else {
      // User does not exist: Create new user account and link Google provider
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name || "Google User",
          image: picture || null,
          accounts: {
            create: {
              type: "oauth",
              provider: "google",
              providerAccountId: googleSub,
              access_token,
              id_token: id_token || null,
              token_type: token_type || null,
              scope: scope || null,
            },
          },
        },
      });
    }

    // Issue custom JWT session
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: getEffectiveRole(user),
    };

    const sessionToken = signSession(sessionUser);
    await setSessionCookie(sessionToken);

    return NextResponse.redirect(new URL("/account", baseUrl));
  } catch (error) {
    console.error("Unexpected error in Google OAuth callback:", error);
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", baseUrl));
  }
}

export const dynamic = "force-dynamic";
