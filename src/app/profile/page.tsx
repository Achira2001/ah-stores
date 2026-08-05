"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  LogOut,
  ShoppingBag,
  Save,
  Check,
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
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

const STATUS_CONFIG: Record<Order["status"], { bg: string; text: string; icon: any }> = {
  Pending: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: Clock },
  Processing: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: Clock },
  Shipped: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", icon: Truck },
  Delivered: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 },
  Cancelled: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: XCircle },
};

export default function UserProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"orders" | "shipping">("orders");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login?redirect=/profile");
      return;
    }

    if (authStatus === "authenticated") {
      fetchUserData();
    }
  }, [authStatus, router]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();

      if (data.success) {
        setProfile(data.user);
        setOrders(data.orders);
        setFormData({
          name: data.user.name || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          city: data.user.city || "",
          postalCode: data.user.postalCode || "",
        });
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleOrderAccordion = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const totalSpent = useMemo(() => {
    return orders.reduce(
      (acc, curr) => (curr.status !== "Cancelled" ? acc + curr.totalAmount : acc),
      0
    );
  }, [orders]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Account Overview Header */}
      <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl border border-blue-100">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile?.name || "Customer"}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{profile?.email}</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Member since {profile ? new Date().getFullYear() : "2024"}
            </p>
          </div>
        </div>

        {/* Quick Account Metrics */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8">
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Orders</p>
            <p className="text-xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Lifetime Spend</p>
            <p className="text-xl font-bold text-blue-600">${totalSpent.toFixed(2)}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2.5 rounded-xl border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-gray-500 transition-colors ml-auto"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("orders")}
          className={`inline-flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "orders"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Package className="w-4 h-4" />
          Order History ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("shipping")}
          className={`inline-flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "shipping"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Shipping & Profile Details
        </button>
      </div>

      {/* TAB 1: ORDER HISTORY */}
      {activeTab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border p-12 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">No orders placed yet</h3>
                <p className="text-xs text-gray-500">Explore our products and place your first order today.</p>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
                const statusStyle = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                const isExpanded = expandedOrderId === order._id;

                return (
                  <div
                    key={order._id}
                    className="bg-white border rounded-2xl shadow-sm transition-all overflow-hidden"
                  >
                    {/* Header Summary */}
                    <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 bg-white">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Order #{order._id.substring(order._id.length - 8)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.text}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 font-medium">Total Amount</p>
                          <p className="text-sm font-extrabold text-gray-900">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleOrderAccordion(order._id)}
                          className="p-2 rounded-xl border bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Accordion Expandable Details */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50/50 p-5 sm:p-6 space-y-6">
                        {/* Ordered Items */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Items Ordered ({order.items.length})
                          </h4>
                          <div className="divide-y border rounded-xl bg-white px-4">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-3 text-xs"
                              >
                                <div>
                                  <p className="font-bold text-gray-900">
                                    {item.name || item.title || "Product"}
                                  </p>
                                  <p className="text-gray-400">
                                    Quantity: <strong className="text-gray-700">{item.quantity}</strong> × ${item.price.toFixed(2)}
                                  </p>
                                </div>
                                <span className="font-bold text-gray-900">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Destination */}
                        <div className="bg-white p-4 rounded-xl border text-xs space-y-1">
                          <p className="font-bold text-gray-700">Shipping Destination:</p>
                          <p className="text-gray-600">
                            {order.customerDetails?.fullName} • {order.customerDetails?.phone}
                          </p>
                          <p className="text-gray-500">
                            {order.customerDetails?.address}
                            {order.customerDetails?.city ? `, ${order.customerDetails.city}` : ""}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EDIT PROFILE & SHIPPING DETAILS */}
      {activeTab === "shipping" && (
        <div className="bg-white border rounded-3xl p-6 sm:p-8 max-w-2xl shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Default Shipping Address</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Save your address here to automatically pre-fill your future checkouts.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Commerce St, Suite 100"
                className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Postal / ZIP Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saveSuccess ? "Saved Successfully!" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}