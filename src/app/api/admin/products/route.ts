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
    const id = searchParams.get("id");

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          subCategory: true,
          brand: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      });

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json({ product });
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        subCategory: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
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
    await ensureOrderColumnsExist();

    const auth = await verifyAdminSession();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
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
      stockQuantity = 0,
      lowStockThreshold = 5,
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

    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json(
        { error: "Name, slug, price, and category are required" },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "Price must be a valid positive number" },
        { status: 400 }
      );
    }

    const parsedOriginalPrice = originalPrice && !isNaN(parseFloat(originalPrice)) ? parseFloat(originalPrice) : null;
    const parsedStock = Math.max(0, parseInt(stockQuantity) || 0);
    const parsedLowStock = Math.max(0, parseInt(lowStockThreshold) || 5);

    const hasVariants = Array.isArray(variants) && variants.length > 0;
    const finalStock = hasVariants
      ? (variants as Array<{ stockQuantity: number }>).reduce((sum, v) => sum + Math.max(0, parseInt(v.stockQuantity as unknown as string) || 0), 0)
      : parsedStock;
    const finalInStock = finalStock > 0;

    const finalBrandId = brandId && typeof brandId === 'string' && brandId.trim() !== '' ? brandId.trim() : null;
    const finalSubCategoryId = subCategoryId && typeof subCategoryId === 'string' && subCategoryId.trim() !== '' ? subCategoryId.trim() : null;

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
          inStock: finalInStock,
          stockQuantity: finalStock,
          lowStockThreshold: parsedLowStock,
          totalStock: finalStock,
          categoryId: categoryId.trim(),
          subCategoryId: finalSubCategoryId,
          brandId: finalBrandId,
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
            create: (variants as Array<{
              name: string;
              sku?: string;
              price: number;
              originalPrice?: number;
              stockQuantity: number;
              lowStockThreshold?: number;
              imageUrl?: string;
            }>).map(
              (v, index) => ({
                name: v.name,
                sku: v.sku || `sku-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                price: parseFloat(v.price as unknown as string),
                originalPrice: v.originalPrice ? parseFloat(v.originalPrice as unknown as string) : null,
                stockQuantity: Math.max(0, parseInt(v.stockQuantity as unknown as string) || 0),
                lowStockThreshold: v.lowStockThreshold !== undefined ? Math.max(0, parseInt(v.lowStockThreshold as unknown as string) || 0) : 5,
                imageUrl: v.imageUrl || null,
                sortOrder: index,
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
    const auth = await verifyAdminSession();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
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
      stockQuantity,
      lowStockThreshold,
      categoryId,
      subCategoryId,
      brandId,
      images,
      variants,
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

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "Price must be a valid positive number" },
        { status: 400 }
      );
    }
    const parsedOriginalPrice = originalPrice && !isNaN(parseFloat(originalPrice)) ? parseFloat(originalPrice) : null;
    const parsedStock = stockQuantity !== undefined ? Math.max(0, parseInt(stockQuantity) || 0) : 0;
    const parsedLowStock = lowStockThreshold !== undefined ? Math.max(0, parseInt(lowStockThreshold) || 5) : 5;

    const hasVariants = Array.isArray(variants) && variants.length > 0;
    const finalStock = hasVariants
      ? (variants as Array<{ stockQuantity: number }>).reduce((sum, v) => sum + Math.max(0, parseInt(v.stockQuantity as unknown as string) || 0), 0)
      : parsedStock;
    const finalInStock = finalStock > 0;

    const product = await prisma.$transaction(async (tx) => {
      // Sync Variants first if provided
      if (variants !== undefined && Array.isArray(variants)) {
        const existingDbVariants = await tx.productVariant.findMany({
          where: { productId: id },
        });

        const incomingVariants = variants as Array<{
          id?: string;
          name: string;
          sku?: string;
          price: number;
          originalPrice?: number;
          stockQuantity: number;
          lowStockThreshold?: number;
          imageUrl?: string;
          sortOrder?: number;
        }>;

        // Delete removed variants
        const incomingIds = incomingVariants.map(v => v.id).filter(Boolean) as string[];
        const idsToDelete = existingDbVariants
          .map(v => v.id)
          .filter(dbId => !incomingIds.includes(dbId));

        if (idsToDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        // Upsert remaining/new variants
        for (const [idx, v] of incomingVariants.entries()) {
          const finalSortOrder = v.sortOrder !== undefined ? v.sortOrder : idx;
          const finalLowStockThreshold = v.lowStockThreshold !== undefined ? Math.max(0, parseInt(v.lowStockThreshold as unknown as string) || 0) : 5;
          const finalPrice = parseFloat(v.price as unknown as string);
          const finalOriginalPrice = v.originalPrice && !isNaN(parseFloat(v.originalPrice as unknown as string)) ? parseFloat(v.originalPrice as unknown as string) : null;
          const finalStockQty = Math.max(0, parseInt(v.stockQuantity as unknown as string) || 0);

          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                name: v.name,
                sku: v.sku || `sku-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                price: isNaN(finalPrice) ? 0 : finalPrice,
                originalPrice: finalOriginalPrice,
                stockQuantity: finalStockQty,
                lowStockThreshold: finalLowStockThreshold,
                imageUrl: v.imageUrl || null,
                inStock: finalStockQty > 0,
                sortOrder: finalSortOrder,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                name: v.name,
                sku: v.sku || `sku-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                price: isNaN(finalPrice) ? 0 : finalPrice,
                originalPrice: finalOriginalPrice,
                stockQuantity: finalStockQty,
                lowStockThreshold: finalLowStockThreshold,
                imageUrl: v.imageUrl || null,
                inStock: finalStockQty > 0,
                sortOrder: finalSortOrder,
              },
            });
          }
        }
      }

      if (images !== undefined && Array.isArray(images)) {
        const existingDbImages = await tx.productImage.findMany({
          where: { productId: id },
        });

        const incomingImages = images as Array<{ id?: string; url: string; isPrimary?: boolean; sortOrder?: number }>;

        // Delete removed images
        const incomingIds = incomingImages.map(img => img.id).filter(Boolean) as string[];
        const idsToDelete = existingDbImages
          .map(img => img.id)
          .filter(dbId => !incomingIds.includes(dbId));

        if (idsToDelete.length > 0) {
          await tx.productImage.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        // Upsert remaining/new images
        for (const [idx, img] of incomingImages.entries()) {
          const finalSortOrder = img.sortOrder !== undefined ? img.sortOrder : idx;
          const finalIsPrimary = img.isPrimary !== undefined ? img.isPrimary : (idx === 0);

          if (img.id) {
            await tx.productImage.update({
              where: { id: img.id },
              data: {
                url: img.url,
                alt: name,
                isPrimary: finalIsPrimary,
                sortOrder: finalSortOrder,
              },
            });
          } else {
            await tx.productImage.create({
              data: {
                productId: id,
                url: img.url,
                alt: name,
                isPrimary: finalIsPrimary,
                sortOrder: finalSortOrder,
              },
            });
          }
        }
      }

      const updated = await tx.product.update({
        where: { id },
        data: {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: description || "",
          shortDescription: shortDescription || null,
          price: parsedPrice,
          originalPrice: parsedOriginalPrice,
          currency: currency || "USD",
          badge: badge || null,
          tags: tags || undefined,
          gradient: gradient || undefined,
          visualSeed: visualSeed || undefined,
          inStock: finalInStock,
          stockQuantity: finalStock,
          lowStockThreshold: parsedLowStock,
          totalStock: finalStock,
          categoryId: categoryId ? categoryId.trim() : undefined,
          subCategoryId: subCategoryId !== undefined ? (subCategoryId && typeof subCategoryId === 'string' && subCategoryId.trim() !== '' ? subCategoryId.trim() : null) : undefined,
          brandId: brandId !== undefined ? (brandId && typeof brandId === 'string' && brandId.trim() !== '' ? brandId.trim() : null) : undefined,
          isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
          isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : undefined,
          isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : undefined,
          isFlashDeal: isFlashDeal !== undefined ? Boolean(isFlashDeal) : undefined,
          flashDealEndsAt: flashDealEndsAt ? new Date(flashDealEndsAt) : null,
        },
        include: {
          category: true,
          brand: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      });

      return updated;
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
    const auth = await verifyAdminSession();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
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
