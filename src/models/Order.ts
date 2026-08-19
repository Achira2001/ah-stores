import mongoose, { Schema, Document } from "mongoose"

export interface IOrderItem {
  product: mongoose.Types.ObjectId
  name: string
  image: string
  price: number
  quantity: number
  color?: string
}

export type OrderStatus = "pending" | "processing" | "delivered" | "cancelled"
export type PaymentMethod = "cod" | "card"
export type PaymentStatus = "pending" | "paid" | "failed"

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId
  items: IOrderItem[]
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
    postalCode?: string
  }
  totalAmount: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  stripePaymentIntentId?: string
  stripeCheckoutSessionId?: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    color: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
)

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (items: IOrderItem[]) {
          return Array.isArray(items) && items.length > 0
        },
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      postalCode: { type: String, trim: true },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
      default: undefined,
    },
    stripeCheckoutSessionId: {
      type: String,
      default: undefined,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
)

OrderSchema.index({ user: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ paymentStatus: 1 })
OrderSchema.index({ stripePaymentIntentId: 1 })

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema)