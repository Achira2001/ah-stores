import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"

// =========================================================
// GET SINGLE PRODUCT
// PUBLIC
// =========================================================

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  try {
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      )
    }

    await connectDB()

    const product = await Product.findById(id).lean()

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("GET /api/products/[id] error:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch product",
      },
      {
        status: 500,
      }
    )
  }
}

// =========================================================
// PUT UPDATE PRODUCT
// ADMIN ONLY
// =========================================================

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  try {
    const session = await auth()

    if (
      !session ||
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 403,
        }
      )
    }

    const { id } = await params

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      )
    }

    const body = await req.json()

    if (!body.name?.trim()) {
      return NextResponse.json(
        {
          error: "Product name is required",
        },
        {
          status: 400,
        }
      )
    }

    if (!body.description?.trim()) {
      return NextResponse.json(
        {
          error: "Product description is required",
        },
        {
          status: 400,
        }
      )
    }

    if (!body.category?.trim()) {
      return NextResponse.json(
        {
          error: "Category is required",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !Array.isArray(body.images) ||
      body.images.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "At least one product image is required",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !Array.isArray(body.colorVariants) ||
      body.colorVariants.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "At least one colour variant is required",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * Validate colour variants
     */
    for (const variant of body.colorVariants) {
      if (!variant?.color?.trim()) {
        return NextResponse.json(
          {
            error:
              "Every colour must have a name",
          },
          {
            status: 400,
          }
        )
      }

      if (
        !Array.isArray(variant.images) ||
        variant.images.length === 0
      ) {
        return NextResponse.json(
          {
            error: `Colour "${variant.color}" must have at least one image`,
          },
          {
            status: 400,
          }
        )
      }

      if (
        variant.stock === undefined ||
        Number(variant.stock) < 0
      ) {
        return NextResponse.json(
          {
            error: `Invalid stock for colour "${variant.color}"`,
          },
          {
            status: 400,
          }
        )
      }
    }

    await connectDB()

    const colorVariants =
      body.colorVariants.map(
        (variant: {
          color: string
          images: string[]
          stock: number
        }) => ({
          color: variant.color.trim(),
          images: variant.images,
          stock: Number(variant.stock),
        })
      )

    /*
     * Calculate total stock
     */
    const totalStock =
      colorVariants.reduce(
        (
          total: number,
          variant: { stock: number }
        ) =>
          total + variant.stock,
        0
      )

    const updateData = {
      name: body.name.trim(),

      description:
        body.description.trim(),

      price: Number(body.price),

      comparePrice:
        body.comparePrice !== undefined &&
        body.comparePrice !== null &&
        body.comparePrice !== ""
          ? Number(body.comparePrice)
          : undefined,

      images: body.images,

      colorVariants,

      category:
        body.category.trim(),

      stock: totalStock,

      codAvailable:
        Boolean(body.codAvailable),

      featured:
        Boolean(body.featured),
    }

    const product =
      await Product.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).lean()

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json({
      success: true,

      message:
        "Product updated successfully",

      product,
    })
  } catch (error: any) {
    console.error(
      "PUT /api/products/[id] error:",
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to update product",
      },
      {
        status: 500,
      }
    )
  }
}

// =========================================================
// DELETE PRODUCT
// ADMIN ONLY
// =========================================================

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 403,
        }
      )
    }

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      )
    }

    await connectDB()

    const product =
      await Product.findByIdAndDelete(id)

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error: any) {
    console.error(
      "DELETE /api/products/[id] error:",
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to delete product",
      },
      {
        status: 500,
      }
    )
  }
}