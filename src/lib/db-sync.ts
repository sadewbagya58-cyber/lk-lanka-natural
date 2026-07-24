import { prisma } from './prisma';

let isSynced = false;

/**
 * Safely ensures that all required columns in Order and OrderItem tables exist
 * in the current MariaDB database without dropping tables or deleting existing data.
 */
export async function ensureOrderColumnsExist(): Promise<void> {
  if (isSynced) return;

  try {
    // 1. Order table column additions
    const orderColumnQueries = [
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `orderNumber` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `customerName` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `customerEmail` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `customerPhone` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `altPhone` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `street` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `addressLine2` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `city` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `district` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `province` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `state` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `postalCode` VARCHAR(191) NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `country` VARCHAR(191) NOT NULL DEFAULT 'Sri Lanka'",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `deliveryNote` TEXT NULL",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `subtotal` DOUBLE NOT NULL DEFAULT 0",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `discountAmount` DOUBLE NOT NULL DEFAULT 0",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `deliveryFee` DOUBLE NOT NULL DEFAULT 0",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `deliveryMethod` VARCHAR(191) NOT NULL DEFAULT 'COD'",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'COD'",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING'",
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING'",
    ];

    for (const query of orderColumnQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
      } catch (err) {
        // Ignore column already exists errors
        console.warn('DB Sync column notice:', query, (err as Error).message);
      }
    }

    // Add unique index on orderNumber if missing
    try {
      await prisma.$executeRawUnsafe(
        "ALTER TABLE `Order` ADD UNIQUE INDEX `Order_orderNumber_key` (`orderNumber`)"
      );
    } catch {
      // Index already exists or duplicate values exist
    }

    // 2. OrderItem table column additions
    const itemColumnQueries = [
      "ALTER TABLE `OrderItem` ADD COLUMN IF NOT EXISTS `productName` VARCHAR(191) NULL",
      "ALTER TABLE `OrderItem` ADD COLUMN IF NOT EXISTS `variantName` VARCHAR(191) NULL",
    ];

    for (const query of itemColumnQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
      } catch (err) {
        console.warn('DB Sync item column notice:', query, (err as Error).message);
      }
    }

    // 3. Product & User table column modifications
    const productModifyQueries = [
      "ALTER TABLE `Product` MODIFY COLUMN `brandId` VARCHAR(191) NULL",
      "ALTER TABLE `Product` MODIFY COLUMN `subCategoryId` VARCHAR(191) NULL",
      "ALTER TABLE `User` ADD COLUMN IF NOT EXISTS `role` VARCHAR(191) NOT NULL DEFAULT 'USER'",
    ];

    for (const query of productModifyQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
      } catch (err) {
        console.warn('DB Sync product column notice:', query, (err as Error).message);
      }
    }

    // 3. Backfill orderNumber for legacy orders that have NULL orderNumber
    try {
      const unnumberedOrders = await prisma.$queryRawUnsafe<{ id: string }[]>(
        "SELECT id FROM `Order` WHERE `orderNumber` IS NULL OR `orderNumber` = '' LIMIT 100"
      );

      if (Array.isArray(unnumberedOrders) && unnumberedOrders.length > 0) {
        const currentYear = new Date().getFullYear();
        let idx = 1;
        for (const ord of unnumberedOrders) {
          const paddedSeq = String(idx).padStart(6, '0');
          const generatedNum = `KLN-${currentYear}-LEGACY-${paddedSeq}-${Math.floor(1000 + Math.random() * 9000)}`;
          try {
            await prisma.$executeRawUnsafe(
              "UPDATE `Order` SET `orderNumber` = ? WHERE `id` = ?",
              generatedNum,
              ord.id
            );
          } catch {
            // Ignore error if already updated
          }
          idx++;
        }
      }
    } catch (err) {
      console.warn('Legacy order backfill notice:', (err as Error).message);
    }

    isSynced = true;
  } catch (error) {
    console.error('Failed to sync MariaDB schema:', error);
  }
}
