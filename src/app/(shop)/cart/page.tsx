"use client"

import Link from "next/link"
import Image from "next/image"

import { useCart } from "@/context/CartContext"

import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react"

import toast from "react-hot-toast"

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    totalItems,
    totalPrice,
  } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="text-center">

          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />

          <h2 className="text-2xl font-bold text-gray-900">
            Your Cart is Empty
          </h2>

          <p className="text-gray-500 mt-2">
            Looks like you haven't added
            anything yet
          </p>

          <Link
            href="/products"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Start Shopping
          </Link>

        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Shopping Cart ({totalItems} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ITEMS */}

        <div className="lg:col-span-2 space-y-4">

          {items.map((item) => (
            <div
              key={`${item.productId}-${item.color || "default"}`}
              className="flex gap-4 bg-white p-4 rounded-xl border shadow-sm"
            >

              {/* IMAGE */}

              <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">

                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover"
                />

              </div>

              {/* DETAILS */}

              <div className="flex-1 min-w-0">

                <Link
                  href={`/products/${item.productId}`}
                >
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                    {item.name}
                  </h3>
                </Link>

                {item.color && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      Colour:
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                      {item.color}
                    </span>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-1">
                  LKR{" "}
                  {item.price.toLocaleString()}{" "}
                  each
                </p>

                {item.codAvailable && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                    COD Available
                  </span>
                )}

                {/* CONTROLS */}

                <div className="flex items-center justify-between mt-3">

                  <div className="flex items-center border rounded-lg">

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity - 1,
                          item.color
                        )
                      }
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="px-3 font-medium">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity + 1,
                          item.color
                        )
                      }
                      disabled={
                        item.quantity >=
                        item.stock
                      }
                      className="p-2 hover:bg-gray-100 disabled:text-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                  </div>

                  <div className="flex items-center space-x-4">

                    <span className="font-bold text-gray-900">
                      LKR{" "}
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString()}
                    </span>

                    <button
                      onClick={() => {
                        removeItem(
                          item.productId,
                          item.color
                        )

                        toast.success(
                          "Item removed from cart"
                        )
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                  </div>

                </div>

              </div>
            </div>
          ))}

        </div>

        {/* SUMMARY */}

        <div className="lg:col-span-1">

          <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">

            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal ({totalItems} items)
                </span>

                <span className="font-medium">
                  LKR{" "}
                  {totalPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">

                <span className="text-gray-600">
                  Shipping
                </span>

                <span className="text-green-600 font-medium">
                  Free
                </span>

              </div>

              <div className="border-t pt-2 mt-2">

                <div className="flex justify-between text-lg font-bold">

                  <span>Total</span>

                  <span>
                    LKR{" "}
                    {totalPrice.toLocaleString()}
                  </span>

                </div>

              </div>

            </div>

            <Link
              href="/checkout"
              className="mt-6 w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Proceed to Checkout

              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>

            <Link
              href="/products"
              className="mt-3 w-full block text-center text-blue-600 hover:underline text-sm"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </div>
    </div>
  )
}