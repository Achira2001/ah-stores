import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false }, // Optional for Google OAuth
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);