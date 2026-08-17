import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Notification from "@/models/Notification"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const notifications = await Notification.find({
      user: session.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const unreadCount = await Notification.countDocuments({
      user: session.user.id,
      read: false,
    })

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Get notifications error:", error)

    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}