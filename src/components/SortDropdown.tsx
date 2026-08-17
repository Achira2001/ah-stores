"use client"

import { useRouter, useSearchParams } from "next/navigation"

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
]

export default function SortDropdown() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "newest"

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("sort", value)
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Sort by:</span>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}