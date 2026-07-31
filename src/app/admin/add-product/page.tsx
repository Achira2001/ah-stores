"use client";

import { useState } from "react";
import { PlusCircle, Loader2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    category: "Essentials",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Product added successfully!" });
        setFormData({ title: "", description: "", price: "", image: "", category: "Essentials" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to add product" });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border shadow-sm">
        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm font-semibold ${
              message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Premium Coconut Oil 500ml"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (Rs.) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="1500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Essentials">Essentials</option>
                <option value="Groceries">Groceries</option>
                <option value="Household">Household</option>
                <option value="Personal Care">Personal Care</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Image Preview */}
          {formData.image && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2 font-medium">Image Preview:</p>
              <div className="relative w-28 h-28 border rounded-xl overflow-hidden bg-gray-50">
                <Image src={formData.image} alt="Preview" fill className="object-cover" unoptimized />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Provide details about the product..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>Add Product</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}