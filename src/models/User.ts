import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "customer" | "admin"
  image?: string
  isVerified: boolean
  verificationToken?: string
  verificationTokenExpiry?: Date
  resetToken?: string
  resetTokenExpiry?: Date
  phone?: string
  address?: string
  city?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
  type: String,
  required: [true, "Email is required"],
  unique: true,
  lowercase: true,
  trim: true,
  match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
},
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    image: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetToken: String,
    resetTokenExpiry: Date,
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
)

// Index for faster queries
UserSchema.index({ verificationToken: 1 })
UserSchema.index({ resetToken: 1 })

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)