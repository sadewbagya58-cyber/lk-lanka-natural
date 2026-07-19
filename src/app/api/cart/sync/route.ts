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

    const { cartItems } = await request.json();
    const userId = (session.user as { id: string }).id;

    if (cartItems && cartItems.length > 0) {
      for (const item of cartItems) {
        await prisma.cartItem.upsert({
          where: {
            userId_productId_variantId: {
              userId,
              productId: item.productId,
              variantId: item.selectedVariantId || "",
            },
          },
          update: {
            quantity: item.quantity,
          },
          create: {
            userId,
            productId: item.productId,
            variantId: item.selectedVariantId || "",
            quantity: item.quantity,
          },
        });
      }
    }

    // Fetch merged state from database
    const dbItems = await prisma.cartItem.findMany({
      where: { userId },
    });

    return NextResponse.json({
      cartItems: dbItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedVariantId: item.variantId === "" ? null : item.variantId,
      })),
    });
  } catch (error: unknown) {
    console.error("Cart sync API error:", error);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}
