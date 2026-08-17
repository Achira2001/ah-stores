import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

// GET all users (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectDB()
    
    const users = await User.find({})
      .select("-password -verificationToken -resetToken")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}