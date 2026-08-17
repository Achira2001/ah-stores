"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  ArrowRight 
} from "lucide-react"

interface DashboardStats {
  totalProducts: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  recentOrders: Array<{
    _id: string
    user: { name: string }
    totalAmount: number
    status: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [productsRes, usersRes, ordersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/users"),
        fetch("/api/orders"),
      ])

      const [products, users, orders] = await Promise.all([
        productsRes.json(),
        usersRes.json(),
        ordersRes.json(),
      ])

      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)

      setStats({
        totalProducts: products.total || products.products?.length || 0,
        totalUsers: users.length || 0,
        totalOrders: orders.length || 0,
        totalRevenue,
        recentOrders: orders.slice(0, 5),
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  const statCards = [
    { label: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "bg-blue-500" },
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "bg-green-500" },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "bg-orange-500" },
    { label: "Total Revenue", value: `LKR ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "bg-purple-500" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/dashboard/products/add"
          className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition flex items-center justify-between"
        >
          <div>
            <p className="font-semibold">Add New Product</p>
            <p className="text-sm text-blue-100">Create a new product listing</p>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          href="/dashboard/products"
          className="bg-white border p-6 rounded-xl hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <p className="font-semibold text-gray-900">Manage Products</p>
            <p className="text-sm text-gray-500">Edit or delete products</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>
        <Link
          href="/dashboard/orders"
          className="bg-white border p-6 rounded-xl hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <p className="font-semibold text-gray-900">View Orders</p>
            <p className="text-sm text-gray-500">Manage customer orders</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    #{order._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.user?.name || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    LKR {order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "delivered" ? "bg-green-100 text-green-700" :
                      order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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