import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensureOrderColumnsExist } from "@/lib/db-sync";

export async function GET(request: Request) {
  try {
    await ensureOrderColumnsExist();

    const userSession = await getSessionUser();

    // 1. All order access requires an authenticated session
    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized: Please log in to view orders" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderIdParam = searchParams.get("orderId");

    // 2. Single Order Lookup by ID / Order Number
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
                  images: { orderBy: { sortOrder: 'asc' } },
                }
              }
            }
          }
        }
      });

      if (!singleOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Authorization check: Admin or Order Owner
      const isAdmin = userSession.role === "ADMIN";
      const isOwner =
        (singleOrder.userId && singleOrder.userId === userSession.id) ||
        (singleOrder.customerEmail && userSession.email && singleOrder.customerEmail.toLowerCase() === userSession.email.toLowerCase());

      if (!isAdmin && !isOwner) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to access this order" },
          { status: 403 }
        );
      }

      // Resolve variant details
      const variantIds = singleOrder.items.map((i) => i.variantId).filter(Boolean) as string[];
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, name: true, imageUrl: true }
      });
      const variantMap = new Map(variants.map((v) => [v.id, v]));

      const singleOrderEnriched = {
        ...singleOrder,
        items: singleOrder.items.map((item) => {
          const v = item.variantId ? variantMap.get(item.variantId) || null : null;
          return {
            ...item,
            productImage: item.productImage || v?.imageUrl || item.product?.images[0]?.url || null,
            variant: v,
          };
        })
      };

      return NextResponse.json({ success: true, order: singleOrderEnriched, orders: [singleOrderEnriched] });
    }

    // 3. User Order History Lookup
    const userConditions = [
      { userId: userSession.id },
      ...(userSession.email ? [{ customerEmail: userSession.email }] : [])
    ];

    const orders = await prisma.order.findMany({
      where: {
        OR: userConditions
      },
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
                images: { orderBy: { sortOrder: 'asc' } },
              }
            }
          }
        }
      }
    });

    const variantIds = orders
      .flatMap((o) => o.items.map((i) => i.variantId))
      .filter(Boolean) as string[];

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, name: true, imageUrl: true }
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const ordersWithVariantDetails = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        const v = item.variantId ? variantMap.get(item.variantId) || null : null;
        return {
          ...item,
          productImage: item.productImage || v?.imageUrl || item.product?.images[0]?.url || null,
          variant: v,
        };
      })
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
