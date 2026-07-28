"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isCodAvailable: boolean;
  isAfterPayAvailable: boolean;
}

const CATEGORIES = ["All", "Electronics", "Stationery", "Home Items", "Personal Care"];

function HomeContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState<number>(20000);

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let url = `/api/products?category=${selectedCategory}&maxPrice=${maxPrice}`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, maxPrice, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-10 text-white mb-8 shadow-md">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-2">A H Essentials</h1>
        <p className="text-blue-100 text-lg">Your trusted store for everyday household items & stationery.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="bg-white p-6 rounded-xl border h-fit space-y-6 shadow-sm">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-3">Categories</h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Max Price Filter</h3>
            <input
              type="range"
              min="100"
              max="20000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-sm font-semibold text-gray-700 mt-1">
              <span>Rs. 100</span>
              <span>Rs. {maxPrice.toLocaleString()}</span>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border">
              <p className="text-gray-500 text-lg">No products found for this query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div key={prod._id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 w-full bg-gray-100">
                      <Image
                        src={prod.images[0] || "https://via.placeholder.com/300"}
                        alt={prod.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {prod.category}
                      </span>
                      <h4 className="font-bold text-gray-800 text-lg mt-2 line-clamp-1">{prod.title}</h4>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{prod.description}</p>
                      
                      {/* Payment Badges */}
                      <div className="flex gap-2 mt-3 text-[10px] font-medium">
                        {prod.isCodAvailable && (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">COD Available</span>
                        )}
                        {prod.isAfterPayAvailable && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">AfterPay</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t mt-4 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-gray-900">
                      Rs. {prod.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() =>
                        addToCart({
                          _id: prod._id,
                          title: prod.title,
                          price: prod.price,
                          image: prod.images[0] || "https://via.placeholder.com/300",
                          quantity: 1,
                          isCodAvailable: prod.isCodAvailable,
                          isAfterPayAvailable: prod.isAfterPayAvailable,
                        })
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading page...</div>}>
      <HomeContent />
    </Suspense>
  );
}