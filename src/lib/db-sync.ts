import { prisma } from './prisma';
import bcrypt from 'bcrypt';

let isSynced = false;
let syncPromise: Promise<void> | null = null;

/**
 * Safely ensures that all required columns in Order and OrderItem tables exist
 * in the current MariaDB database without dropping tables or deleting existing data.
 */
export async function ensureOrderColumnsExist(): Promise<void> {
  if (isSynced) return;
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
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
      "ALTER TABLE `OrderItem` ADD COLUMN IF NOT EXISTS `productImage` VARCHAR(191) NULL",
      "ALTER TABLE `OrderItem` ADD COLUMN IF NOT EXISTS `customUploadImage` VARCHAR(191) NULL",
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
      "ALTER TABLE `Product` ADD COLUMN IF NOT EXISTS `isFreeDelivery` TINYINT(1) NOT NULL DEFAULT 0",
      "ALTER TABLE `Product` ADD COLUMN IF NOT EXISTS `moq` INT NOT NULL DEFAULT 1",
      "ALTER TABLE `Product` ADD COLUMN IF NOT EXISTS `seoTags` TEXT NULL",
      "ALTER TABLE `Product` ADD COLUMN IF NOT EXISTS `seoKeywords` TEXT NULL",
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

    // 4. Ensure admin account (kllanka234@gmail.com) exists with hashed password and ADMIN role
    try {
      const adminEmail = 'kllanka234@gmail.com';
      const existingAdmin = await prisma.user.findFirst({
        where: { email: adminEmail }
      });

      const hashedPassword = await bcrypt.hash('kllankanatural2026', 12);

      if (!existingAdmin) {
        await prisma.user.create({
          data: {
            email: adminEmail,
            name: 'KL Lanka Admin',
            password: hashedPassword,
            role: 'ADMIN'
          }
        });
      } else {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            password: hashedPassword,
            role: 'ADMIN'
          }
        });
      }
    } catch (adminErr) {
      console.warn('Admin user seed notice:', (adminErr as Error).message);
    }

    // 5. Ensure WebsiteSetting table exists and seed defaults
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`WebsiteSetting\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`key\` VARCHAR(191) NOT NULL,
          \`value\` TEXT NOT NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL,
          PRIMARY KEY (\`id\`),
          UNIQUE INDEX \`WebsiteSetting_key_key\` (\`key\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
    } catch (err) {
      console.warn('DB Sync WebsiteSetting table notice:', (err as Error).message);
    }

    // Ensure Review table exists
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`Review\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`userId\` VARCHAR(191) NOT NULL,
          \`productId\` VARCHAR(191) NOT NULL,
          \`rating\` INT NOT NULL,
          \`title\` VARCHAR(191) NULL,
          \`comment\` TEXT NOT NULL,
          \`verified\` TINYINT(1) NOT NULL DEFAULT 0,
          \`status\` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE,
          FOREIGN KEY (\`productId\`) REFERENCES \`Product\`(\`id\`) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      // Run alter column just in case the table existed before
      await prisma.$executeRawUnsafe(
        "ALTER TABLE `Review` ADD COLUMN IF NOT EXISTS `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING'"
      );
    } catch (err) {
      console.warn('DB Sync Review table notice:', (err as Error).message);
    }

    try {
      const defaultSettings = [
        { key: 'companyAddress', value: '97/15H, Avissawella Road, Wellampitiya, Sri Lanka' },
        { key: 'phoneNumber', value: '0757726363' },
        { key: 'supportEmail', value: 'kllanka234@gmail.com' },
        { key: 'facebookUrl', value: 'https://facebook.com' },
        { key: 'instagramUrl', value: 'https://instagram.com' },
        { key: 'linkedinUrl', value: 'https://linkedin.com' },
        { key: 'newsletterTitle', value: 'Subscribe to our Newsletter' },
        { key: 'newsletterDescription', value: 'Get the latest updates on products and exclusive offers.' },
        { key: 'helpLink_trackOrder', value: '/track-order' },
        { key: 'helpLink_shippingPolicy', value: '/shipping-policy' },
        { key: 'helpLink_returnsRefunds', value: '/returns-refunds' },
        { key: 'helpLink_faq', value: '/faq' },
        { key: 'helpLink_helpCenter', value: '/contact' },
        { key: 'deliveryCost', value: '1.50' },
        { key: 'internationalDeliveryCost', value: '22.30' },
      ];

      for (const setting of defaultSettings) {
        // Create default if missing, preserving any existing admin settings
        const existingSetting = await prisma.websiteSetting.findUnique({ where: { key: setting.key } });
        if (!existingSetting) {
          await prisma.websiteSetting.create({
            data: { key: setting.key, value: setting.value }
          });
        }
      }
    } catch (err) {
      console.warn('WebsiteSetting seed notice:', (err as Error).message);
    }

    // 6. Ensure CMS tables exist
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`CmsPage\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`slug\` VARCHAR(191) NOT NULL,
          \`title\` VARCHAR(191) NOT NULL,
          \`subtitle\` TEXT NULL,
          \`metaTitle\` VARCHAR(191) NULL,
          \`status\` VARCHAR(191) NOT NULL DEFAULT 'PUBLISHED',
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          UNIQUE INDEX \`CmsPage_slug_key\` (\`slug\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
    } catch (err) {
      console.warn('DB Sync CmsPage table notice:', (err as Error).message);
    }
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`CmsSection\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`pageId\` VARCHAR(191) NOT NULL,
          \`heading\` VARCHAR(191) NULL,
          \`content\` TEXT NOT NULL,
          \`sectionType\` VARCHAR(191) NOT NULL DEFAULT 'content',
          \`sortOrder\` INT NOT NULL DEFAULT 0,
          \`isVisible\` TINYINT(1) NOT NULL DEFAULT 1,
          \`metadata\` TEXT NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          INDEX \`CmsSection_pageId_idx\` (\`pageId\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
    } catch (err) {
      console.warn('DB Sync CmsSection table notice:', (err as Error).message);
    }
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`FaqItem\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`question\` TEXT NOT NULL,
          \`answer\` TEXT NOT NULL,
          \`category\` VARCHAR(191) NOT NULL DEFAULT 'General',
          \`sortOrder\` INT NOT NULL DEFAULT 0,
          \`isVisible\` TINYINT(1) NOT NULL DEFAULT 1,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
    } catch (err) {
      console.warn('DB Sync FaqItem table notice:', (err as Error).message);
    }

    // Ensure UploadedFile table exists
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`UploadedFile\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`filename\` VARCHAR(191) NOT NULL,
          \`mimeType\` VARCHAR(191) NOT NULL,
          \`data\` LONGBLOB NOT NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          UNIQUE INDEX \`UploadedFile_filename_key\` (\`filename\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
    } catch (err) {
      console.warn('DB Sync UploadedFile table notice:', (err as Error).message);
    }

    // 7. Seed/Sync default CMS page content
    try {
      const cmsDefaults: Array<{
        slug: string;
        title: string;
        subtitle: string;
        metaTitle: string;
        sections: Array<{ heading: string; content: string; sectionType: string; sortOrder: number; metadata?: string }>;
      }> = [
        {
          slug: 'about',
          title: 'About Us',
          subtitle: "KL Lanka Natural is a leading multi-category online marketplace offering supplements, hardware, electronics, food, jewellery, fancy items, stationery, and other general products.",
          metaTitle: 'About Us | KL Lanka Natural',
          sections: [
            { heading: 'Who We Are', content: 'KL Lanka Natural was founded to bring a premium, multi-category shopping experience directly to you. We offer a wide range of products including health supplements, hardware tools, electronics, food items, jewellery, stationery, and other general products.', sectionType: 'intro', sortOrder: 0 },
            { heading: 'Our Mission', content: 'To source and deliver high-quality products from multiple categories to customers across Sri Lanka, Europe, and internationally — ensuring authenticity, transparency, and exceptional customer care at every step.', sectionType: 'content', sortOrder: 1 },
            { heading: 'Our Vision', content: 'To become a trusted global online marketplace, connecting customers with premium products from multiple diverse categories.', sectionType: 'content', sortOrder: 2 },
            { heading: 'Why Shop With Us', content: 'Every product on our platform is carefully vetted for quality. We work with trusted partners to bring you genuine products and reliable services. Your satisfaction is our priority.', sectionType: 'content', sortOrder: 3 },
            { heading: 'Our Core Values', content: 'Authenticity — Sourcing genuine products.\n\nGlobal Delivery — Efficient shipping to Sri Lanka, Europe, and worldwide.\n\nCustomer Support — Dedicated service via email and phone.\n\nDiversity — A wide range of categories under one platform.', sectionType: 'values', sortOrder: 4 },
            { heading: 'Ready to Experience Our Marketplace?', content: 'Browse our curated collection of supplements, hardware, electronics, food, jewellery, fancy items, stationery, and other general products.', sectionType: 'cta', sortOrder: 5, metadata: '{"ctaText":"Shop Now","ctaLink":"/products"}' },
          ],
        },
        {
          slug: 'contact',
          title: 'Help Center',
          subtitle: "We're here to help. Reach out to our support team for assistance with your orders, products, or any questions.",
          metaTitle: 'Help Center | KL Lanka Natural',
          sections: [
            { heading: 'How to Reach Us', content: 'Reach out to us via our official support email kllanka234@gmail.com or call us at 0757726363. Our team is available to assist you with order status, returns, or product inquiries.', sectionType: 'intro', sortOrder: 0 },
            { heading: 'Support Channels', content: 'For the fastest assistance, please email us directly at kllanka234@gmail.com or submit the contact form on this page.', sectionType: 'content', sortOrder: 1 },
          ],
        },
        {
          slug: 'shipping-policy',
          title: 'Shipping & Delivery Policy',
          subtitle: 'Delivery charges and shipping guidelines for Sri Lanka and international orders.',
          metaTitle: 'Shipping & Delivery Policy | KL Lanka Natural',
          sections: [
            { heading: 'Delivery Within Sri Lanka', content: 'We offer standard island-wide courier delivery across all provinces and districts in Sri Lanka.\n\nEstimated Delivery Charge: $1.20 - $2.10 (calculated at checkout based on your address).\n\nDelivery Timelines: Courier partners typically deliver packages within 2 to 4 business days.', sectionType: 'content', sortOrder: 0 },
            { heading: 'International & European Shipping', content: 'We provide fast international shipping to Europe and worldwide destinations.\n\nInternational Delivery Charge: $22.30 per KG.\n\nShipping costs are calculated automatically at checkout based on the total quantity of your order (assuming a standard weight approximation of 1 KG per item).', sectionType: 'content', sortOrder: 1 },
            { heading: 'Payment Methods & Destination Rules', content: 'Sri Lanka: Cash on Delivery (COD) and Card Payment are both fully available.\n\nInternational / Europe: Card Payment is available. Cash on Delivery (COD) is NOT available.', sectionType: 'content', sortOrder: 2 },
            { heading: 'Order Processing', content: 'Standard orders are typically processed and packed within 1 to 2 business days (Monday to Friday, excluding public holidays). Once dispatched, courier hand-off triggers delivery tracking information where available.', sectionType: 'content', sortOrder: 3 },
            { heading: 'Delivery Address Accuracy', content: 'Customers are solely responsible for ensuring their delivery addresses and contact phone numbers are entered correctly. We are not responsible for orders that fail to deliver due to incorrect, incomplete, or invalid address credentials entered at checkout.', sectionType: 'content', sortOrder: 4 },
            { heading: 'Questions and Delivery Support', content: 'If your package experiences delays or you need to modify delivery details, please email us at kllanka234@gmail.com with your order number.', sectionType: 'content', sortOrder: 5 },
          ],
        },
        {
          slug: 'returns-refunds',
          title: 'Returns & Refunds Policy',
          subtitle: 'Our guidelines for returns, exchanges, and refunds.',
          metaTitle: 'Returns & Refunds Policy | KL Lanka Natural',
          sections: [
            { heading: 'Damaged or Incorrect Items', content: 'If your order arrives damaged, defective, or incorrect, please notify us immediately.\n\nNotification Period: Please report the issue within a reasonable period from the delivery date.\n\nRequired Details: Email kllanka234@gmail.com with your order number and clear photos of the damaged or incorrect product.\n\nResolution: Upon verification, we will coordinate a replacement or issue an appropriate refund.', sectionType: 'content', sortOrder: 0 },
            { heading: 'Custom Portrait Art Orders', content: 'Because Custom Portrait Art items represent personalized, bespoke services painted specifically based on customer reference photos, they are subject to different terms:\n\nOnce work on your custom artwork has commenced or the illustration has been finalized, we cannot cancel or refund the order due to change of mind.\n\nIf the physical print, frame, or canvas arrives damaged during courier transport, please submit photographic evidence to our help desk for a complimentary replacement.', sectionType: 'content', sortOrder: 1 },
            { heading: 'Refund Process', content: 'Approved refunds are processed through the original method of payment or via bank transfer for Cash on Delivery orders. Please allow a standard processing window for the funds to reflect in your account.', sectionType: 'content', sortOrder: 2 },
            { heading: 'Contact Support', content: 'To initiate a return or verify your refund status, please email us directly at kllanka234@gmail.com with your order number.', sectionType: 'content', sortOrder: 3 },
          ],
        },
        {
          slug: 'privacy-policy',
          title: 'Privacy Policy',
          subtitle: 'How we collect, use, and protect your personal information.',
          metaTitle: 'Privacy Policy | KL Lanka Natural',
          sections: [
            { heading: 'Information We Collect', content: 'We collect personal information necessary to fulfill your purchases, manage your customer account, and provide customer support. This includes:\n\n- Account Information: Full Name, Email Address, and Password hash.\n\n- Contact & Shipping Information: Street address, City, District, Province, State, Postal/ZIP Code, Country, and contact phone number.\n\n- Order & Purchase Information: Selected products, variant choices, payment-related transaction status, and order totals.\n\n- Custom Portrait Art Reference Images: The reference photos uploaded by you during checkout to customize your bespoke items.', sectionType: 'content', sortOrder: 0 },
            { heading: 'Custom Portrait Art Reference Images', content: 'For orders containing Custom Portrait Art, we collect the reference photo you upload during checkout.\n\nUploaded reference images are associated directly with your specific order.\n\nThese images are accessed solely by our design team and professional artists to create the custom portrait.\n\nWe protect uploaded files and do not publish or distribute your reference photos publicly without explicit consent.', sectionType: 'content', sortOrder: 1 },
            { heading: 'Payment Information Security', content: 'We do not collect or store raw credit/debit card numbers, CVVs, or card PIN codes on our servers. All online card transactions are processed securely through certified payment gateways. No sensitive payment credentials are saved in our database.', sectionType: 'content', sortOrder: 2 },
            { heading: 'Google Sign-In & Authentication', content: 'If you authenticate using Google Sign-In, we receive basic profile info (Name, Email Address, and Avatar URL) from Google. This data is used solely to construct your customer session and link your orders securely.', sectionType: 'content', sortOrder: 3 },
            { heading: 'Cookies and Local Storage', content: 'We utilize browser cookies and local storage to maintain your active shopping cart state, wishlist preferences, Buy Now selections, and authentication sessions. No tracking cookies are used.', sectionType: 'content', sortOrder: 4 },
            { heading: 'Third-Party Providers & International Data Transfers', content: 'We engage trusted third-party service providers (such as shipping couriers and payment processors) to execute business operations. Since we serve international clients, especially in Europe, your information may be transmitted across borders to execute shipping, customs clearance, and delivery. All cross-border data handling complies with industry standard data protection guidelines.', sectionType: 'content', sortOrder: 5 },
            { heading: 'Data Retention & Privacy Rights', content: 'We retain account and transaction history for as long as necessary to comply with legal obligations, resolve disputes, and maintain customer history. You have the right to request access to your data, request correction of inaccurate records, or request deletion of your customer account by contacting us.', sectionType: 'content', sortOrder: 6 },
            { heading: 'Privacy Questions and Contact Information', content: 'For any privacy-related inquiries, requests, or concerns, please contact us at:\n\nEmail: kllanka234@gmail.com\nPhone: 0757726363\nAddress: 97/15H, Avissawella Road, Wellampitiya, Sri Lanka', sectionType: 'content', sortOrder: 7 },
          ],
        },
        {
          slug: 'terms-of-service',
          title: 'Terms of Service',
          subtitle: 'The terms governing your use of the KL Lanka Natural website and services.',
          metaTitle: 'Terms of Service | KL Lanka Natural',
          sections: [
            { heading: 'Acceptance of Terms', content: 'By accessing, browsing, or purchasing from KL Lanka Natural (kllankanatural.com), you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the website.', sectionType: 'content', sortOrder: 0 },
            { heading: 'Website Usage & Customer Accounts', content: 'You represent that you are of legal age to form a binding contract and that all customer information you provide (delivery address, name, email) is accurate, current, and complete. You are responsible for maintaining the confidentiality of your login credentials and password, and accept responsibility for all activities that occur under your account.', sectionType: 'content', sortOrder: 1 },
            { heading: 'Product Listings, Pricing & Stock Availability', content: 'We describe our products (including supplements, vitamins, Ayurvedic and herbal products, hardware, electronics, food, jewellery, fancy items, stationery, and other general merchandise) as accurately as possible. All product prices are displayed in USD ($). We reserve the right to modify prices or adjust item details without prior notice. Product availability is subject to stock levels.', sectionType: 'content', sortOrder: 2 },
            { heading: 'Minimum Order Quantity (MOQ) Rule', content: 'Certain products on our marketplace enforce a Minimum Order Quantity (MOQ) set individually by administrators. When purchasing these products, your starting quantity is automatically set to the MOQ, and you cannot decrease the order quantity below this minimum limit. The cart and checkout systems enforce this server-side.', sectionType: 'content', sortOrder: 3 },
            { heading: 'Allowed Payment Methods by Destination', content: 'We enforce strict payment rules based on the customer\'s delivery destination country:\n\n- Sri Lanka: Customers can pay using Cash on Delivery (COD) or Card Payment.\n\n- International / Europe: Customers must pay using Card Payment only. Cash on Delivery (COD) is NOT available for international orders.\n\nAll card payments are processed securely, and the payment status is treated as "Card Payment — Available" on our storefront.', sectionType: 'content', sortOrder: 4 },
            { heading: 'Delivery & Shipping Charges', content: 'Delivery charges are calculated based on your shipping address:\n\n- Sri Lanka: Standard delivery is charged at a flat rate of USD $1.50 (with an estimated delivery range of $1.20 - $2.10 shown for guidance).\n\n- International / Europe: Shipping is calculated at a rate of USD $22.30 per KG. Shipment weight is determined automatically based on items and quantities.\n\nCustomers are responsible for customs clearance and any import duties at the destination country. Shipping delays may occur due to customs or carrier issues.', sectionType: 'content', sortOrder: 5 },
            { heading: 'Returns, Refunds & Order Cancellations', content: 'Please report any damaged, incorrect, or defective items within a reasonable window from delivery. Send clear photographic evidence to kllanka234@gmail.com along with your order number. For Custom Portrait Art orders, since these are highly customized, bespoke items created to your specifications, orders cannot be cancelled or refunded once production has begun, except in the case of transit damage (where a replacement will be shipped).', sectionType: 'content', sortOrder: 6 },
            { heading: 'Custom Portrait Art Uploads and Responsibilities', content: 'If you purchase a Custom Portrait Art item:\n\nYou must upload a reference photo. By uploading, you confirm that you own the copyrights or have permission to submit the photo. We reserve the right to cancel and refund your custom order if the uploaded reference photo is deemed inappropriate or of insufficient quality for our artists. Customized goods cannot be returned or cancelled once production has started, except in cases of shipping damage.', sectionType: 'content', sortOrder: 7 },
            { heading: 'Limitation of Liability', content: 'KL Lanka Natural and its directors are not liable for any indirect, incidental, or consequential damages arising from the purchase or use of any product, or from the inability to use this website.', sectionType: 'content', sortOrder: 8 },
            { heading: 'Support and Contact Details', content: 'For questions regarding these Terms of Service or to resolve any legal concerns, please write to us at:\n\nEmail: kllanka234@gmail.com\nPhone: 0757726363\nAddress: 97/15H, Avissawella Road, Wellampitiya, Sri Lanka', sectionType: 'content', sortOrder: 9 },
          ],
        },
        {
          slug: 'track-order',
          title: 'Track Your Order',
          subtitle: 'Order tracking is currently in development. Contact us for a status update on your order.',
          metaTitle: 'Track Your Order | KL Lanka Natural',
          sections: [
            { heading: 'Order Tracking — Coming Soon', content: 'Real-time order tracking is currently being developed and will be available soon. In the meantime, you can check your order status by contacting our support team directly.', sectionType: 'content', sortOrder: 0 },
            { heading: 'How to Track Your Order', content: 'To get the current status of your order:\n\n1. Email us at kllanka234@gmail.com\n2. Include your Order Number (format: KLN-XXXXXX) in the subject line\n3. Include the email address used at checkout\n\nOur team will respond with your current order status as quickly as possible.', sectionType: 'content', sortOrder: 1 },
            { heading: 'Find Your Order Number', content: 'Your order number is in the format KLN-XXXXXX and can be found in:\n\nYour order confirmation email\nYour Account → My Orders section on this website', sectionType: 'content', sortOrder: 2 },
          ],
        },
        {
          slug: 'faq',
          title: 'Frequently Asked Questions',
          subtitle: 'Find answers to the most common questions about shopping, orders, payments, and more.',
          metaTitle: 'FAQ | KL Lanka Natural',
          sections: [],
        },
      ];

      for (const pageData of cmsDefaults) {
        const created = await prisma.cmsPage.upsert({
          where: { slug: pageData.slug },
          update: {
            title: pageData.title,
            subtitle: pageData.subtitle,
            metaTitle: pageData.metaTitle,
            status: 'PUBLISHED',
          },
          create: {
            slug: pageData.slug,
            title: pageData.title,
            subtitle: pageData.subtitle,
            metaTitle: pageData.metaTitle,
            status: 'PUBLISHED',
          },
        });

        // Delete old sections and recreate to ensure they stay synced
        await prisma.cmsSection.deleteMany({ where: { pageId: created.id } });
        for (const sec of pageData.sections) {
          await prisma.cmsSection.create({
            data: {
              pageId: created.id,
              heading: sec.heading,
              content: sec.content,
              sectionType: sec.sectionType,
              sortOrder: sec.sortOrder,
              isVisible: true,
              metadata: sec.metadata ?? null,
            },
          });
        }
      }
    } catch (err) {
      console.warn('CMS page seed notice:', (err as Error).message);
    }

    // 8. Seed default FAQ items
    try {
      const faqCount = await prisma.faqItem.count();
      if (faqCount === 0) {
        const faqDefaults = [
          { question: 'How do I place an order?', answer: 'Browse our products, add items to your cart, and proceed to checkout. For Custom Portrait Art, use the Buy Now button to purchase directly.', category: 'General Shopping', sortOrder: 0 },
          { question: 'Can I view my order history?', answer: 'Yes. Login to your account and visit My Orders to view all past orders, their current status, and full order details.', category: 'General Shopping', sortOrder: 1 },
          { question: 'How do I add products to my cart?', answer: 'Click the Add to Cart button on any product page. You can then view your cart anytime from the cart icon in the navigation bar.', category: 'General Shopping', sortOrder: 2 },
          { question: 'What is Buy Now?', answer: 'Buy Now lets you purchase a single item immediately without going through the regular cart checkout. It is required for Custom Portrait Art orders.', category: 'General Shopping', sortOrder: 3 },
          { question: 'What is Custom Portrait Art?', answer: 'Custom Portrait Art is our bespoke artwork service where our professional artists create a unique portrait based on your reference photo.', category: 'Custom Portrait Art', sortOrder: 0 },
          { question: 'How do I order Custom Portrait Art?', answer: 'Use the Buy Now button on a Custom Portrait Art product page. You will be prompted to upload your reference photo during checkout.', category: 'Custom Portrait Art', sortOrder: 1 },
          { question: 'Can I add Custom Portrait Art to my regular cart?', answer: 'No. Custom Portrait Art must be purchased using Buy Now to ensure your reference photo is correctly linked to your order.', category: 'Custom Portrait Art', sortOrder: 2 },
          { question: 'What types of photos should I upload?', answer: 'Upload clear, high-resolution photos with good lighting. The face and subject should be clearly visible. Avoid blurry or heavily filtered images.', category: 'Custom Portrait Art', sortOrder: 3 },
          { question: 'Are my uploaded reference photos kept private?', answer: 'Yes. Your uploaded reference photos are only accessed by our design team and professional artists. They are never shared publicly.', category: 'Custom Portrait Art', sortOrder: 4 },
          { question: 'Do you deliver island-wide in Sri Lanka?', answer: 'Yes, we offer standard courier delivery across all provinces and districts in Sri Lanka. Estimated delivery charge is $1.20 - $2.10.', category: 'Delivery & Shipping', sortOrder: 0 },
          { question: 'Do you ship internationally?', answer: 'Yes, we ship internationally and to European countries. Shipping costs are calculated at checkout at a rate of $22.30 per KG (approx. 1 KG per item).', category: 'Delivery & Shipping', sortOrder: 1 },
          { question: 'How long does delivery take?', answer: 'Standard Sri Lanka deliveries typically arrive within 2 to 4 business days from dispatch. International delivery times vary by destination.', category: 'Delivery & Shipping', sortOrder: 2 },
          { question: 'What payment methods are available?', answer: 'We support Cash on Delivery (for Sri Lanka orders only) and Card Payment (for all local and international orders).', category: 'Payments', sortOrder: 0 },
          { question: 'Is online card payment available?', answer: 'Yes, Online Card Payment is available and can be selected at checkout.', category: 'Payments', sortOrder: 1 },
          { question: 'Is my payment information secure?', answer: 'We do not store any card numbers or payment credentials on our servers. All card payment processing is securely handled by certified third-party payment processors.', category: 'Payments', sortOrder: 2 },
          { question: 'How do I return a damaged or incorrect item?', answer: 'Email us at kllanka234@gmail.com with your order number and clear photos of the damaged or incorrect item. Our team will arrange a replacement or refund.', category: 'Returns & Refunds', sortOrder: 0 },
          { question: 'Can I return a Custom Portrait Art order?', answer: 'Once work has commenced on your custom artwork, it cannot be returned or cancelled. However, if the physical product arrives damaged during shipping, we will arrange a complimentary replacement.', category: 'Returns & Refunds', sortOrder: 1 },
          { question: 'Are all products genuine and certified?', answer: 'Yes. We only source products from verified, trusted suppliers. All products are tested for authenticity and quality before being listed on our platform.', category: 'Product Quality', sortOrder: 0 },
        ];
        for (const item of faqDefaults) {
          await prisma.faqItem.create({ data: { ...item, isVisible: true } });
        }
      }
    } catch (err) {
      console.warn('FAQ seed notice:', (err as Error).message);
    }

    isSynced = true;
  } catch (error) {
    console.error('Failed to sync MariaDB schema:', error);
  } finally {
    syncPromise = null;
  }
  })();

  return syncPromise;
}
