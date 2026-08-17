"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import toast from "react-hot-toast"

interface Product {
  _id: string
  name: string
  price: number
  images: string[]
  category: string
  stock: number
  codAvailable: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=100")
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Product deleted")
        setProducts(products.filter((p) => p._id !== id))
      } else {
        toast.error("Failed to delete product")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const filteredProducts = products.filter((p) =>
  (p.name  || "")
    .toString()
    .toLowerCase()
    .includes((search || "").toLowerCase())
)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
        <Link
          href="/dashboard/products/add"
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COD</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    LKR {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.codAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {product.codAvailable ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/products/edit/${product._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
