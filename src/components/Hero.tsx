"use client"

import Link from "next/link"
import { ArrowRight, Truck, Shield, Clock, Headphones } from "lucide-react"

export default function Hero() {
  return (
    <div className="space-y-12">
      {/* Main Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-block bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
              Sri Lanka's #1 Online Store
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Everything You Need,{" "}
              <span className="text-orange-400">Delivered Fast</span>
            </h1>
            <p className="mt-6 text-lg text-blue-100">
              From electronics to home essentials, books to personal care — shop thousands 
              of quality products with island-wide delivery and cash on delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition backdrop-blur"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Truck, title: "Island-wide Delivery", desc: "Fast & reliable" },
          { icon: Shield, title: "Secure Payments", desc: "100% protected" },
          { icon: Clock, title: "24/7 Support", desc: "Always here to help" },
          { icon: Headphones, title: "Easy Returns", desc: "Hassle-free policy" },
        ].map((badge, idx) => (
          <div key={idx} className="flex items-center space-x-3 bg-white p-4 rounded-xl border shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <badge.icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{badge.title}</p>
              <p className="text-xs text-gray-500">{badge.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
