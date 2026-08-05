import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { sendOrderStatusEmail } from "@/lib/email"; // 👈 Integrated transactional email helper

// GET Orders (Supports Search, Filter, and Admin/User Scope)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const isAdmin = (session.user as any)?.role === "admin";
    const { searchParams } = new URL(request.url);

    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("search")?.trim();

    // Build Mongoose Query
    const query: Record<string, any> = {};

    // Restrict non-admins to their own orders
    if (!isAdmin) {
      query.userId = (session.user as any).id;
    }

    // Apply optional status filter
    if (statusFilter && statusFilter !== "All") {
      query.status = statusFilter;
    }

    // Apply optional text search (Name, Email, or Mongo ObjectId)
    if (searchQuery) {
      const searchConditions: Record<string, any>[] = [
        { "customerDetails.fullName": { $regex: searchQuery, $options: "i" } },
        { "customerDetails.email": { $regex: searchQuery, $options: "i" } },
        { customerName: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ];

      // If search query is a valid 24-char ObjectId, query by _id directly
      if (mongoose.Types.ObjectId.isValid(searchQuery)) {
        searchConditions.push({ _id: searchQuery });
      }

      query.$or = searchConditions;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, count: orders.length, data: orders },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST Create Order (Checkout)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    const body = await request.json();
    const { customerDetails, items, totalAmount, paymentMethod } = body;

    const fullName = customerDetails?.fullName || body.customerName;
    const phone = customerDetails?.phone || body.phone;
    const address = customerDetails?.address || body.address;
    const email = customerDetails?.email || body.email || session?.user?.email || "";
    const city = customerDetails?.city || body.city;

    if (!fullName || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order details or empty cart" },
        { status: 400 }
      );
    }

    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid total amount" },
        { status: 400 }
      );
    }

    const orderData: Record<string, any> = {
      customerDetails: {
        fullName,
        email,
        phone,
        address,
        city: city || "",
      },
      paymentMethod: paymentMethod || "Cash on Delivery",
      items,
      totalAmount,
      status: "Pending",
    };

    if (session?.user) {
      orderData.userId = (session.user as any).id;
    }

    const newOrder = await Order.create(orderData);

    // 🚀 Send initial Order Received confirmation email in background
    if (email) {
      sendOrderStatusEmail({
        toEmail: email,
        customerName: fullName,
        orderId: newOrder._id.toString(),
        status: "Processing", // Sends order receipt / processing confirmation
        totalAmount,
      }).catch((err) => console.error("Initial order email failed:", err));
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        orderId: newOrder._id,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to place order" },
      { status: 500 }
    );
  }
}

// PATCH Update Order Status (Admin Only + Triggers Email Notification)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { orderId, status } = await request.json();

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!orderId || !status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Valid Order ID and Status are required" },
        { status: 400 }
      );
    }

    // Fetch existing order to check prior status
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const previousStatus = existingOrder.status;

    // Update status in Database
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    // 🚀 Trigger Resend Email Notification when status actually changes
    if (previousStatus !== status) {
      const email =
        updatedOrder.customerDetails?.email || updatedOrder.email;
      const customerName =
        updatedOrder.customerDetails?.fullName ||
        updatedOrder.customerName ||
        "Valued Customer";

      if (email) {
        sendOrderStatusEmail({
          toEmail: email,
          customerName,
          orderId: updatedOrder._id.toString(),
          status: updatedOrder.status,
          totalAmount: updatedOrder.totalAmount,
        }).catch((err) => console.error("Status update email failed:", err));
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order status updated and customer notified",
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    );
  }
}