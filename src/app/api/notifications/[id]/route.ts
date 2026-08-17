import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Notification from "@/models/Notification"

// PUT - Mark notification as read
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    await connectDB()

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        user: session.user.id,
      },
      {
        read: true,
      },
      {
        new: true,
      }
    ).lean()

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Notification marked as read",
      notification,
    })
  } catch (error) {
    console.error("Mark notification as read error:", error)

    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    )
  }
}

// DELETE notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    await connectDB()

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: session.user.id,
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Notification deleted",
    })
  } catch (error) {
    console.error("Delete notification error:", error)

    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}