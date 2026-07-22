import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ session: null });
    }
    return NextResponse.json({ session: { user } });
  } catch (error) {
    console.error("Session GET route error:", error);
    return NextResponse.json({ session: null });
  }
}
export const dynamic = "force-dynamic";
