"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import Image from "next/image"

import {
  CreditCard,
  Truck,
  MapPin,
  Phone,
  User,
  AlertCircle,
} from "lucide-react"

import toast from "react-hot-toast"

import { useCart } from "@/context/CartContext"

export default function CheckoutPage() {
  const { data: session, status: sessionStatus } =
    useSession()

  const router = useRouter()

  const {
    items,
    totalPrice,
    clearCart,
  } = useCart()

  const [loading, setLoading] =
    useState(false)

  const [paymentMethod, setPaymentMethod] =
    useState<"cod" | "card">("cod")

  const [shippingAddress, setShippingAddress] =
    useState({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
    })

  // -------------------------------------------------
  // Fill customer name when session loads
  // -------------------------------------------------

  useEffect(() => {
    if (session?.user?.name) {
      setShippingAddress((prev) => ({
        ...prev,

        fullName:
          prev.fullName ||
          session.user.name ||
          "",
      }))
    }
  }, [session?.user?.name])

  // -------------------------------------------------
  // Check authentication
  // -------------------------------------------------

  useEffect(() => {
    if (
      sessionStatus === "unauthenticated"
    ) {
      router.push("/login")
    }
  }, [sessionStatus, router])

  // -------------------------------------------------
  // COD availability
  // -------------------------------------------------

  const codNotAvailable = items.some(
    (item) =>
      item.codAvailable === false
  )

  // -------------------------------------------------
  // If COD is unavailable, automatically
  // switch to card
  // -------------------------------------------------

  useEffect(() => {
    if (
      codNotAvailable &&
      paymentMethod === "cod"
    ) {
      setPaymentMethod("card")
    }
  }, [
    codNotAvailable,
    paymentMethod,
  ])

  // -------------------------------------------------
  // Submit order
  // -------------------------------------------------

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    // Prevent double submission
    if (loading) {
      return
    }

    // -------------------------------------------------
    // Authentication check
    // -------------------------------------------------

    if (!session?.user) {
      toast.error(
        "Please login before placing an order."
      )

      router.push("/login")

      return
    }

    // -------------------------------------------------
    // Cart check
    // -------------------------------------------------

    if (items.length === 0) {
      toast.error(
        "Your cart is empty."
      )

      return
    }

    // -------------------------------------------------
    // Shipping validation
    // -------------------------------------------------

    if (
      !shippingAddress.fullName.trim() ||
      !shippingAddress.phone.trim() ||
      !shippingAddress.address.trim() ||
      !shippingAddress.city.trim()
    ) {
      toast.error(
        "Please fill in all required fields."
      )

      return
    }

    // -------------------------------------------------
    // COD validation
    // -------------------------------------------------

    if (
      paymentMethod === "cod" &&
      codNotAvailable
    ) {
      toast.error(
        "Some items in your cart don't support Cash on Delivery. Please choose card payment."
      )

      return
    }

    setLoading(true)

    try {
      // =================================================
      // CARD PAYMENT
      // =================================================

      if (
        paymentMethod === "card"
      ) {
        const res = await fetch(
          "/api/checkout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
  items: items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    color: item.color,
  })),

  shippingAddress,
}),
          }
        )

        const data =
          await res.json()

        if (!res.ok) {
          toast.error(
            data.error ||
              "Failed to start payment."
          )

          return
        }

        if (data.url) {
          window.location.href =
            data.url

          return
        }

        toast.error(
          "Unable to create Stripe checkout."
        )

        return
      }

      // =================================================
      // COD ORDER
      // =================================================

      const orderRes =
        await fetch(
          "/api/orders",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
  items: items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    color: item.color,
  })),

  shippingAddress,

  paymentMethod: "cod",
}),
          }
        )

      const data =
        await orderRes.json()

      if (!orderRes.ok) {
        toast.error(
          data.error ||
            "Failed to place order."
        )

        return
      }

      toast.success(
        "Order placed successfully!"
      )

      clearCart()

      router.push("/profile")
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      )

      toast.error(
        "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------
  // Loading
  // -------------------------------------------------

  if (
    sessionStatus === "loading"
  ) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

        <p className="mt-4 text-gray-500">
          Loading checkout...
        </p>
      </div>
    )
  }

  // -------------------------------------------------
  // Empty cart
  // -------------------------------------------------

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">
          Your cart is empty
        </p>
      </div>
    )
  }

  // -------------------------------------------------
  // Checkout UI
  // -------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ============================================
            SHIPPING + PAYMENT
        ============================================ */}

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">

            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />

              Shipping Address
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* FULL NAME */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="text"
                    required
                    value={
                      shippingAddress.fullName
                    }
                    onChange={(e) =>
                      setShippingAddress(
                        {
                          ...shippingAddress,
                          fullName:
                            e.target.value,
                        }
                      )
                    }
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* PHONE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="tel"
                    required
                    value={
                      shippingAddress.phone
                    }
                    onChange={(e) =>
                      setShippingAddress(
                        {
                          ...shippingAddress,
                          phone:
                            e.target.value,
                        }
                      )
                    }
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>

              {/* ADDRESS */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>

                <textarea
                  required
                  value={
                    shippingAddress.address
                  }
                  onChange={(e) =>
                    setShippingAddress(
                      {
                        ...shippingAddress,
                        address:
                          e.target.value,
                      }
                    )
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  placeholder="Street address, apartment, suite, etc."
                />
              </div>

              {/* CITY + POSTAL */}

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      shippingAddress.city
                    }
                    onChange={(e) =>
                      setShippingAddress(
                        {
                          ...shippingAddress,
                          city:
                            e.target.value,
                        }
                      )
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Colombo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>

                  <input
                    type="text"
                    value={
                      shippingAddress.postalCode
                    }
                    onChange={(e) =>
                      setShippingAddress(
                        {
                          ...shippingAddress,
                          postalCode:
                            e.target.value,
                        }
                      )
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="00100"
                  />
                </div>

              </div>

              {/* ========================================
                  PAYMENT METHOD
              ======================================== */}

              <div className="pt-4">

                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Payment Method
                </h3>

                <div className="space-y-3">

                  {/* COD */}

                  <label
                    className={`flex items-center p-4 border rounded-lg transition ${
                      codNotAvailable
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    } ${
                      paymentMethod === "cod"
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >

                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={
                        paymentMethod ===
                        "cod"
                      }
                      disabled={
                        codNotAvailable
                      }
                      onChange={() =>
                        setPaymentMethod(
                          "cod"
                        )
                      }
                      className="w-4 h-4 text-blue-600"
                    />

                    <Truck className="w-5 h-5 ml-3 text-gray-600" />

                    <div className="ml-3">

                      <p className="font-medium text-gray-900">
                        Cash on Delivery
                      </p>

                      <p className="text-sm text-gray-500">
                        Pay when you receive
                      </p>

                    </div>

                  </label>

                  {/* COD WARNING */}

                  {codNotAvailable && (
                    <div className="flex items-center text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">

                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />

                      Some items don't support COD.
                      Card payment is required.

                    </div>
                  )}

                  {/* CARD */}

                  <label
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod ===
                      "card"
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >

                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={
                        paymentMethod ===
                        "card"
                      }
                      onChange={() =>
                        setPaymentMethod(
                          "card"
                        )
                      }
                      className="w-4 h-4 text-blue-600"
                    />

                    <CreditCard className="w-5 h-5 ml-3 text-gray-600" />

                    <div className="ml-3">

                      <p className="font-medium text-gray-900">
                        Card Payment
                      </p>

                      <p className="text-sm text-gray-500">
                        Secure payment via Stripe
                      </p>

                    </div>

                  </label>

                </div>
              </div>

              {/* ========================================
                  SUBMIT
              ======================================== */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
              >

                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : paymentMethod ===
                  "card" ? (
                  `Pay LKR ${totalPrice.toLocaleString()}`
                ) : (
                  `Place Order (COD) - LKR ${totalPrice.toLocaleString()}`
                )}

              </button>

            </form>
          </div>
        </div>

        {/* ============================================
            ORDER SUMMARY
        ============================================ */}

        <div>

          <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">

            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">

              {items.map((item) => (

                <div
                  key={item.productId}
                  className="flex items-center space-x-3"
                >

                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">

                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />

                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>

                    {item.color && (
  <p className="text-xs text-gray-500">
    Colour: {item.color}
  </p>
)}

<p className="text-xs text-gray-500">
  Qty: {item.quantity}
</p>

                  </div>

                  <p className="text-sm font-medium">
                    LKR{" "}
                    {(
                      item.price *
                      item.quantity
                    ).toLocaleString()}
                  </p>

                </div>

              ))}

            </div>

            <div className="border-t pt-4 space-y-2">

              <div className="flex justify-between text-sm">

                <span className="text-gray-600">
                  Subtotal
                </span>

                <span>
                  LKR{" "}
                  {totalPrice.toLocaleString()}
                </span>

              </div>

              <div className="flex justify-between text-sm">

                <span className="text-gray-600">
                  Shipping
                </span>

                <span className="text-green-600">
                  Free
                </span>

              </div>

              <div className="flex justify-between text-lg font-bold border-t pt-2">

                <span>
                  Total
                </span>

                <span>
                  LKR{" "}
                  {totalPrice.toLocaleString()}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}