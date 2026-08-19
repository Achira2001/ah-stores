import mongoose, { Schema, Document } from "mongoose"

export interface IColorVariant {
  color: string
  images: string[]
  stock: number
}

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  colorVariants: IColorVariant[]
  category: string
  stock: number
  codAvailable: boolean
  featured: boolean
  ratings: {
    average: number
    count: number
  }
  createdAt: Date
  updatedAt: Date
}

const ColorVariantSchema = new Schema<IColorVariant>(
  {
    color: {
      type: String,
      required: [true, "Colour name is required"],
      trim: true,
      maxlength: [50, "Colour name cannot exceed 50 characters"],
    },
    images: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: function (images: string[]) {
          return (
            Array.isArray(images) &&
            images.length > 0 &&
            images.every(
              (image) => typeof image === "string" && image.trim().length > 0
            )
          )
        },
        message: "Each colour must have at least one valid image",
      },
    },
    stock: {
      type: Number,
      required: [true, "Colour stock is required"],
      min: [0, "Colour stock cannot be negative"],
      default: 0,
    },
  },
  {
    _id: false,
  }
)

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    comparePrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    colorVariants: {
      type: [ColorVariantSchema],
      default: [],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },
    codAvailable: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
)

/*
 * Total stock එක Colour Variant Stock එක සමඟ Synchronize කිරීම
 */
ProductSchema.pre("validate", function () {
  if (Array.isArray(this.colorVariants) && this.colorVariants.length > 0) {
    this.stock = this.colorVariants.reduce(
      (total, variant) => total + Number(variant.stock || 0),
      0
    )
  }
})

ProductSchema.index({ category: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ featured: 1 })
ProductSchema.index({ createdAt: -1 })

ProductSchema.index({
  name: "text",
  description: "text",
})

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema)