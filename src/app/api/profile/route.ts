import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userSession = await getSessionUser();
    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userSession.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const defaultAddress = user.addresses[0] || null;

    return NextResponse.json({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address_street: defaultAddress?.street || "",
      address_city: defaultAddress?.city || "",
    });
  } catch (error: unknown) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userSession = await getSessionUser();
    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userSession.id;
    const { name, phone, address_street, address_city } = await request.json();

    // Update User Name and Phone
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone: phone || null,
      },
    });

    // Create or Update Address
    const defaultAddress = await prisma.address.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });

    if (defaultAddress) {
      await prisma.address.update({
        where: { id: defaultAddress.id },
        data: {
          phone: phone || "",
          street: address_street || "",
          city: address_city || "",
        },
      });
    } else {
      await prisma.address.create({
        data: {
          userId,
          name: "Default Address",
          phone: phone || "",
          street: address_street || "",
          city: address_city || "",
          isDefault: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Profile POST error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
