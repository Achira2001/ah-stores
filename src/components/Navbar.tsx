"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useCart } from "@/context/CartContext"
import { 
  ShoppingCart, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard,
  Package,
  Bell
} from "lucide-react"
import NotificationBell from "./NotificationBell"

export default function Navbar() {
  const { data: session } = useSession()
  const { totalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isAdmin = session?.user?.role === "admin"

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img 
              src="/logo.png" 
              alt="ShopStore.lk Logo" 
              className="h-9 lg:h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="relative text-stone-700 hover:text-[#0D5C63] font-medium transition-colors group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0D5C63] group-hover:w-full transition-all duration-300" />
            </Link>
            
            {isAdmin && (
              <Link href="/dashboard" className="relative text-stone-700 hover:text-[#0D5C63] font-medium transition-colors group">
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0D5C63] group-hover:w-full transition-all duration-300" />
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <>
                <NotificationBell />
                
                <Link href="/cart" className="relative p-2.5 text-stone-700 hover:text-[#0D5C63] hover:bg-stone-100 rounded-full transition">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#E1553F] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white">
                      {totalItems}
                    </span>
                  )}
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1.5 pr-3 rounded-full hover:bg-stone-100 transition border border-transparent hover:border-stone-200">
                    {session.user.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || ""} 
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0D5C63]/20"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#E8F3F0] rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-[#0D5C63]" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-stone-700 max-w-[100px] truncate">{session.user.name}</span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1 group-hover:translate-y-0 transition-all duration-200 overflow-hidden">
                    <div className="py-1.5">
                      <Link href="/profile" className="flex items-center px-4 py-2.5 text-sm text-stone-700 hover:bg-[#E8F3F0] hover:text-[#0A4A50] transition-colors">
                        <User className="w-4 h-4 mr-2.5" />
                        Profile
                      </Link>
                      <Link href="/orders" className="flex items-center px-4 py-2.5 text-sm text-stone-700 hover:bg-[#E8F3F0] hover:text-[#0A4A50] transition-colors">
                        <Package className="w-4 h-4 mr-2.5" />
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-sm text-stone-700 hover:bg-[#E8F3F0] hover:text-[#0A4A50] transition-colors">
                          <LayoutDashboard className="w-4 h-4 mr-2.5" />
                          Dashboard
                        </Link>
                      )}
                      <div className="my-1 border-t border-stone-100" />
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-[#E1553F] hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login" 
                  className="text-stone-700 hover:text-[#0D5C63] font-medium transition-colors px-2"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-[#0D5C63] text-white px-5 py-2.5 rounded-full font-semibold hover:bg-[#0A4A50] transition-colors shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-lg transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            <Link href="/" className="block px-3 py-2.5 rounded-lg text-stone-700 font-medium hover:bg-stone-100" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            {session ? (
              <>
                <Link href="/cart" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-stone-700 font-medium hover:bg-stone-100" onClick={() => setIsMenuOpen(false)}>
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="bg-[#E1553F] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="block px-3 py-2.5 rounded-lg text-stone-700 font-medium hover:bg-stone-100" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
                {isAdmin && (
                  <Link href="/dashboard" className="block px-3 py-2.5 rounded-lg text-stone-700 font-medium hover:bg-stone-100" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => { signOut(); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-[#E1553F] font-medium hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2.5 rounded-lg text-stone-700 font-medium hover:bg-stone-100" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/signup" className="block px-3 py-2.5 rounded-lg bg-[#0D5C63] text-white font-semibold text-center mt-2" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}