import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function verifyAdmin() {
  return true;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subCategory: true,
        brand: true,
        images: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ products });
  } catch (error: unknown) {
    console.error("Admin products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      originalPrice,
      currency = "USD",
      badge,
      tags,
      gradient,
      visualSeed,
      inStock = true,
      stockQuantity = 100,
      lowStockThreshold = 10,
      totalStock = 100,
      categoryId,
      subCategoryId,
      brandId,
      images = [],
      variants = [],
      isFeatured = false,
      isBestSeller = false,
      isNewArrival = false,
      isFlashDeal = false,
      flashDealEndsAt = null,
    } = await request.json();

    if (!name || !slug || !price || !categoryId || !brandId) {
      return NextResponse.json(
        { error: "Name, slug, price, categoryId, and brandId are required" },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(price);
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;
    const parsedStock = parseInt(stockQuantity) || 100;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: description || "",
          shortDescription: shortDescription || null,
          price: parsedPrice,
          originalPrice: parsedOriginalPrice,
          currency,
          badge: badge || null,
          tags: tags || "natural,premium",
          gradient: gradient || "from-emerald-500 to-teal-700",
          visualSeed: visualSeed || "bottle",
          inStock: Boolean(inStock),
          stockQuantity: parsedStock,
          lowStockThreshold: parseInt(lowStockThreshold) || 10,
          totalStock: parseInt(totalStock) || parsedStock,
          categoryId,
          subCategoryId: subCategoryId || null,
          brandId,
          isFeatured: Boolean(isFeatured),
          isBestSeller: Boolean(isBestSeller),
          isNewArrival: Boolean(isNewArrival),
          isFlashDeal: Boolean(isFlashDeal),
          flashDealEndsAt: flashDealEndsAt ? new Date(flashDealEndsAt) : null,
          images: {
            create: (images as Array<{ url: string; alt?: string; isPrimary?: boolean }>).map(
              (img, index) => ({
                url: img.url,
                alt: img.alt || name,
                isPrimary: index === 0 || Boolean(img.isPrimary),
                sortOrder: index + 1,
              })
            ),
          },
          variants: {
            create: (variants as Array<{ name: string; sku?: string; price?: number; stockQuantity?: number }>).map(
              (v) => ({
                name: v.name,
                sku: v.sku || null,
                price: v.price ? parseFloat(v.price as unknown as string) : parsedPrice,
                stockQuantity: v.stockQuantity ? parseInt(v.stockQuantity as unknown as string) : parsedStock,
              })
            ),
          },
        },
        include: {
          category: true,
          brand: true,
          images: true,
          variants: true,
        },
      });

      return created;
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    console.error("Admin products POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const {
      id,
      name,
      slug,
      description,
      shortDescription,
      price,
      originalPrice,
      currency,
      badge,
      tags,
      gradient,
      visualSeed,
      inStock,
      stockQuantity,
      lowStockThreshold,
      totalStock,
      categoryId,
      subCategoryId,
      brandId,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isFlashDeal,
      flashDealEndsAt,
    } = await request.json();

    if (!id || !name || !slug || !price) {
      return NextResponse.json(
        { error: "ID, name, slug, and price are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description || "",
        shortDescription: shortDescription || null,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        currency: currency || "USD",
        badge: badge || null,
        tags: tags || undefined,
        gradient: gradient || undefined,
        visualSeed: visualSeed || undefined,
        inStock: inStock !== undefined ? Boolean(inStock) : undefined,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : undefined,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : undefined,
        totalStock: totalStock !== undefined ? parseInt(totalStock) : undefined,
        categoryId: categoryId || undefined,
        subCategoryId: subCategoryId || null,
        brandId: brandId || undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : undefined,
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : undefined,
        isFlashDeal: isFlashDeal !== undefined ? Boolean(isFlashDeal) : undefined,
        flashDealEndsAt: flashDealEndsAt ? new Date(flashDealEndsAt) : null,
      },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ product });
  } catch (error: unknown) {
    console.error("Admin products PUT error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Admin products DELETE error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 500 }
    );
  }
}
