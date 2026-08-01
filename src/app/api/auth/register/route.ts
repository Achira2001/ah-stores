import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(request: Request) {
  try {
    const { name, email, password, role, adminSecret } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    // Admin secret validation check
    let userRole = "user";
    if (role === "admin") {
      if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json(
          { success: false, error: "Invalid Admin Secret Key" },
          { status: 403 }
        );
      }
      userRole = "admin";
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
    });

    // Send Verification Email
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Verify Your Email - A H Essentials",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to A H Essentials, ${name}!</h2>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">Verify Email</a>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}