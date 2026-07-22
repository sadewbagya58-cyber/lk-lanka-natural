import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function verifyAdmin() {
  return true;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
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

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Resolve variant details
    const variantIds = order.items.map(i => i.variantId).filter(Boolean) as string[];
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, name: true, imageUrl: true }
    });
    const variantMap = new Map(variants.map(v => [v.id, v]));

    const orderWithVariantDetails = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        variant: item.variantId ? variantMap.get(item.variantId) || null : null
      }))
    };

    return NextResponse.json({ success: true, order: orderWithVariantDetails });
  } catch (error: unknown) {
    console.error("Admin fetch order details error:", error);
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status, paymentStatus } = await request.json();

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isCancelling = status === "CANCELLED" && currentOrder.status !== "CANCELLED";

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // If order is being cancelled, restore inventory
      if (isCancelling) {
        for (const item of currentOrder.items) {
          if (item.variantId) {
            // Restore variant inventory
            const variant = await tx.productVariant.findUnique({
              where: { id: item.variantId }
            });

            if (variant) {
              const newQty = variant.stockQuantity + item.quantity;
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: {
                  stockQuantity: newQty,
                  inStock: newQty > 0
                }
              });

              // Recalculate parent product inventory
              const productVariants = await tx.productVariant.findMany({
                where: { productId: item.productId }
              });
              const newTotalStock = productVariants.reduce((sum, v) => sum + v.stockQuantity, 0);

              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stockQuantity: newTotalStock,
                  totalStock: newTotalStock,
                  inStock: newTotalStock > 0
                }
              });
            }
          } else {
            // Restore base product inventory
            const product = await tx.product.findUnique({
              where: { id: item.productId }
            });

            if (product) {
              const newQty = product.stockQuantity + item.quantity;
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stockQuantity: newQty,
                  totalStock: newQty,
                  inStock: newQty > 0
                }
              });
            }
          }
        }
      }

      // Update order status fields
      return tx.order.update({
        where: { id },
        data: {
          status,
          paymentStatus
        }
      });
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: unknown) {
    console.error("Admin update order error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order" },
      { status: 500 }
    );
  }
}
