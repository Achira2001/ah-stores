import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  isCodAvailable: boolean; // Admin ta Cash on Delivery select karanna
  isAfterPayAvailable: boolean; // Admin ta After Pay select karanna
  createdAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ type: String, required: true }],
    stock: { type: Number, required: true, default: 0 },
    isCodAvailable: { type: Boolean, default: true },
    isAfterPayAvailable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;