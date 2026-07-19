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

    const { wishlistIds, merge = false } = await request.json();
    const userId = (session.user as { id: string }).id;
    const ids = Array.isArray(wishlistIds) ? wishlistIds : [];

    await prisma.$transaction(async (tx) => {
      // 1. Fetch current DB items
      const dbItems = await tx.wishlistItem.findMany({ where: { userId } });

      // 2. If merge is false, delete any DB items not present in the client payload
      if (!merge) {
        const idsToDelete: string[] = [];
        for (const dbItem of dbItems) {
          const existsInPayload = ids.includes(dbItem.productId);
          if (!existsInPayload) {
            idsToDelete.push(dbItem.id);
          }
        }
        if (idsToDelete.length > 0) {
          await tx.wishlistItem.deleteMany({ where: { id: { in: idsToDelete } } });
        }
      }

      // 3. Upsert client payload items
      if (ids.length > 0) {
        for (const productId of ids) {
          await tx.wishlistItem.upsert({
            where: {
              userId_productId: {
                userId,
                productId,
              },
            },
            update: {}, // No updates needed, just preserve or create relation
            create: {
              userId,
              productId,
            },
          });
        }
      }
    });

    // Fetch the final merged state from the database
    const finalDbItems = await prisma.wishlistItem.findMany({
      where: { userId },
    });

    return NextResponse.json({
      wishlistIds: finalDbItems.map((item: typeof finalDbItems[number]) => item.productId),
    });
  } catch (error: unknown) {
    console.error("Wishlist sync API error:", error);
    return NextResponse.json({ error: "Failed to sync wishlist" }, { status: 500 });
  }
}
