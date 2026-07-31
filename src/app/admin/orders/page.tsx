"use client";

import { useEffect, useState } from "react";
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: "COD" | "AfterPay";
  items: OrderItem[];
  totalAmount: number;
  status: "Pending" | "Processing" | "Delivered" | "Cancelled";
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update Status Handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord._id === orderId ? { ...ord, status: newStatus as Order["status"] } : ord
          )
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Orders Dashboard</h1>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 border bg-white rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border shadow-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Orders Found</h3>
          <p className="text-gray-500 text-sm mt-1">When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Order ID</span>
                  <h3 className="text-sm font-bold text-gray-800">#{order._id}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>

                  {/* Status Controller */}
                  <select
                    disabled={updatingId === order._id}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer & Items Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                {/* Customer Details */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Details</h4>
                  <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                  <p className="text-sm text-gray-600">📞 {order.phone}</p>
                  <p className="text-xs text-gray-500 mt-1">📍 {order.address}</p>
                  <span className="inline-block text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded mt-2">
                    Payment: {order.paymentMethod}
                  </span>
                </div>

                {/* Items */}
                <div className="md:col-span-2 space-y-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b pb-1.5 last:border-0">
                        <span className="font-semibold text-gray-800">
                          {item.title} <span className="text-gray-500 text-xs">(x{item.quantity})</span>
                        </span>
                        <span className="font-bold text-gray-900">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t pt-3 mt-3">
                    <span className="text-sm font-bold text-gray-700">Total Amount</span>
                    <span className="text-lg font-extrabold text-blue-600">
                      Rs. {order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}