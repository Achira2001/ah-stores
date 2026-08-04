"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Clock, CheckCircle2, Truck, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
  customerDetails: {
    fullName: string;
    address: string;
    city: string;
    phone: string;
  };
}

export default function UserOrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      fetchUserOrders();
    }
  }, [authStatus, router]);

  const fetchUserOrders = async () => {
    try {
      const res = await fetch("/api/orders/user");
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error || "Failed to load orders");
      }
    } catch (err) {
      setError("An error occurred while fetching your orders.");
    } fontFinally: {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and view order history for {session?.user?.name || session?.user?.email}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm font-medium bg-red-50 text-red-700 rounded-2xl border border-red-200">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border text-center space-y-4">
          <Package className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">No Orders Yet</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Looks like you haven't placed any orders yet. Check out our latest products!
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-3xl border shadow-sm p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Order ID</p>
                  <p className="text-sm font-mono font-bold text-gray-800">#{order._id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Date Placed</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Amount</p>
                  <p className="text-sm font-bold text-blue-600">${order.totalAmount.toFixed(2)}</p>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Order Items */}
              <div className="divide-y">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Shipping Address Summary */}
              <div className="bg-gray-50 p-4 rounded-2xl text-xs text-gray-600">
                <span className="font-bold text-gray-700">Shipping Address: </span>
                {order.customerDetails.address}, {order.customerDetails.city} • {order.customerDetails.phone}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}