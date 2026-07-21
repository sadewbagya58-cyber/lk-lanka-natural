import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const log: string[] = [];
  try {
    log.push('Starting Hostinger Production DB Backup and Demo Data Cleanup...');

    // 1. Create full JSON database backup
    const backupData = {
      timestamp: new Date().toISOString(),
      products: await prisma.product.findMany({ include: { images: true, variants: true } }),
      categories: await prisma.category.findMany({ include: { subCategories: true } }),
      brands: await prisma.brand.findMany(),
      reviews: await prisma.review.findMany({ include: { user: true } }),
      cartItems: await prisma.cartItem.findMany(),
      wishlistItems: await prisma.wishlistItem.findMany(),
    };

    const backupJson = JSON.stringify(backupData, null, 2);
    const backupFileName = `database_backup_${Date.now()}.json`;
    const backupFilePath = path.join(process.cwd(), 'public', backupFileName);

    await fs.writeFile(backupFilePath, backupJson, 'utf-8');
    log.push(`Backup successfully created at public/${backupFileName}`);

    // 2. Perform Transactional Deletion
    const deletedCounts = {
      products: 0,
      categories: 0,
      subCategories: 0,
      brands: 0,
      reviews: 0,
      images: 0,
      variants: 0,
      cartItems: 0,
      wishlistItems: 0,
      orderItems: 0,
    };

    await prisma.$transaction(async (tx) => {
      const allProducts = await tx.product.findMany({ select: { id: true } });
      const allProductIds = allProducts.map((p) => p.id);

      if (allProductIds.length > 0) {
        deletedCounts.cartItems = (await tx.cartItem.deleteMany()).count;
        deletedCounts.wishlistItems = (await tx.wishlistItem.deleteMany()).count;
        deletedCounts.orderItems = (await tx.orderItem.deleteMany()).count;
        deletedCounts.images = (await tx.productImage.deleteMany()).count;
        deletedCounts.variants = (await tx.productVariant.deleteMany()).count;
        deletedCounts.reviews = (await tx.review.deleteMany()).count;
        deletedCounts.products = (await tx.product.deleteMany()).count;
      }

      deletedCounts.subCategories = (await tx.subCategory.deleteMany()).count;
      deletedCounts.categories = (await tx.category.deleteMany()).count;
      deletedCounts.brands = (await tx.brand.deleteMany()).count;
    });

    log.push('Transactional deletion finished successfully.');

    const remProducts = await prisma.product.count();
    const remCategories = await prisma.category.count();
    const remBrands = await prisma.brand.count();
    const remReviews = await prisma.review.count();

    log.push(`Remaining DB counts: Products=${remProducts}, Categories=${remCategories}, Brands=${remBrands}, Reviews=${remReviews}`);

    return NextResponse.json({
      success: true,
      backupFile: `/${backupFileName}`,
      log,
      deletedCounts,
      remainingCounts: {
        products: remProducts,
        categories: remCategories,
        brands: remBrands,
        reviews: remReviews,
      },
    });
  } catch (err: unknown) {
    console.error('Cleanup API error:', err);
    return NextResponse.json(
      {
        success: false,
        log,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
