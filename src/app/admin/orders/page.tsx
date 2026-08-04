"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Search, Filter, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
  customerDetails?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  customerName?: string;
  phone?: string;
  address?: string;
}

export default function AdminOrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      const isAdmin = (session?.user as any)?.role === "admin";
      if (!isAdmin) {
        router.push("/");
        return;
      }
      fetchOrders();
    }
  }, [authStatus, session, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

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
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders based on search input & status selection
  const filteredOrders = orders.filter((order) => {
    const name = order.customerDetails?.fullName || order.customerName || "";
    const email = order.customerDetails?.email || "";
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and update status for customer purchases
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border px-3 py-2 rounded-xl text-xs">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none font-semibold text-gray-700 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border text-center space-y-3">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No orders found</h3>
          <p className="text-xs text-gray-500">Try adjusting your search or status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const customerName = order.customerDetails?.fullName || order.customerName || "N/A";
            const phone = order.customerDetails?.phone || order.phone || "N/A";
            const address = order.customerDetails?.address || order.address || "N/A";
            const city = order.customerDetails?.city || "";

            return (
              <div key={order._id} className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Order ID</span>
                    <p className="text-sm font-mono font-bold text-gray-800">#{order._id.slice(-8)}</p>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 font-medium">Customer</span>
                    <p className="text-sm font-bold text-gray-800">{customerName}</p>
                    <p className="text-xs text-gray-500">{phone}</p>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 font-medium">Total Amount</span>
                    <p className="text-sm font-bold text-blue-600">${order.totalAmount.toFixed(2)}</p>
                  </div>

                  {/* Status Change Selector */}
                  <div className="flex items-center gap-2">
                    {updatingId === order._id && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-gray-50 text-gray-800 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Items & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold text-gray-700 mb-2">Order Items:</p>
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-gray-600">
                          <span>{item.name} (x{item.quantity})</span>
                          <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                    <p className="font-bold text-gray-700">Delivery Address:</p>
                    <p className="text-gray-600">{address}{city ? `, ${city}` : ""}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}