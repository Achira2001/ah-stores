import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found to prevent user enumeration security issues
      return NextResponse.json(
        { success: true, message: "If account exists, a reset email has been sent." },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = resetExpiry;
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: "Reset Your Password - A H Essentials",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">Reset Password</a>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Password reset link sent to your email." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}