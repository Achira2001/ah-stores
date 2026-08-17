"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Package } from "lucide-react"

interface Order {
  _id: string
  items: Array<{
    name: string
    image: string
    price: number
    quantity: number
  }>
  totalAmount: number
  status: string
  paymentMethod: string
  createdAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")

      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error(
        "Failed to fetch orders:",
        error
      )
    } finally {
      setLoading(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700"

      case "processing":
        return "bg-blue-100 text-blue-700"

      case "completed":
        return "bg-green-100 text-green-700"

      case "cancelled":
        return "bg-red-100 text-red-700"

      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"

      case "processing":
        return "Processing"

      case "completed":
        return "Completed"

      case "cancelled":
        return "Cancelled"

      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border shadow-sm">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />

          <p className="text-gray-500 text-lg">
            No orders yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`bg-white rounded-xl border shadow-sm p-6 ${
                order.status === "cancelled"
                  ? "border-red-200"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    Order #{order._id.slice(-6)}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(
                      order.status
                    )}
                  </span>
                </div>
              </div>

              {order.status === "cancelled" && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                  <p className="text-sm text-red-700">
                    This order has been cancelled.
                  </p>
                </div>
              )}

              {order.status === "completed" && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-100 px-4 py-3">
                  <p className="text-sm text-green-700">
                    This order has been completed.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {order.items.map(
                  (item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-4"
                    >
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="font-medium">
                        LKR{" "}
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString()}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="border-t mt-4 pt-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Payment:{" "}
                  {order.paymentMethod ===
                  "cod"
                    ? "Cash on Delivery"
                    : "Card"}
                </span>

                <span className="text-lg font-bold">
                  Total: LKR{" "}
                  {order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}