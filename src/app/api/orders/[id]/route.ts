import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongodb"

import Order from "@/models/Order"
import Product from "@/models/Product"
import Notification from "@/models/Notification"

import mongoose from "mongoose"

// =====================================================
// PUT - UPDATE ORDER STATUS
// ADMIN ONLY
// =====================================================

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  try {
    // -------------------------------------------------
    // Authentication
    // -------------------------------------------------

    const session = await auth()

    if (
      !session?.user ||
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 403,
        }
      )
    }

    // -------------------------------------------------
    // Get order ID
    // -------------------------------------------------

    const { id } = await params

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          error: "Invalid order ID",
        },
        {
          status: 400,
        }
      )
    }

    // -------------------------------------------------
    // Get request body
    // -------------------------------------------------

    const body = await req.json()

    const { status } = body

    // IMPORTANT:
    // Must match Order.ts enum
    const allowedStatuses = [
      "pending",
      "processing",
      "delivered",
      "cancelled",
    ]

    if (
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid order status",
        },
        {
          status: 400,
        }
      )
    }

    await connectDB()

    // -------------------------------------------------
    // Find existing order
    // -------------------------------------------------

    const existingOrder =
      await Order.findById(id)

    if (!existingOrder) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        }
      )
    }

    // -------------------------------------------------
    // Cancelled orders are final
    // -------------------------------------------------

    if (
      existingOrder.status ===
        "cancelled" &&
      status !== "cancelled"
    ) {
      return NextResponse.json(
        {
          error:
            "Cancelled orders cannot be changed to another status.",
        },
        {
          status: 400,
        }
      )
    }

    // -------------------------------------------------
    // Nothing changed
    // -------------------------------------------------

    if (
      existingOrder.status === status
    ) {
      const order =
        await Order.findById(id)
          .populate(
            "user",
            "_id name email"
          )
          .populate(
            "items.product",
            "name images stock"
          )

      return NextResponse.json({
        message:
          "Order status is already set to this value.",

        order,
      })
    }

    // -------------------------------------------------
    // If cancelling:
    // return products to stock
    // -------------------------------------------------

    if (
      status === "cancelled" &&
      existingOrder.status !==
        "cancelled"
    ) {
      for (const item of
        existingOrder.items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: item.quantity,
            },
          }
        )
      }

      // Payment status can remain pending
      // for COD. For card orders, the actual
      // refund should be handled by Stripe.
    }

    // -------------------------------------------------
    // Update order
    // -------------------------------------------------

    const order =
      await Order.findByIdAndUpdate(
        id,
        {
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "user",
          "_id name email"
        )
        .populate(
          "items.product",
          "name images stock"
        )

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        }
      )
    }

    // -------------------------------------------------
    // Customer notification
    // -------------------------------------------------

    try {
      const userId =
        typeof order.user ===
        "object"
          ? (order.user as any)._id
          : order.user

      await Notification.create({
        user: userId,

        title:
          "Order Status Updated",

        message:
          `Your order #${order._id
            .toString()
            .slice(-6)} is now ${status}.`,

        type: "order",

        link: "/orders",
      })
    } catch (notificationError) {
      console.error(
        "Order status notification error:",
        notificationError
      )
    }

    return NextResponse.json({
      message:
        "Order status updated successfully",

      order,
    })
  } catch (error) {
    console.error(
      "Update order error:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to update order",
      },
      {
        status: 500,
      }
    )
  }
}

// =====================================================
// DELETE CANCELLED ORDER
// ADMIN ONLY
// =====================================================

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  try {
    // -------------------------------------------------
    // Authentication
    // -------------------------------------------------

    const session = await auth()

    if (
      !session?.user ||
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 403,
        }
      )
    }

    // -------------------------------------------------
    // Get ID
    // -------------------------------------------------

    const { id } = await params

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          error: "Invalid order ID",
        },
        {
          status: 400,
        }
      )
    }

    await connectDB()

    // -------------------------------------------------
    // Find order
    // -------------------------------------------------

    const order =
      await Order.findById(id)

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        }
      )
    }

    // -------------------------------------------------
    // Only cancelled orders can be deleted
    // -------------------------------------------------

    if (
      order.status !== "cancelled"
    ) {
      return NextResponse.json(
        {
          error:
            "Only cancelled orders can be deleted.",
        },
        {
          status: 400,
        }
      )
    }

    // -------------------------------------------------
    // Delete
    // -------------------------------------------------

    await Order.findByIdAndDelete(id)

    return NextResponse.json({
      message:
        "Cancelled order deleted successfully",
    })
  } catch (error) {
    console.error(
      "Delete order error:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to delete order",
      },
      {
        status: 500,
      }
    )
  }
}