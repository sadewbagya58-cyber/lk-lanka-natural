import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const brandSlug = searchParams.get("brand");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "relevance";

    const whereClause: Record<string, unknown> = {};

    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }

    if (brandSlug) {
      whereClause.brand = { slug: brandSlug };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };

    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        subCategory: true,
        brand: true,
        images: true,
        variants: true,
      },
      orderBy,
    });

    return NextResponse.json({ products });
  } catch (error: unknown) {
    console.error("Public products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
