import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

interface SyncCartItem {
  productId: string;
  quantity: number;
  selectedVariantId: string | null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItems, merge = false } = await request.json();
    const userId = (session.user as { id: string }).id;
    const items: SyncCartItem[] = Array.isArray(cartItems) ? cartItems : [];

    await prisma.$transaction(async (tx) => {
      // 1. Fetch current DB items
      const dbItems = await tx.cartItem.findMany({ where: { userId } });

      // 2. If merge is false, delete any DB items not present in the client payload
      if (!merge) {
        const idsToDelete: string[] = [];
        for (const dbItem of dbItems) {
          const existsInPayload = items.some(
            (item: SyncCartItem) =>
              item.productId === dbItem.productId &&
              (item.selectedVariantId || "") === dbItem.variantId
          );
          if (!existsInPayload) {
            idsToDelete.push(dbItem.id);
          }
        }
        if (idsToDelete.length > 0) {
          await tx.cartItem.deleteMany({ where: { id: { in: idsToDelete } } });
        }
      }

      // 3. Upsert client payload items
      if (items.length > 0) {
        // Fetch inventory limits for products
        const productIds = items.map((i: SyncCartItem) => i.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, stockQuantity: true }
        });
        const productStockMap = new Map(products.map(p => [p.id, p.stockQuantity]));
        const validProductIds = new Set(products.map(p => p.id));

        // Fetch inventory limits for variants
        const variantIds = items.map((i: SyncCartItem) => i.selectedVariantId).filter(Boolean) as string[];
        const variants = await tx.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: { id: true, stockQuantity: true }
        });
        const variantStockMap = new Map(variants.map(v => [v.id, v.stockQuantity]));

        for (const item of items) {
          // Verify that product exists in database before performing foreign key insert
          if (!validProductIds.has(item.productId)) {
            continue;
          }

          const variantId = item.selectedVariantId || "";
          const maxStock = (item.selectedVariantId ? variantStockMap.get(item.selectedVariantId) : productStockMap.get(item.productId)) ?? 99;

          const dbItem = dbItems.find(
            (db) => db.productId === item.productId && db.variantId === variantId
          );

          let targetQuantity = item.quantity;
          if (merge && dbItem) {
            // Combine guest and authenticated user cart quantities
            targetQuantity = dbItem.quantity + item.quantity;
          }

          const finalQuantity = Math.min(targetQuantity, maxStock);

          await tx.cartItem.upsert({
            where: {
              userId_productId_variantId: {
                userId,
                productId: item.productId,
                variantId,
              },
            },
            update: {
              quantity: finalQuantity,
            },
            create: {
              userId,
              productId: item.productId,
              variantId,
              quantity: finalQuantity,
            },
          });
        }
      }
    });

    // Fetch the final merged state from the database
    const finalDbItems = await prisma.cartItem.findMany({
      where: { userId },
    });

    return NextResponse.json({
      cartItems: finalDbItems.map((item: typeof finalDbItems[number]) => ({
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
