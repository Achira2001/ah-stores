import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Image from "next/image";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  try {
    await connectToDatabase();
    const product = await Product.findById(id).lean();
    if (!product) return null;
    
    // Convert MongoDB _id and dates to plain strings
    return {
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt?.toString(),
      updatedAt: product.updatedAt?.toString(),
    };
  } catch (error) {
    return null;
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Product Image */}
        <div className="relative w-full h-[400px] border rounded-lg overflow-hidden bg-gray-50">
          <Image
            src={product.images?.[0] || "https://via.placeholder.com/400"}
            alt={product.title}
            fill
            className="object-contain p-4"
            priority
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-4">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
          <p className="text-2xl font-bold text-green-600">
            LKR {product.price.toLocaleString()}
          </p>

          <p className="text-gray-600 leading-relaxed mt-2">
            {product.description}
          </p>

          <div className="flex flex-col gap-2 my-4 border-t border-b py-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold">Cash On Delivery:</span>{" "}
              {product.isCodAvailable ? "Available ✅" : "Not Available ❌"}
            </div>
            <div>
              <span className="font-semibold">AfterPay Options:</span>{" "}
              {product.isAfterPayAvailable ? "Available ✅" : "Not Available ❌"}
            </div>
          </div>

          <button className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-md">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}