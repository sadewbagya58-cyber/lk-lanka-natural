import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== 'Lklankanatural2026_migrate_db_safe') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results: string[] = [];

    // Let's check columns on ProductVariant
    try {
      await prisma.$executeRawUnsafe(
        "ALTER TABLE `ProductVariant` ADD COLUMN `lowStockThreshold` INTEGER NOT NULL DEFAULT 5;"
      );
      results.push("Added lowStockThreshold column successfully.");
    } catch (e: unknown) {
      results.push(`lowStockThreshold addition skipped/failed: ${(e as Error).message}`);
    }

    try {
      await prisma.$executeRawUnsafe(
        "ALTER TABLE `ProductVariant` ADD COLUMN `imageUrl` VARCHAR(191) NULL;"
      );
      results.push("Added imageUrl column successfully.");
    } catch (e: unknown) {
      results.push(`imageUrl addition skipped/failed: ${(e as Error).message}`);
    }

    try {
      await prisma.$executeRawUnsafe(
        "ALTER TABLE `ProductVariant` ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;"
      );
      results.push("Added sortOrder column successfully.");
    } catch (e: unknown) {
      results.push(`sortOrder addition skipped/failed: ${(e as Error).message}`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
