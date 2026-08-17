import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

// GET single user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      )
    }

    // Users can only view their own profile unless admin
    if (
      session.user.id !== id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    await connectDB()

    const user = await User.findById(id)
      .select("-password -verificationToken -resetToken -resetTokenExpiry -verificationTokenExpiry")
      .lean()

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Get user error:", error)

    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

// PUT update user
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      )
    }

    // Users can only update their own profile unless admin
    if (
      session.user.id !== id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await req.json()

    await connectDB()

    const user = await User.findByIdAndUpdate(
      id,
      {
        name: body.name,
        phone: body.phone,
        address: body.address,
        city: body.city,
        image: body.image,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(
      "-password -verificationToken -resetToken -resetTokenExpiry -verificationTokenExpiry"
    )

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user,
    })
  } catch (error: any) {
    console.error("Update user error:", error)

    return NextResponse.json(
      {
        error:
          error.message || "Failed to update user",
      },
      { status: 500 }
    )
  }
}

// DELETE user (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)

    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}