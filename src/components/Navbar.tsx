"use client";

import Link from "next/link";
import { ShoppingBag, PlusCircle, Package, Store, Edit } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { cart } = useCart();

  // Count total items in the cart
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-blue-600 tracking-tight">
            <Store className="w-6 h-6" />
            <span>A H Essentials</span>
          </Link>

          {/* Admin Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              Store
            </Link>
            <Link
              href="/admin/add-product"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Add Product
            </Link>
            <Link href="/admin/manage-products" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
              <Edit className="w-4 h-4 text-amber-600" />
              Manage
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Package className="w-4 h-4 text-purple-600" />
              Orders
            </Link>
          </nav>

          {/* Right Action Buttons (Cart & Mobile Quick Actions) */}
          <div className="flex items-center gap-4">

            {/* Cart Icon with Live Count Badge */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

          </div>
        </div>
      </div>
    </header>
  );
}