import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

// GET All Products (With Search, Filter & Price Limit)
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");

    let query: Record<string, any> = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      query.price = { $lte: Number(maxPrice) };
    }

    if (search && search.trim() !== "") {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST Create New Product (Admin Only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await request.json();

    const { title, description, price, image, imageUrl, category } = body;
    const finalImage = imageUrl || image;

    if (!title || !description || !price || !finalImage) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields (title, description, price, image)" },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      title,
      description,
      price: Number(price),
      imageUrl: finalImage,
      image: finalImage,
      category: category || "Essentials",
    });

    return NextResponse.json(
      { success: true, message: "Product created successfully", data: newProduct },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}