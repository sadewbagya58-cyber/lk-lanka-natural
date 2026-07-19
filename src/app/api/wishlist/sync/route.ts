import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wishlistIds } = await request.json();
    const userId = (session.user as { id: string }).id;

    if (wishlistIds && wishlistIds.length > 0) {
      for (const productId of wishlistIds) {
        await prisma.wishlistItem.upsert({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
          update: {},
          create: {
            userId,
            productId,
          },
        });
      }
    }

    // Fetch merged state from database
    const dbItems = await prisma.wishlistItem.findMany({
      where: { userId },
    });

    return NextResponse.json({
      wishlistIds: dbItems.map((item: typeof dbItems[number]) => item.productId),
    });
  } catch (error: unknown) {
    console.error("Wishlist sync API error:", error);
    return NextResponse.json({ error: "Failed to sync wishlist" }, { status: 500 });
  }
}
