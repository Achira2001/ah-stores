import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

// GET All Orders (for Admin)
export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST Create Order (User Place Order)
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { customerName, phone, address, paymentMethod, items, totalAmount } = body;

    if (!customerName || !phone || !address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order details" },
        { status: 400 }
      );
    }

    const newOrder = await Order.create({
      customerName,
      phone,
      address,
      paymentMethod,
      items,
      totalAmount,
    });

    return NextResponse.json(
      { success: true, message: "Order placed successfully", order: newOrder },
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

// PATCH Update Order Status
export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID and Status are required" },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    return NextResponse.json(
      { success: true, message: "Order status updated", order: updatedOrder },
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