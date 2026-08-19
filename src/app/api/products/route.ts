import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"

// =========================================================
// GET ALL PRODUCTS
// PUBLIC
// =========================================================

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)

    const category = searchParams.get("category")
    const sort = searchParams.get("sort")
    const search = searchParams.get("search")

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1")
    )

    /*
     * Allow the home page to request all products.
     */
    const limit = Math.min(
      1000,
      Math.max(
        1,
        parseInt(searchParams.get("limit") || "12")
      )
    )

    const query: Record<string, any> = {}

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$text = {
        $search: search,
      }
    }

    let sortOption: Record<string, 1 | -1> = {
      createdAt: -1,
    }

    switch (sort) {
      case "price-asc":
        sortOption = { price: 1 }
        break

      case "price-desc":
        sortOption = { price: -1 }
        break

      case "name-asc":
        sortOption = { name: 1 }
        break

      case "name-desc":
        sortOption = { name: -1 }
        break

      case "newest":
        sortOption = { createdAt: -1 }
        break
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("GET /api/products error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    )
  }
}

// =========================================================
// POST PRODUCT
// ADMIN ONLY
// =========================================================

export async function POST(req: NextRequest) {
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

    if (!Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json(
        {
          error: "At least one product image is required",
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
          error: "At least one colour variant is required",
        },
        {
          status: 400,
        }
      )
    }

    // Validate every colour variant
    for (const variant of body.colorVariants) {
      if (!variant || typeof variant !== "object") {
        return NextResponse.json(
          {
            error: "Invalid colour variant",
          },
          {
            status: 400,
          }
        )
      }

      if (!variant.color?.trim()) {
        return NextResponse.json(
          {
            error: "Every colour must have a name",
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
        !Number.isInteger(Number(variant.stock)) ||
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

    const colorVariants = body.colorVariants.map(
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

    const product = await Product.create({
      name: body.name.trim(),
      description: body.description.trim(),

      price: Number(body.price),

      comparePrice:
        body.comparePrice !== undefined &&
        body.comparePrice !== null &&
        body.comparePrice !== ""
          ? Number(body.comparePrice)
          : undefined,

      images: body.images,

      colorVariants,

      category: body.category.trim(),

      stock: Number(body.stock),

      codAvailable: Boolean(body.codAvailable),

      featured: Boolean(body.featured),
    })

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      {
        status: 201,
      }
    )
  } catch (error: any) {
    console.error("POST /api/products error:", error)

    return NextResponse.json(
      {
        error:
          error?.message || "Failed to create product",
      },
      {
        status: 500,
      }
    )
  }
}