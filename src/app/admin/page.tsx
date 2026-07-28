"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, PackageCheck, AlertCircle } from "lucide-react";

const CATEGORIES = ["Electronics", "Stationery", "Home Items", "Personal Care"];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Electronics",
    images: "",
    stock: "10",
    isCodAvailable: true,
    isAfterPayAvailable: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Convert image string into array
      const imageUrls = formData.images
        .split(",")
        .map((img) => img.trim())
        .filter((img) => img.length > 0);

      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: imageUrls.length > 0 ? imageUrls : ["https://via.placeholder.com/300"],
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Product added successfully!" });
        setFormData({
          title: "",
          description: "",
          price: "",
          category: "Electronics",
          images: "",
          stock: "10",
          isCodAvailable: true,
          isAfterPayAvailable: false,
        });
        router.refresh();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to add product" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred while adding the product." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-10">
        
        <div className="flex items-center gap-3 border-b pb-4 mb-6">
          <PlusCircle className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Add new items to A H Essentials Store</p>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-semibold ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <PackageCheck className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hair Dryer 1200W"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Price (LKR) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 4500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                placeholder="10"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide key details about the item..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Image URL(s)
            </label>
            <input
              type="text"
              placeholder="Paste image link (comma separated for multiple)"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Payment Availability Selectors */}
          <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">Payment Options Allowed</h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCodAvailable}
                  onChange={(e) => setFormData({ ...formData, isCodAvailable: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Cash on Delivery (COD)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAfterPayAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, isAfterPayAvailable: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">AfterPay Available</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md disabled:bg-blue-300"
          >
            {loading ? "Adding Product..." : "Save Product to Store"}
          </button>

        </form>
      </div>
    </div>
  );
}