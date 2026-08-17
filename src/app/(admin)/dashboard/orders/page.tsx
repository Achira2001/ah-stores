"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Package,
  ChevronDown,
  Trash2,
} from "lucide-react"
import toast from "react-hot-toast"

interface Order {
  _id: string
  user: {
    name: string
    email: string
  }
  items: Array<{
    name: string
    image: string
    price: number
    quantity: number
  }>
  totalAmount: number
  status: string
  paymentMethod: string
  paymentStatus: string
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
    postalCode?: string
  }
  createdAt: string
}

const statusOptions = [
  "pending",
  "processing",
  "delivered",
  "cancelled",
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] =
    useState<string | null>(null)
  const [deletingOrder, setDeletingOrder] =
    useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")

      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      } else {
        toast.error("Failed to load orders")
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (
    orderId: string,
    status: string
  ) => {
    try {
      const res = await fetch(
        `/api/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      )

      const data = await res.json()

      if (res.ok) {
        toast.success("Order status updated")

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  status,
                }
              : order
          )
        )
      } else {
        toast.error(
          data.error || "Failed to update status"
        )
      }
    } catch (error) {
      console.error(
        "Update status error:",
        error
      )

      toast.error(
        "Something went wrong while updating status"
      )
    }
  }

  const deleteOrder = async (orderId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this cancelled order? This action cannot be undone."
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingOrder(orderId)

      const res = await fetch(
        `/api/orders/${orderId}`,
        {
          method: "DELETE",
        }
      )

      const data = await res.json()

      if (!res.ok) {
        toast.error(
          data.error || "Failed to delete order"
        )
        return
      }

      // Remove deleted order from the page
      setOrders((prevOrders) =>
        prevOrders.filter(
          (order) => order._id !== orderId
        )
      )

      // Close expanded section if deleted
      setExpandedOrder((current) =>
        current === orderId ? null : current
      )

      toast.success(
        "Cancelled order deleted successfully"
      )
    } catch (error) {
      console.error(
        "Delete order error:",
        error
      )

      toast.error(
        "Something went wrong while deleting the order"
      )
    } finally {
      setDeletingOrder(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Manage Orders
      </h1>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Items
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <>
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order._id
                          ? null
                          : order._id
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />

                        <span className="text-sm font-medium">
                          #{order._id.slice(-6)}
                        </span>

                        <ChevronDown
                          className={`w-4 h-4 ml-2 text-gray-400 transition ${
                            expandedOrder ===
                            order._id
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">
                        {order.user?.name || "N/A"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {order.user?.email || "N/A"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items.length} items
                    </td>

                    <td className="px-6 py-4 text-sm font-medium">
                      LKR{" "}
                      {order.totalAmount.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm">
                          {order.paymentMethod ===
                          "cod"
                            ? "COD"
                            : "Card"}
                        </span>

                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            order.paymentStatus ===
                            "paid"
                              ? "bg-green-100 text-green-700"
                              : order.paymentStatus ===
                                "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>

                    <td
                      className="px-6 py-4"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          disabled={
                            order.status ===
                              "cancelled" ||
                            deletingOrder ===
                              order._id
                          }
                          onChange={(e) =>
                            updateStatus(
                              order._id,
                              e.target.value
                            )
                          }
                          className={`text-sm border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none ${
                            order.status ===
                            "cancelled"
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {statusOptions.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status
                                  .charAt(0)
                                  .toUpperCase() +
                                  status.slice(
                                    1
                                  )}
                              </option>
                            )
                          )}
                        </select>

                        {order.status ===
                          "cancelled" && (
                          <button
                            type="button"
                            disabled={
                              deletingOrder ===
                              order._id
                            }
                            onClick={() =>
                              deleteOrder(
                                order._id
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />

                            {deletingOrder ===
                            order._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>

                  {expandedOrder === order._id && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 bg-gray-50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Order Items
                            </h4>

                            <div className="space-y-2">
                              {order.items.map(
                                (
                                  item,
                                  idx
                                ) => (
                                  <div
                                    key={idx}
                                    className="flex items-center space-x-3"
                                  >
                                    <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden">
                                      <Image
                                        src={
                                          item.image
                                        }
                                        alt={
                                          item.name
                                        }
                                        fill
                                        className="object-cover"
                                      />
                                    </div>

                                    <div>
                                      <p className="text-sm font-medium">
                                        {
                                          item.name
                                        }
                                      </p>

                                      <p className="text-xs text-gray-500">
                                        LKR{" "}
                                        {item.price.toLocaleString()}{" "}
                                        x{" "}
                                        {
                                          item.quantity
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Delivery Address
                            </h4>

                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                {
                                  order
                                    .shippingAddress
                                    .fullName
                                }
                              </p>

                              <p>
                                {
                                  order
                                    .shippingAddress
                                    .phone
                                }
                              </p>

                              <p>
                                {
                                  order
                                    .shippingAddress
                                    .address
                                }
                              </p>

                              <p>
                                {
                                  order
                                    .shippingAddress
                                    .city
                                }
                              </p>

                              {order
                                .shippingAddress
                                .postalCode && (
                                <p>
                                  {
                                    order
                                      .shippingAddress
                                      .postalCode
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No orders yet
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