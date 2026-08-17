import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { sendPasswordResetEmail } from "@/lib/mail"
import { generateToken } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Please provide your email" },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email })

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json(
        { message: "If an account exists, a reset email has been sent." },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = generateToken()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.resetToken = resetToken
    user.resetTokenExpiry = resetTokenExpiry
    await user.save()

    // Send reset email
    await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json(
      { message: "If an account exists, a reset email has been sent." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}