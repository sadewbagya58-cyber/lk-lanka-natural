import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensureOrderColumnsExist } from "@/lib/db-sync";

export async function GET(request: Request) {
  try {
    await ensureOrderColumnsExist();

    const { searchParams } = new URL(request.url);
    const orderIdParam = searchParams.get("orderId");

    const userSession = await getSessionUser();

    // If orderId is provided (e.g. on order confirmation page), allow lookup by orderId or orderNumber
    if (orderIdParam) {
      const singleOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { id: orderIdParam },
            { orderNumber: orderIdParam }
          ]
        },
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

      if (!singleOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Resolve variant details
      const variantIds = singleOrder.items.map(i => i.variantId).filter(Boolean) as string[];
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, name: true, imageUrl: true }
      });
      const variantMap = new Map(variants.map(v => [v.id, v]));

      const singleOrderEnriched = {
        ...singleOrder,
        items: singleOrder.items.map(item => ({
          ...item,
          variant: item.variantId ? variantMap.get(item.variantId) || null : null
        }))
      };

      return NextResponse.json({ success: true, order: singleOrderEnriched, orders: [singleOrderEnriched] });
    }

    // For user order history, user session is required
    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userSession.id;

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
