import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/session";

export async function GET() {
  try {
    const auth = await verifyAdminSession();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ categories });
  } catch (error: unknown) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdminSession();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { name, slug, description, image, icon, colorClasses } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description || "",
        image: image || null,
        icon: icon || "Package",
        colorClasses: colorClasses || "bg-emerald-50 text-emerald-600 border-emerald-100",
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: unknown) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAdminSession();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id, name, slug, description, image, icon, colorClasses } = await request.json();

    if (!id || !name || !slug) {
      return NextResponse.json({ error: "ID, name, and slug are required" }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description || "",
        image: image || null,
        icon: icon || undefined,
        colorClasses: colorClasses || undefined,
      }
    });

    return NextResponse.json({ category });
  } catch (error: unknown) {
    console.error("Admin categories PUT error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdminSession();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Admin categories DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
