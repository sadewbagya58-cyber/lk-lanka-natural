import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        address: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                gradient: true,
                visualSeed: true,
              }
            }
          }
        }
      }
    });

    // Resolve variant names for items programmatically to avoid complex deep joins
    const variantIds = orders
      .flatMap(o => o.items.map(i => i.variantId))
      .filter(Boolean) as string[];

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, name: true, imageUrl: true }
    });

    const variantMap = new Map(variants.map(v => [v.id, v]));

    const ordersWithVariantDetails = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        variant: item.variantId ? variantMap.get(item.variantId) || null : null
      }))
    }));

    return NextResponse.json({ success: true, orders: ordersWithVariantDetails });
  } catch (error: unknown) {
    console.error("Fetch orders API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
