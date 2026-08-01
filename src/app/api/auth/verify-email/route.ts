import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing token" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Email verification failed" },
      { status: 500 }
    );
  }
}