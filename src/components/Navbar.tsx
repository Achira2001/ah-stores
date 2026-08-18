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
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="ShopStore.lk Logo" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Home
            </Link>
            
            {isAdmin && (
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <NotificationBell />
                
                <Link href="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition">
                    {session.user.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || ""} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">{session.user.name}</span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <Link href="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Package className="w-4 h-4 mr-2" />
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
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
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link href="/" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            {session ? (
              <>
                <Link href="/cart" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Cart ({totalItems})
                </Link>
                <Link href="/profile" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
                {isAdmin && (
                  <Link href="/dashboard" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => { signOut(); setIsMenuOpen(false); }}
                  className="block w-full text-left py-2 text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/signup" className="block py-2 text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>
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