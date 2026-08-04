"use client";

import Link from "next/link";
import { ShoppingBag, PlusCircle, Package, Store, Edit, LogIn, LogOut, User as UserIcon, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { cart } = useCart();
  const { data: session } = useSession();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-blue-600 tracking-tight">
            <Store className="w-6 h-6" />
            <span>A H Essentials</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
              Store
            </Link>

            {/* Logged in users: My Orders */}
            {session && (
              <Link href="/orders" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                My Orders
              </Link>
            )}

            {/* Admin Links */}
            {isAdmin && (
              <>
                <Link href="/admin/add-product" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  Add Product
                </Link>
                <Link href="/admin/manage-products" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                  <Edit className="w-4 h-4 text-amber-600" />
                  Manage
                </Link>
                <Link href="/admin/orders" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                  <Package className="w-4 h-4 text-purple-600" />
                  Admin Orders
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            
            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors" title="Cart">
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Authentication Buttons */}
            {session ? (
              <div className="flex items-center gap-3 border-l pl-4">
                <Link href="/orders" className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1 rounded-xl transition">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800 leading-tight">
                      {session.user?.name || session.user?.email?.split("@")[0]}
                    </span>
                    {isAdmin && (
                      <span className="bg-blue-100 text-blue-800 text-[9px] px-1 py-0.2 rounded font-extrabold w-max">
                        ADMIN
                      </span>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}