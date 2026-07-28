"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Store } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <Store className="w-6 h-6" />
          <span>A H Essentials</span>
        </Link>

        {/* Live Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search products (Iron, Pens, Dryers...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </form>

        {/* Right Action Icons */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative text-gray-700 hover:text-blue-600">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              0
            </span>
          </Link>
          <Link href="/login" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600">
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">Login</span>
          </Link>
        </div>

      </div>
    </header>
  );
}