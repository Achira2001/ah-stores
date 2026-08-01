"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, SlidersHorizontal, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const CATEGORIES = ["All", "Essentials", "Groceries", "Household", "Personal Care"];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { addToCart } = useCart();

  // Fetch Products based on search and category filter
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append("search", search.trim());
      if (selectedCategory !== "All") queryParams.append("category", selectedCategory);

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search trigger / Category change trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Search & Category Filter Section */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search essential items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Showing {products.length} Products</span>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border shadow-sm">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No products found</h3>
          <p className="text-gray-500 text-sm mt-1">Try searching for something else or change category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full h-48 bg-gray-50">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {product.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-blue-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border">
                      {product.category}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-gray-900 text-base line-clamp-1">{product.title}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{product.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3">
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-gray-400 font-semibold">Price</span>
                  <span className="text-base font-extrabold text-blue-600">
                    Rs. {product.price.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/product/${product._id}`}
                    className="w-full py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl text-center transition"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}