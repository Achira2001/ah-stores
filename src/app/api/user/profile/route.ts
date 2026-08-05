import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

// GET User Profile & Order History
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const userId = (session.user as any).id;

    // Fetch User Profile
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch User Orders
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        user,
        orders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load profile data" },
      { status: 500 }
    );
  }
}

// PUT Update User Shipping & Profile Details
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const body = await request.json();

    const { name, phone, address, city, postalCode } = body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, address, city, postalCode },
      { new: true }
    ).select("-password");

    return NextResponse.json(
      { success: true, message: "Profile updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}