import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureOrderColumnsExist } from "@/lib/db-sync";
import { verifyAdminSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    await ensureOrderColumnsExist();
    const auth = await verifyAdminSession();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query = searchParams.get("query");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (query) {
      whereClause.OR = [
        { id: { contains: query } },
        { orderNumber: { contains: query } },
        { customerName: { contains: query } },
        { customerEmail: { contains: query } },
        { customerPhone: { contains: query } },
        { user: { name: { contains: query } } },
        { user: { email: { contains: query } } },
        { address: { phone: { contains: query } } }
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
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
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    console.error("Admin fetch orders API error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
