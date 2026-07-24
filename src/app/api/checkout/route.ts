import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensureOrderColumnsExist } from "@/lib/db-sync";
import { SRI_LANKA_PROVINCES } from "@/lib/countries";

interface CheckoutItemInput {
  productId: string;
  selectedVariantId: string | null;
  quantity: number;
}

interface CustomerInfoInput {
  fullName: string;
  email: string;
  phone: string;
  altPhone?: string;
}

interface DeliveryAddressInput {
  street: string;
  addressLine2?: string;
  city: string;
  district?: string;
  province?: string;
  state?: string;
  postalCode: string;
  country: string;
  deliveryNote?: string;
}

// Generate unique human-readable Order Number (e.g. KLN-2026-000001)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateOrderNumber(tx: any): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.order.count();
  const seq = String(count + 1).padStart(6, '0');
  const baseNumber = `KLN-${year}-${seq}`;

  const existing = await tx.order.findUnique({ where: { orderNumber: baseNumber } });
  if (!existing) return baseNumber;

  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KLN-${year}-${seq}-${randomSuffix}`;
}

import { paymentProvider } from "@/lib/payment/provider";

const VALID_PAYMENT_METHODS = ["COD", "CARD"];
const VALID_DELIVERY_METHODS = ["STANDARD_COURIER", "INTERNATIONAL_SHIPPING", "COD"];

export async function POST(request: Request) {
  try {
    // Ensure MariaDB database columns exist before executing queries
    await ensureOrderColumnsExist();

    const userSession = await getSessionUser();
    const userId = userSession?.id || null;

    const body = await request.json() as {
      customerInfo: CustomerInfoInput;
      deliveryAddress: DeliveryAddressInput;
      deliveryMethod?: string;
      paymentMethod?: string;
      isBuyNow?: boolean;
      items: CheckoutItemInput[];
    };

    const {
      customerInfo,
      deliveryAddress,
      deliveryMethod = "STANDARD_COURIER",
      paymentMethod = "COD",
      isBuyNow = false,
      items,
    } = body;

    // 1. Server-side validation of customer info
    if (!customerInfo?.fullName?.trim()) {
      return NextResponse.json({ error: "Full Name is required." }, { status: 400 });
    }
    if (!customerInfo?.email?.trim()) {
      return NextResponse.json({ error: "Email Address is required." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!customerInfo?.phone?.trim()) {
      return NextResponse.json({ error: "Phone Number is required." }, { status: 400 });
    }
    const phoneRegex = /^[\d\s+\-()]{7,20}$/;
    if (!phoneRegex.test(customerInfo.phone.trim())) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }

    // 2. Validate Country & Address fields
    const country = deliveryAddress?.country?.trim() || "Sri Lanka";
    const isSriLanka = country === "Sri Lanka";

    if (!deliveryAddress?.street?.trim()) {
      return NextResponse.json({
        error: isSriLanka ? "Address / Street / Village is required." : "Address Line 1 is required."
      }, { status: 400 });
    }

    if (!deliveryAddress?.city?.trim()) {
      return NextResponse.json({ error: "City / Town is required." }, { status: 400 });
    }

    if (isSriLanka) {
      if (!deliveryAddress?.district?.trim()) {
        return NextResponse.json({ error: "District is required for Sri Lankan orders." }, { status: 400 });
      }
      if (!deliveryAddress?.province?.trim()) {
        return NextResponse.json({ error: "Province is required for Sri Lankan orders." }, { status: 400 });
      }
      if (!(SRI_LANKA_PROVINCES as readonly string[]).includes(deliveryAddress.province.trim())) {
        return NextResponse.json({ error: "Please select a valid Sri Lankan Province." }, { status: 400 });
      }
    }

    if (!deliveryAddress?.postalCode?.trim()) {
      return NextResponse.json({ error: "Postal / ZIP Code is required." }, { status: 400 });
    }

    // 3. Payment Method validation
    if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: "Please select a valid Payment Method." }, { status: 400 });
    }

    if (!isSriLanka && paymentMethod === "COD") {
      return NextResponse.json({
        error: "Cash on Delivery (COD) is only available for orders within Sri Lanka."
      }, { status: 400 });
    }

    if (paymentMethod === "CARD" && !paymentProvider.isConfigured()) {
      return NextResponse.json({
        error: isSriLanka
          ? "Online card payments are currently unavailable. Please select Cash on Delivery."
          : "Online card payment is currently unavailable for international orders. Please check back soon."
      }, { status: 400 });
    }

    // 4. Delivery Method validation
    const effectiveDeliveryMethod = isSriLanka
      ? (deliveryMethod === "INTERNATIONAL_SHIPPING" ? "STANDARD_COURIER" : deliveryMethod)
      : "INTERNATIONAL_SHIPPING";

    if (!VALID_DELIVERY_METHODS.includes(effectiveDeliveryMethod)) {
      return NextResponse.json({ error: "Please select a valid Delivery Method." }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No products selected for checkout." }, { status: 400 });
    }

    // 5. Transactionally verify stock, recalculate totals, deduct stock, and create order
    const order = await prisma.$transaction(async (tx) => {
      // 5.1 Handle address entity for logged-in user if available
      let addressId: string | null = null;
      if (userId) {
        const existingDefault = await tx.address.findFirst({
          where: { userId, isDefault: true }
        });

        if (existingDefault) {
          const updated = await tx.address.update({
            where: { id: existingDefault.id },
            data: {
              phone: customerInfo.phone.trim(),
              street: deliveryAddress.street.trim(),
              city: deliveryAddress.city.trim(),
              state: isSriLanka ? deliveryAddress.province?.trim() : deliveryAddress.state?.trim() || null,
              postalCode: deliveryAddress.postalCode.trim(),
              country,
            }
          });
          addressId = updated.id;
        } else {
          const created = await tx.address.create({
            data: {
              userId,
              name: "Default Shipping Address",
              phone: customerInfo.phone.trim(),
              street: deliveryAddress.street.trim(),
              city: deliveryAddress.city.trim(),
              state: isSriLanka ? deliveryAddress.province?.trim() : deliveryAddress.state?.trim() || null,
              postalCode: deliveryAddress.postalCode.trim(),
              country,
              isDefault: true,
            }
          });
          addressId = created.id;
        }
      }

      // 5.2 Verify stock & calculate server-side subtotal
      let subtotal = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        if (!item.quantity || item.quantity <= 0) {
          throw new Error("Quantity must be greater than 0");
        }

        if (item.selectedVariantId) {
          // Variant stock validation
          const variant = await tx.productVariant.findUnique({
            where: { id: item.selectedVariantId },
            include: { product: true }
          });

          if (!variant || variant.productId !== item.productId) {
            throw new Error(`Selected option for product is no longer available.`);
          }

          if (variant.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for '${variant.product.name} (${variant.name})'. Available: ${variant.stockQuantity}, Requested: ${item.quantity}`);
          }

          const unitPrice = variant.price;
          subtotal += unitPrice * item.quantity;

          orderItemsToCreate.push({
            productId: item.productId,
            variantId: item.selectedVariantId,
            productName: variant.product.name,
            variantName: variant.name,
            quantity: item.quantity,
            price: unitPrice
          });

          // Decrement variant inventory atomically
          await tx.productVariant.update({
            where: { id: item.selectedVariantId },
            data: {
              stockQuantity: { decrement: item.quantity },
              inStock: (variant.stockQuantity - item.quantity) > 0
            }
          });

          // Sync parent product overall stock quantity
          const allVariants = await tx.productVariant.findMany({
            where: { productId: item.productId }
          });
          const newTotalStock = allVariants.reduce((sum: number, v: { stockQuantity: number }) => sum + v.stockQuantity, 0);

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: newTotalStock,
              totalStock: newTotalStock,
              inStock: newTotalStock > 0
            }
          });

        } else {
          // Base product stock validation
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (!product) {
            throw new Error(`Product not found.`);
          }

          if (product.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for '${product.name}'. Available: ${product.stockQuantity}, Requested: ${item.quantity}`);
          }

          const unitPrice = product.price;
          subtotal += unitPrice * item.quantity;

          orderItemsToCreate.push({
            productId: item.productId,
            variantId: null,
            productName: product.name,
            variantName: null,
            quantity: item.quantity,
            price: unitPrice
          });

          // Decrement base product inventory atomically
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { decrement: item.quantity },
              totalStock: { decrement: item.quantity },
              inStock: (product.stockQuantity - item.quantity) > 0
            }
          });
        }
      }

      // Calculate delivery fee
      // For Sri Lanka: $4.99 or FREE for $50+
      // For International: $0.00 (quote pending confirmation)
      const deliveryFee = isSriLanka ? (subtotal >= 50.0 ? 0 : 4.99) : 0;
      const finalTotalAmount = subtotal + deliveryFee;

      const orderNumber = await generateOrderNumber(tx);

      // 5.3 Save complete Order record
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          customerName: customerInfo.fullName.trim(),
          customerEmail: customerInfo.email.trim().toLowerCase(),
          customerPhone: customerInfo.phone.trim(),
          altPhone: customerInfo.altPhone?.trim() || null,

          street: deliveryAddress.street.trim(),
          addressLine2: deliveryAddress.addressLine2?.trim() || null,
          city: deliveryAddress.city.trim(),
          district: isSriLanka ? (deliveryAddress.district?.trim() || null) : null,
          province: isSriLanka ? (deliveryAddress.province?.trim() || null) : null,
          state: !isSriLanka ? (deliveryAddress.state?.trim() || null) : null,
          postalCode: deliveryAddress.postalCode.trim(),
          country,
          deliveryNote: deliveryAddress.deliveryNote?.trim() || null,

          subtotal,
          discountAmount: 0,
          deliveryFee,
          totalAmount: finalTotalAmount,

          deliveryMethod: effectiveDeliveryMethod,
          paymentMethod,
          status: "PENDING",
          paymentStatus: "PENDING",

          items: {
            create: orderItemsToCreate
          }
        }
      });

      // 5.4 Clear database cart ONLY if this is a standard cart checkout (not Buy Now)
      if (userId && !isBuyNow) {
        await tx.cartItem.deleteMany({
          where: { userId }
        });
      }

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber
    });
  } catch (error: unknown) {
    console.error("Checkout submission API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to place order. Please try again." },
      { status: 400 }
    );
  }
}
