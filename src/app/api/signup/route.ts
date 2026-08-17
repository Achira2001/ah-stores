import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { sendVerificationEmail } from "@/lib/mail"
import { generateToken } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, adminSecret } = await req.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please provide all required fields" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Admin verification
    if (role === "admin") {
      if (adminSecret !== process.env.ADMIN_SECRET_CODE) {
        return NextResponse.json(
          { error: "Invalid admin secret code" },
          { status: 403 }
        )
      }
    }

    await connectDB()

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = generateToken()
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
      verificationToken,
      verificationTokenExpiry,
      isVerified: false,
    })

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json(
      { 
        message: "Account created successfully. Please check your email to verify your account.",
        userId: user._id 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
