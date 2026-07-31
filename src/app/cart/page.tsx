"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "AfterPay">("COD");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      alert("Please fill in all delivery details!");
      return;
    }

    setLoading(true);

    try {
      // Order payload
      const orderData = {
        customerName: customer.name,
        phone: customer.phone,
        address: customer.address,
        paymentMethod,
        totalAmount: totalPrice,
        items: cart.map((item) => ({
          productId: item._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (data.success) {
        setOrderSuccess(true);
        clearCart();
      } else {
        alert(data.error || "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
          <p className="text-gray-500 text-sm">
            Thank you for ordering with A H Essentials. Your order has been saved and we will deliver your package shortly.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">Your Cart is Empty</h2>
          <p className="text-gray-500 text-sm">Explore our everyday items and add them to your cart.</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Browse Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({cart.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">{item.title}</h3>
                  <p className="text-blue-600 font-extrabold text-sm">Rs. {item.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                {/* Quantity Controls */}
                <div className="flex items-center border rounded-lg bg-gray-50">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="px-3 py-1 font-bold text-gray-600 hover:bg-gray-200 rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="px-3 py-1 font-bold text-gray-600 hover:bg-gray-200 rounded-r-lg"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Form & Order Summary */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Delivery & Payment</h2>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="John Perera"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="0771234567"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Address *</label>
              <textarea
                required
                rows={2}
                placeholder="No 12, Main Street, Colombo"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Payment Option</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    paymentMethod === "COD"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("AfterPay")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    paymentMethod === "AfterPay"
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  AfterPay
                </button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Delivery Fee</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-gray-900 text-lg font-extrabold border-t pt-2">
                <span>Total Amount</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order ({paymentMethod})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}