import mongoose, { Schema, Document } from "mongoose"

export interface INotification extends Document {
  user: string
  title: string
  message: string
  type: "order" | "system" | "promo"
  read: boolean
  link?: string
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "system", "promo"],
      default: "system",
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
  },
  { timestamps: true }
)

NotificationSchema.index({ user: 1, read: 1 })
NotificationSchema.index({ createdAt: -1 })

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema)