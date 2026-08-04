import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

// GET All Orders (for Admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Optional: Protect route for admin access
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

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
    const session = await getServerSession(authOptions);
    await connectToDatabase();
    
    const body = await request.json();
    const { customerDetails, items, totalAmount, paymentMethod } = body;

    // Handle both customerDetails object format and individual fields
    const fullName = customerDetails?.fullName || body.customerName;
    const phone = customerDetails?.phone || body.phone;
    const address = customerDetails?.address || body.address;
    const email = customerDetails?.email || body.email;
    const city = customerDetails?.city || body.city;

    if (!fullName || !phone || !address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order details" },
        { status: 400 }
      );
    }

    // Build the order payload
    const orderData: any = {
      customerDetails: {
        fullName,
        email,
        phone,
        address,
        city,
      },
      paymentMethod: paymentMethod || "Cash on Delivery",
      items,
      totalAmount,
      status: "Pending",
    };

    // Attach userId if user is authenticated
    if (session?.user) {
      orderData.userId = (session.user as any).id;
    }

    const newOrder = await Order.create(orderData);

    return NextResponse.json(
      { success: true, message: "Order placed successfully", orderId: newOrder._id, order: newOrder },
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

// PATCH Update Order Status (for Admin)
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