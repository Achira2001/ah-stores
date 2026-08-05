"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Search,
  Filter,
  Loader2,
  ArrowLeft,
  DollarSign,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface OrderItem {
  _id?: string;
  name?: string;
  title?: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod?: string;
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

const STATUS_STYLING: Record<Order["status"], { bg: string; text: string; border: string }> = {
  Pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Processing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Shipped: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Cancelled: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

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
    setLoading(true);
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

  // Metrics Calculation
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, curr) => (curr.status !== "Cancelled" ? acc + curr.totalAmount : acc), 0);
    const pendingCount = orders.filter((o) => o.status === "Pending").length;
    const shippedCount = orders.filter((o) => o.status === "Shipped").length;
    const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
    return { totalRevenue, pendingCount, shippedCount, deliveredCount };
  }, [orders]);

  // Client Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const name = order.customerDetails?.fullName || order.customerName || "";
      const email = order.customerDetails?.email || "";
      const id = order._id || "";

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading fulfillment portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track, fulfill, and update status for customer orders</p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 bg-white border rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-600" /> Refresh List
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Valid Revenue</p>
            <p className="text-lg font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Pending Action</p>
            <p className="text-lg font-bold text-gray-900">{stats.pendingCount}</p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">In Transit</p>
            <p className="text-lg font-bold text-gray-900">{stats.shippedCount}</p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Delivered</p>
            <p className="text-lg font-bold text-gray-900">{stats.deliveredCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 border rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-xs font-semibold px-3 py-1.5 bg-gray-50 border rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Statuses ({orders.length})</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border text-center space-y-3">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No matching orders</h3>
          <p className="text-xs text-gray-500">Try broadening your search term or status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const customerName = order.customerDetails?.fullName || order.customerName || "Guest Customer";
            const email = order.customerDetails?.email || "No Email";
            const phone = order.customerDetails?.phone || order.phone || "N/A";
            const address = order.customerDetails?.address || order.address || "N/A";
            const city = order.customerDetails?.city || "";
            const style = STATUS_STYLING[order.status] || STATUS_STYLING.Pending;

            return (
              <div key={order._id} className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
                {/* Order Top Summary */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Order ID</span>
                    <p className="text-sm font-mono font-bold text-gray-900">#{order._id}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Customer</span>
                    <p className="text-xs font-bold text-gray-900">{customerName}</p>
                    <p className="text-[11px] text-gray-500">{email} • {phone}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total & Payment</span>
                    <p className="text-sm font-extrabold text-blue-600">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-[11px] text-gray-500">{order.paymentMethod || "COD"}</p>
                  </div>

                  {/* Status Change Selector */}
                  <div className="flex items-center gap-2">
                    {updatingId === order._id && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${style.bg} ${style.text} ${style.border} cursor-pointer outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Items & Shipping Address */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="md:col-span-2 space-y-2">
                    <p className="font-bold text-gray-700">Order Items ({order.items.length}):</p>
                    <div className="divide-y border rounded-xl px-3 bg-gray-50/50">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2 text-gray-700">
                          <span className="font-medium">
                            {item.name || item.title || "Product Item"} <strong className="text-gray-900">x{item.quantity}</strong>
                          </span>
                          <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 self-start">
                    <p className="font-bold text-gray-700">Delivery Address:</p>
                    <p className="text-gray-600 leading-relaxed">{address}{city ? `, ${city}` : ""}</p>
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