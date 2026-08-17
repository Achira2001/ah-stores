"use client"

import { useRouter, useSearchParams } from "next/navigation"

const categories = [
  "All",
  "Electronics",
  "Home & Kitchen",
  "Books & Stationery",
  "Personal Care",
  "Tools & Hardware",
  "Toys & Games",
  "Sports & Fitness",
  "Baby Products",
  "Office Supplies",
]

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || "All"

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === "All") {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    params.set("page", "1")
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Categories</h3>
      <div className="space-y-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
              currentCategory === category
                ? "bg-blue-600 text-white font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}