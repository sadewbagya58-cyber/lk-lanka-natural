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

    // 4. Ensure admin account (kllankanatural@gmail.com) exists with hashed password and ADMIN role
    try {
      const adminEmail = 'kllankanatural@gmail.com';
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

    try {
      const defaultSettings = [
        { key: 'companyAddress', value: 'No. 124, Galle Road, Colombo 03, Sri Lanka' },
        { key: 'phoneNumber', value: '+94 11 234 5678' },
        { key: 'supportEmail', value: 'kllankanatural@gmail.com' },
        { key: 'facebookUrl', value: 'https://facebook.com' },
        { key: 'instagramUrl', value: 'https://instagram.com' },
        { key: 'linkedinUrl', value: 'https://linkedin.com' },
        { key: 'newsletterTitle', value: 'Subscribe to our Newsletter' },
        { key: 'newsletterDescription', value: 'Get the latest updates on natural wellness, organic foods, and exclusive offers.' },
        { key: 'helpLink_trackOrder', value: '/track-order' },
        { key: 'helpLink_shippingPolicy', value: '/shipping-policy' },
        { key: 'helpLink_returnsRefunds', value: '/returns-refunds' },
        { key: 'helpLink_faq', value: '/faq' },
        { key: 'helpLink_helpCenter', value: '/contact' },
      ];

      for (const setting of defaultSettings) {
        const existing = await prisma.websiteSetting.findUnique({
          where: { key: setting.key }
        });
        if (!existing) {
          await prisma.websiteSetting.create({
            data: {
              key: setting.key,
              value: setting.value,
              updatedAt: new Date()
            }
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

    // 7. Seed default CMS page content
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
          subtitle: "Sri Lanka's premier destination for authentic natural wellness, exquisite perfumes, and handcrafted jewellery.",
          metaTitle: 'About Us | KL Lanka Natural',
          sections: [
            { heading: 'Who We Are', content: 'KL Lanka Natural (PVT) LTD was founded with a singular mission — to bring the purest natural products from Sri Lanka and around the world to your doorstep. We believe that wellness should be authentic, accessible, and rooted in nature.', sectionType: 'intro', sortOrder: 0 },
            { heading: 'Our Mission', content: 'To source and deliver the highest quality natural, organic, and Ayurvedic products to customers across Sri Lanka and beyond — ensuring authenticity, transparency, and exceptional customer care at every step.', sectionType: 'content', sortOrder: 1 },
            { heading: 'Our Vision', content: 'To become Sri Lanka\'s most trusted natural wellness marketplace, empowering every family to live healthier, more natural lives through access to premium certified products.', sectionType: 'content', sortOrder: 2 },
            { heading: 'Why Shop With Us', content: 'Every product we carry is carefully vetted for authenticity and quality. We partner directly with trusted suppliers and artisans to bring you the real thing — never imitations. Your trust is our most valuable asset.', sectionType: 'content', sortOrder: 3 },
            { heading: 'Our Core Values', content: 'Authenticity — We source only genuine, certified natural products.\n\nSustainability — We prioritize eco-friendly packaging and ethical supply chains.\n\nTransparency — Clear product information, honest pricing, and straightforward policies.\n\nCommunity — Supporting Sri Lankan artisans, farmers, and small producers.', sectionType: 'values', sortOrder: 4 },
            { heading: 'Ready to Experience Natural Wellness?', content: 'Browse our curated collection of natural products, premium perfumes, handcrafted jewellery, and custom artworks.', sectionType: 'cta', sortOrder: 5, metadata: '{"ctaText":"Shop Now","ctaLink":"/products"}' },
          ],
        },
        {
          slug: 'contact',
          title: 'Help Center',
          subtitle: "We're here to help. Reach out to our support team for assistance with your orders, products, or any questions.",
          metaTitle: 'Help Center | KL Lanka Natural',
          sections: [
            { heading: 'How to Reach Us', content: 'Send us a message using the contact form below and our team will respond as quickly as possible. We aim to respond to all inquiries within 1–2 business days.', sectionType: 'intro', sortOrder: 0 },
            { heading: 'Support Policy', content: 'We do not offer support over phone, WhatsApp, or third-party messengers. Please submit the contact form or send a direct email to kllankanatural@gmail.com for the fastest response.', sectionType: 'content', sortOrder: 1 },
          ],
        },
        {
          slug: 'shipping-policy',
          title: 'Shipping & Delivery Policy',
          subtitle: 'Delivery information for Sri Lanka and international orders.',
          metaTitle: 'Shipping & Delivery Policy | KL Lanka Natural',
          sections: [
            { heading: 'Delivery Within Sri Lanka', content: 'We offer standard island-wide courier delivery across all provinces and districts in Sri Lanka.\n\nStandard Delivery Fee: $4.99 USD\n\nFree Delivery: Orders exceeding a subtotal of $50.00 USD qualify for free standard courier delivery.\n\nDelivery Timelines: Courier partners typically deliver packages within 3 to 7 business days from dispatch.', sectionType: 'content', sortOrder: 0 },
            { heading: 'International Shipping', content: 'We provide international shipping options to select destinations. Because international courier weights, dimensions, and destinations vary widely, shipping costs are calculated on a case-by-case basis.\n\nUpon submitting your international order, our support team will calculate the shipping parameters and email you a verified shipping quote at kllankanatural@gmail.com.', sectionType: 'content', sortOrder: 1 },
            { heading: 'Custom Portrait Art Orders', content: 'Products under the Custom Portrait Art category represent bespoke artist services rather than pre-stocked inventory.\n\nBespoke Production: Creating custom portrait art requires separate design and painting periods. Delivery times will vary based on artist queues and complexities.\n\nSubmission Validation: Production begins only after a valid reference photo is uploaded during checkout.', sectionType: 'content', sortOrder: 2 },
            { heading: 'Order Processing', content: 'Standard orders are typically processed and packed within 1 to 2 business days (Monday to Friday, excluding public holidays). Once dispatched, courier hand-off triggers delivery tracking information where available.', sectionType: 'content', sortOrder: 3 },
            { heading: 'Delivery Address Accuracy', content: 'Customers are solely responsible for ensuring their delivery addresses and contact phone numbers are entered correctly.\n\nWe are not responsible for orders that fail to deliver due to incorrect, incomplete, or invalid address credentials entered at checkout. Address redirections post-dispatch may incur surcharge fees.', sectionType: 'content', sortOrder: 4 },
            { heading: 'Questions and Delivery Support', content: 'If your package experiences unforeseen delays, or if you need to modify delivery notes prior to shipment, please reach out to us at kllankanatural@gmail.com with your order number.', sectionType: 'content', sortOrder: 5 },
          ],
        },
        {
          slug: 'returns-refunds',
          title: 'Returns & Refunds Policy',
          subtitle: 'Our guidelines for returns, exchanges, and refunds.',
          metaTitle: 'Returns & Refunds Policy | KL Lanka Natural',
          sections: [
            { heading: 'Damaged, Defective, or Incorrect Products', content: 'If your order arrives damaged, defective, or if you receive the wrong item, please notify us immediately.\n\nNotification Period: Please report the issue within a reasonable period from the delivery date.\n\nRequired Evidence: You must email clear photos of the damaged or incorrect product, along with your order number.\n\nResolution: Upon verification, we will coordinate a replacement or issue an appropriate refund.', sectionType: 'content', sortOrder: 0 },
            { heading: 'Custom Portrait Art Orders', content: 'Because Custom Portrait Art items represent personalized, bespoke services painted specifically based on customer reference photos, they are subject to different terms:\n\nOnce work on your custom artwork has commenced or the illustration has been finalized, we cannot cancel or refund the order due to change of mind.\n\nIf the physical print, frame, or canvas arrives damaged during courier transport, please submit photographic evidence to our help desk for a complimentary replacement.', sectionType: 'content', sortOrder: 1 },
            { heading: 'Non-Returnable Items', content: 'Due to health, hygiene, and product safety regulations, certain types of items cannot be returned:\n\nOpened cosmetics, skin creams, essential wellness oils, or personal care products.\n\nHerbal nutrients or organic food items with broken security seals.\n\nClearance items or promotional gift purchases.', sectionType: 'content', sortOrder: 2 },
            { heading: 'Refund Process', content: 'Approved refunds are processed through the original method of payment or via bank transfer for Cash on Delivery orders. Please allow a standard processing window for the funds to reflect in your account.', sectionType: 'content', sortOrder: 3 },
            { heading: 'Contact Support', content: 'To initiate a return or verify your refund status, please send a message directly to our verified support inbox at kllankanatural@gmail.com with your order number and clear photos of the issue.', sectionType: 'content', sortOrder: 4 },
          ],
        },
        {
          slug: 'privacy-policy',
          title: 'Privacy Policy',
          subtitle: 'How we collect, use, and protect your personal information.',
          metaTitle: 'Privacy Policy | KL Lanka Natural',
          sections: [
            { heading: 'Information We Collect', content: 'We collect personal information necessary to fulfill your purchases, manage your customer account, and provide customer support. This includes:\n\nAccount details: Full Name, Email Address, and Password hash.\n\nDelivery coordinates: Delivery address (Street, City, District, Province, Postal Code, Country) and contact phone number.\n\nOrder history: Selected products, variant choices, payment status, and order totals.', sectionType: 'content', sortOrder: 0 },
            { heading: 'Custom Portrait Art Reference Images', content: 'For orders containing Custom Portrait Art, we collect the reference photo you upload during checkout.\n\nUploaded reference images are associated directly with your specific order.\n\nThese images are accessed solely by our design team and professional artists to create the custom portrait.\n\nWe protect uploaded files and do not publish or distribute your reference photos publicly without explicit consent.', sectionType: 'content', sortOrder: 1 },
            { heading: 'Payment Information Handling', content: 'We do not store raw card numbers, CVVs, or credit card PIN codes on our servers.\n\nWhile online card payments are currently in preparation, once activated, card transactions will be securely handled through third-party payment processors.', sectionType: 'content', sortOrder: 2 },
            { heading: 'Google Sign-In & Authentication', content: 'If you authenticate using Google Sign-In, we receive basic profile info (Name, Email Address, and Avatar URL) from Google. This data is used solely to construct your customer session and link your orders securely.', sectionType: 'content', sortOrder: 3 },
            { heading: 'Cookies and Local Storage', content: 'We utilize browser cookies and local storage to maintain your active shopping cart state, wishlist preferences, Buy Now selections, and authentication sessions. No tracking cookies are used.', sectionType: 'content', sortOrder: 4 },
            { heading: 'Privacy Questions and Requests', content: 'If you would like to request deletion of your account, details regarding your stored information, or have any other privacy-related concerns, please reach out to us at kllankanatural@gmail.com.', sectionType: 'content', sortOrder: 5 },
          ],
        },
        {
          slug: 'terms-of-service',
          title: 'Terms of Service',
          subtitle: 'The terms governing your use of the KL Lanka Natural (PVT) LTD website and services.',
          metaTitle: 'Terms of Service | KL Lanka Natural',
          sections: [
            { heading: 'Acceptance of Terms', content: 'By accessing, browsing, or purchasing from KL Lanka Natural (PVT) LTD, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the website.', sectionType: 'content', sortOrder: 0 },
            { heading: 'Website Usage', content: 'You represent that you are of legal age to form a binding contract and that all customer information you provide (delivery address, name, email) is accurate, current, and complete.', sectionType: 'content', sortOrder: 1 },
            { heading: 'Customer Accounts', content: 'When creating an account, you are responsible for maintaining the confidentiality of your login credentials and password. You agree to accept responsibility for all activities that occur under your account.', sectionType: 'content', sortOrder: 2 },
            { heading: 'Products, Pricing & Stock Availability', content: 'We describe natural products, ingredients, perfumes, and jewellery as accurately as possible. However, we do not guarantee that product descriptions are entirely error-free.\n\nPrices are displayed in USD and are subject to change. Delivery fees apply and are calculated during checkout.\n\nWe reserve the right to limit order quantities or cancel orders if items become out of stock.', sectionType: 'content', sortOrder: 3 },
            { heading: 'Payment Methods and Order Fulfillment', content: 'We support Cash on Delivery (COD) for eligible deliveries within Sri Lanka.\n\nOnline card payment architecture is integrated but is currently in preparation and temporarily unavailable until our merchant payment gateway is fully connected.', sectionType: 'content', sortOrder: 4 },
            { heading: 'Custom Portrait Art Uploads and Responsibilities', content: 'If you purchase a Custom Portrait Art item:\n\nYou must upload a reference photo. By uploading, you confirm that you own the copyrights or have permission to submit the photo.\n\nWe reserve the right to cancel and refund your custom order if the uploaded reference photo is deemed inappropriate or of insufficient quality for our artists.\n\nCustomized goods cannot be returned or cancelled once production has started, except in cases of shipping damage.', sectionType: 'content', sortOrder: 5 },
            { heading: 'Limitation of Liability', content: 'KL Lanka Natural (PVT) LTD and its directors are not liable for any indirect, incidental, or consequential damages arising from the purchase or use of any product, or from the inability to use this website.', sectionType: 'content', sortOrder: 6 },
            { heading: 'Support and Contact Details', content: 'For questions regarding these Terms of Service or to resolve any legal concerns, please write to us at kllankanatural@gmail.com.', sectionType: 'content', sortOrder: 7 },
          ],
        },
        {
          slug: 'track-order',
          title: 'Track Your Order',
          subtitle: 'Order tracking is currently in development. Contact us for a status update on your order.',
          metaTitle: 'Track Your Order | KL Lanka Natural',
          sections: [
            { heading: 'Order Tracking — Coming Soon', content: 'Real-time order tracking is currently being developed and will be available soon. In the meantime, you can check your order status by contacting our support team directly.', sectionType: 'content', sortOrder: 0 },
            { heading: 'How to Track Your Order', content: 'To get the current status of your order:\n\n1. Email us at kllankanatural@gmail.com\n2. Include your Order Number (format: KLN-XXXXXX) in the subject line\n3. Include the email address used at checkout\n\nOur team will respond with your current order status as quickly as possible.', sectionType: 'content', sortOrder: 1 },
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
        const existing = await prisma.cmsPage.findUnique({ where: { slug: pageData.slug } });
        if (!existing) {
          const created = await prisma.cmsPage.create({
            data: {
              slug: pageData.slug,
              title: pageData.title,
              subtitle: pageData.subtitle,
              metaTitle: pageData.metaTitle,
              status: 'PUBLISHED',
            },
          });
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
          { question: 'Do you deliver island-wide in Sri Lanka?', answer: 'Yes, we offer standard courier delivery across all provinces and districts in Sri Lanka. Standard delivery is $4.99 USD, with free delivery on orders over $50.', category: 'Delivery & Shipping', sortOrder: 0 },
          { question: 'Do you ship internationally?', answer: 'Yes, we ship to select international destinations. Shipping costs are calculated per-order based on weight and destination. You will receive a shipping quote via email after placing your order.', category: 'Delivery & Shipping', sortOrder: 1 },
          { question: 'How long does delivery take?', answer: 'Standard Sri Lanka deliveries typically arrive within 3 to 7 business days from dispatch. International delivery times vary by destination.', category: 'Delivery & Shipping', sortOrder: 2 },
          { question: 'What payment methods are available?', answer: 'Currently, Cash on Delivery (COD) is available for eligible Sri Lanka orders.', category: 'Payments', sortOrder: 0 },
          { question: 'Is online card payment available?', answer: 'Online card payment functionality is currently in preparation. We will announce when card payments become available.', category: 'Payments', sortOrder: 1 },
          { question: 'Is my payment information secure?', answer: 'We do not store any card numbers or payment credentials on our servers. All future card payment processing will be handled by certified third-party payment processors.', category: 'Payments', sortOrder: 2 },
          { question: 'How do I return a damaged or incorrect item?', answer: 'Email us at kllankanatural@gmail.com with your order number and clear photos of the damaged or incorrect item. Our team will arrange a replacement or refund.', category: 'Returns & Refunds', sortOrder: 0 },
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
