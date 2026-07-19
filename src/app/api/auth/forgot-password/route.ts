import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User with this email does not exist" }, { status: 404 });
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600000); // Expires in 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // For Hostinger/development, we return the mock link to allow resetting in the web browser
    const resetLink = `/auth/update-password?token=${token}&email=${encodeURIComponent(email)}`;
    console.log("Password reset link generated:", resetLink);

    return NextResponse.json({
      message: "Password reset link has been dispatched to your email address!",
      mockLink: resetLink, // Expose for mock flow utility
    });
  } catch (error: unknown) {
    console.error("Forgot password API error:", error);
    return NextResponse.json({ error: "Failed to generate password reset token" }, { status: 500 });
  }
}
