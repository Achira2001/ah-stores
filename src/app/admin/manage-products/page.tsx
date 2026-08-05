"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, PlusCircle, ArrowLeft, Loader2, X, CheckCircle2 } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  image?: string;
  category?: string;
}

export default function ManageProductsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      const isAdmin = (session?.user as any)?.role === "admin";
      if (!isAdmin) {
        router.push("/");
        return;
      }
      fetchProducts();
    }
  }, [authStatus, session, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        setMessage("Product deleted successfully.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingProduct.title,
          description: editingProduct.description,
          price: editingProduct.price,
          category: editingProduct.category,
          imageUrl: editingProduct.imageUrl || editingProduct.image,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? { ...p, ...editingProduct } : p))
        );
        setEditingProduct(null);
        setMessage("Product updated successfully.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update product:", err);
    } finally {
      setSaving(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading products database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
        <Link
          href="/admin/add-product"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-sm text-gray-500 mt-1">Edit or remove inventory items from your catalog</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
          Total: {products.length} Items
        </span>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-500 border-b">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => {
                const img = p.imageUrl || p.image || "/placeholder.png";
                return (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={img} alt={p.title} className="w-10 h-10 object-cover rounded-lg border flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{p.title}</p>
                        <p className="text-[11px] text-gray-400 line-clamp-1">{p.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md">
                        {p.category || "Essentials"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">${p.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          disabled={deletingId === p._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete Product"
                        >
                          {deletingId === p._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border shadow-xl w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Product</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category || "Essentials"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={editingProduct.imageUrl || editingProduct.image || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, imageUrl: e.target.value, image: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}