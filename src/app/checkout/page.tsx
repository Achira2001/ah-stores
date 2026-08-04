"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { CreditCard, Truck, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill user data when session loads
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setFullName(session.user.name);
      if (session.user.email) setEmail(session.user.email);
    }
  }, [session]);

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            _id: item._id,
            name: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.imageUrl,
          })),
          totalAmount,
          customerDetails: {
            fullName,
            email,
            address,
            city,
            phone,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        clearCart();
        router.push(`/orders`);
      } else {
        setError(data.error || "Failed to place order.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

      {error && (
        <div className="p-4 mb-6 text-sm font-semibold bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" /> Shipping Information
          </h2>

          <form onSubmit={handleSubmitOrder} id="checkout-form" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                required
                placeholder="123 Main Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City / Town</label>
                <input
                  type="text"
                  required
                  placeholder="Colombo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="0771234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary Side Card */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm h-fit space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Order Summary</h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold text-gray-800 line-clamp-1">{item.title}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-lg font-black text-gray-900 border-t pt-2">
              <span>Total</span>
              <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={loading || cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            <span>Place Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}