"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { useCart } from "@/context/CartContext"

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-8">
        Thank you for your purchase. Your order has been placed successfully and will be processed shortly.
      </p>
      <div className="flex justify-center space-x-4">
        <Link
          href="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Continue Shopping
        </Link>
        <Link
          href="/profile"
          className="border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          View Orders
        </Link>
      </div>
    </div>
  )
}