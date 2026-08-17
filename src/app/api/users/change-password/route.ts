import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Please provide valid passwords" },
        { status: 400 }
      )
    }

    await connectDB()
    
    const user = await User.findById(session.user.id).select("+password")
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword
    await user.save()

    return NextResponse.json(
      { message: "Password changed successfully" }
    )
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}