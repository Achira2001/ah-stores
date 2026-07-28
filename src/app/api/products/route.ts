import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 1. GET: Products Search, Category Filter, Price Range Filter
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Next.js inbuilt nextUrl property (req.url wenuwata)
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const query: Record<string, unknown> = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      query.price = priceFilter;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// 2. POST: Admin Product Creation
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      title,
      description,
      price,
      category,
      images,
      stock,
      isCodAvailable,
      isAfterPayAvailable,
    } = body;

    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      title,
      description,
      price,
      category,
      images: images && images.length > 0 ? images : ["https://via.placeholder.com/300"],
      stock: stock ?? 1,
      isCodAvailable: isCodAvailable ?? true,
      isAfterPayAvailable: isAfterPayAvailable ?? false,
    });

    return NextResponse.json(
      { success: true, data: newProduct },
      { status: 201 }
    );
  } catch (error: any) {
  console.error("MongoDB Error Details:", error);
  return NextResponse.json(
    { success: false, error: error?.message || "Internal Server Error" },
    { status: 500 }
  );
  }
}