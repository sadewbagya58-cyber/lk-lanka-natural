import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function verifyAdmin() {
  return true;
}

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ brands });
  } catch (error: unknown) {
    console.error("Admin brands GET error:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { name, slug, logo, description } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        logoUrl: logo || null,
        description: description || null,
      }
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error: unknown) {
    console.error("Admin brands POST error:", error);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id, name, slug, logo, description } = await request.json();

    if (!id || !name || !slug) {
      return NextResponse.json({ error: "ID, name, and slug are required" }, { status: 400 });
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        logoUrl: logo || null,
        description: description || null,
      }
    });

    return NextResponse.json({ brand });
  } catch (error: unknown) {
    console.error("Admin brands PUT error:", error);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }

    await prisma.brand.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Admin brands DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
