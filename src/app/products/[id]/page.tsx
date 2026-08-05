"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Loader2, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  image?: string;
  category?: string;
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        const item = data.data || data.product;
        setProduct(item);
      }
    } catch (err) {
      console.error("Failed to fetch product details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const cartProduct = {
      ...product,
      imageUrl: product.imageUrl || product.image || "/placeholder.png",
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct as any);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-sm text-gray-500">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
      </div>
    );
  }

  const imageSrc = product.imageUrl || product.image || "/placeholder.png";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-8 font-medium transition">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl border shadow-sm">
        {/* Product Image */}
        <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border">
          <img
            src={imageSrc}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.category && (
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-blue-700 text-xs font-black px-3 py-1 rounded-full shadow-sm">
              {product.category}
            </span>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{product.title}</h1>
            <p className="text-3xl font-extrabold text-blue-600">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-6 border-t pt-6">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-700">Quantity:</span>
              <div className="flex items-center border rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-gray-600 hover:bg-gray-200 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-black text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2.5 text-gray-600 hover:bg-gray-200 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{added ? "Added to Cart!" : `Add ${quantity} to Cart`}</span>
            </button>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4 border-t pt-6 text-xs text-gray-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Fast & Islandwide Delivery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>100% Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}