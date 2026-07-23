import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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
  city: string;
  district: string;
  province: string;
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

import { ensureOrderColumnsExist } from "@/lib/db-sync";

const SRI_LANKAN_PROVINCES = [
  "Western Province",
  "Central Province",
  "Southern Province",
  "Northern Province",
  "Eastern Province",
  "North Western Province",
  "North Central Province",
  "Uva Province",
  "Sabaragamuwa Province",
];

const VALID_PAYMENT_METHODS = ["COD", "BANK_TRANSFER"];
const VALID_DELIVERY_METHODS = ["STANDARD_COURIER", "COD"];

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
      items: CheckoutItemInput[];
    };

    const { customerInfo, deliveryAddress, deliveryMethod = "STANDARD_COURIER", paymentMethod = "COD", items } = body;

    // 1. Server-side validation of required input fields
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

    if (!deliveryAddress?.street?.trim()) {
      return NextResponse.json({ error: "Street Address / Village is required." }, { status: 400 });
    }
    if (!deliveryAddress?.city?.trim()) {
      return NextResponse.json({ error: "City / Town is required." }, { status: 400 });
    }
    if (!deliveryAddress?.district?.trim()) {
      return NextResponse.json({ error: "District is required." }, { status: 400 });
    }
    if (!deliveryAddress?.province?.trim()) {
      return NextResponse.json({ error: "Province is required." }, { status: 400 });
    }
    if (!SRI_LANKAN_PROVINCES.includes(deliveryAddress.province.trim())) {
      return NextResponse.json({ error: "Please select a valid Sri Lankan Province." }, { status: 400 });
    }
    if (!deliveryAddress?.postalCode?.trim()) {
      return NextResponse.json({ error: "Postal / ZIP Code is required." }, { status: 400 });
    }

    if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: "Please select a valid Payment Method." }, { status: 400 });
    }

    if (!deliveryMethod || !VALID_DELIVERY_METHODS.includes(deliveryMethod)) {
      return NextResponse.json({ error: "Please select a valid Delivery Method." }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your shopping cart is empty." }, { status: 400 });
    }

    // 2. Transactionally verify stock, recalculate totals, deduct stock, and create order
    const order = await prisma.$transaction(async (tx) => {
      // 2.1 Handle address entity for logged-in user if available
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
              state: deliveryAddress.province.trim(),
              postalCode: deliveryAddress.postalCode.trim(),
              country: deliveryAddress.country?.trim() || "Sri Lanka",
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
              state: deliveryAddress.province.trim(),
              postalCode: deliveryAddress.postalCode.trim(),
              country: deliveryAddress.country?.trim() || "Sri Lanka",
              isDefault: true,
            }
          });
          addressId = created.id;
        }
      }

      // 2.2 Verify stock & calculate server-side subtotal
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
          const newTotalStock = allVariants.reduce((sum, v) => sum + v.stockQuantity, 0);

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

      // Calculate server-side delivery fee ($4.99 or FREE for $50+)
      const deliveryFee = subtotal >= 50.0 ? 0 : 4.99;
      const finalTotalAmount = subtotal + deliveryFee;

      const orderNumber = await generateOrderNumber(tx);

      // 2.3 Save complete Order record
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
          city: deliveryAddress.city.trim(),
          district: deliveryAddress.district.trim(),
          province: deliveryAddress.province.trim(),
          postalCode: deliveryAddress.postalCode.trim(),
          country: deliveryAddress.country?.trim() || "Sri Lanka",
          deliveryNote: deliveryAddress.deliveryNote?.trim() || null,

          subtotal,
          discountAmount: 0,
          deliveryFee,
          totalAmount: finalTotalAmount,

          deliveryMethod,
          paymentMethod,
          status: "PENDING",
          paymentStatus: "PENDING",

          items: {
            create: orderItemsToCreate
          }
        }
      });

      // 2.4 Clear database cart if logged in
      if (userId) {
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
