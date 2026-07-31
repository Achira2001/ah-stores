import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, required: true, enum: ["COD", "AfterPay"] },
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Delivered", "Cancelled"],
    },
  },
  { timestamps: true }
);

const Order = models.Order || model("Order", OrderSchema);
export default Order;