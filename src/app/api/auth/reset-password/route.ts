import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password reset successful! You can now log in." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
}