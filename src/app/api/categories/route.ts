import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"

export async function GET() {
  try {
    await connectDB()

    const categories = await Product.distinct("category")

    const cleanedCategories = categories
      .filter(
        (category): category is string =>
          typeof category === "string" && category.trim().length > 0
      )
      .map((category) => category.trim())
      .sort((a, b) => a.localeCompare(b))

    return NextResponse.json({
      success: true,
      categories: cleanedCategories,
    })
  } catch (error) {
    console.error("Get categories error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
      },
      {
        status: 500,
      }
    )
  }
}