import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

interface CheckoutItemInput {
  productId: string;
  selectedVariantId: string | null;
  quantity: number;
}

interface ShippingAddressInput {
  name: string;
  phone: string;
  street: string;
  city: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { shippingAddress, paymentMethod, items } = await request.json() as {
      shippingAddress: ShippingAddressInput;
      paymentMethod: string;
      items: CheckoutItemInput[];
    };

    if (!shippingAddress || !paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid checkout request data" }, { status: 400 });
    }

    // 1. Transactionally place the order and update inventory
    const order = await prisma.$transaction(async (tx) => {
      // 1.1 Create or Update the shipping Address
      // Find default address or create one
      const defaultAddress = await tx.address.findFirst({
        where: { userId, isDefault: true }
      });

      let addressId = "";
      if (defaultAddress) {
        // Update the default address to match checkout shipping address details
        const updatedAddress = await tx.address.update({
          where: { id: defaultAddress.id },
          data: {
            phone: shippingAddress.phone || "",
            street: shippingAddress.street || "",
            city: shippingAddress.city || "",
          }
        });
        addressId = updatedAddress.id;
      } else {
        // Create new default address
        const newAddress = await tx.address.create({
          data: {
            userId,
            name: "Default Address",
            phone: shippingAddress.phone || "",
            street: shippingAddress.street || "",
            city: shippingAddress.city || "",
            country: "LK",
            isDefault: true,
          }
        });
        addressId = newAddress.id;
      }

      // 1.2 Validate items stock and calculate pricing
      let totalAmount = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        if (item.quantity <= 0) {
          throw new Error("Quantity must be a positive integer");
        }

        if (item.selectedVariantId) {
          // Validate variant stock
          const variant = await tx.productVariant.findUnique({
            where: { id: item.selectedVariantId },
            include: { product: true }
          });

          if (!variant || variant.productId !== item.productId) {
            throw new Error(`Product variant not found: ${item.selectedVariantId}`);
          }

          if (variant.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for option '${variant.name}' of product '${variant.product.name}'. Available: ${variant.stockQuantity}, requested: ${item.quantity}`);
          }

          const unitPrice = variant.price;
          totalAmount += unitPrice * item.quantity;

          orderItemsToCreate.push({
            productId: item.productId,
            variantId: item.selectedVariantId,
            quantity: item.quantity,
            price: unitPrice
          });

          // Decrement variant stock
          await tx.productVariant.update({
            where: { id: item.selectedVariantId },
            data: {
              stockQuantity: { decrement: item.quantity },
              inStock: (variant.stockQuantity - item.quantity) > 0
            }
          });

          // Sync product level stock
          const productVariants = await tx.productVariant.findMany({
            where: { productId: item.productId }
          });
          const newTotalStock = productVariants.reduce((sum, v) => sum + v.stockQuantity, 0);

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: newTotalStock,
              totalStock: newTotalStock,
              inStock: newTotalStock > 0
            }
          });

        } else {
          // Validate base product stock
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          if (product.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for product '${product.name}'. Available: ${product.stockQuantity}, requested: ${item.quantity}`);
          }

          const unitPrice = product.price;
          totalAmount += unitPrice * item.quantity;

          orderItemsToCreate.push({
            productId: item.productId,
            variantId: null,
            quantity: item.quantity,
            price: unitPrice
          });

          // Decrement base product stock
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

      // Add shipping cost if subtotal is below $50
      const shippingCost = totalAmount >= 50.0 ? 0 : 4.99;
      const finalTotalAmount = totalAmount + shippingCost;

      // 1.3 Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          totalAmount: finalTotalAmount,
          status: "PENDING",
          paymentMethod,
          paymentStatus: "PENDING",
          items: {
            create: orderItemsToCreate
          }
        }
      });

      // 1.4 Clear User's Database Cart
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: unknown) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to place order" },
      { status: 500 }
    );
  }
}
