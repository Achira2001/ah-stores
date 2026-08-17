"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { User, Mail, Phone, MapPin, Camera, Lock, Package, Bell } from "lucide-react"
import toast from "react-hot-toast"

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

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState("profile")
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchUser()
      fetchOrders()
    }
  }, [session])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${session?.user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
        })
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/users/${session?.user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success("Profile updated successfully")
        await update({ name: formData.name })
        fetchUser()
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Password changed successfully")
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        toast.error(data.error || "Failed to change password")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "profiles")

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        
        // Update user with new image
        await fetch(`/api/users/${session?.user?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: data.url }),
        })

        await update({ image: data.url })
        fetchUser()
        toast.success("Profile image updated")
      }
    } catch (error) {
      toast.error("Failed to upload image")
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "password", label: "Password", icon: Lock },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition">
                  <Camera className="w-3 h-3 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                      placeholder="Your address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Colombo"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order History</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm">LKR {(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                      <div className="border-t mt-3 pt-3 flex justify-between">
                        <span className="text-sm text-gray-600">
                          Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}
                        </span>
                        <span className="font-bold">LKR {order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "password" && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Change Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}