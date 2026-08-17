import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-white">AH Store</span>
            </div>
            <p className="text-sm">
              Sri Lanka's premier online shopping destination. Quality products, fast delivery, 
              and exceptional service.
            </p>
            <div className="flex space-x-4">
  <a
    href="#"
    aria-label="Facebook"
    className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
  >
    <span className="font-bold text-sm">f</span>
  </a>

  <a
    href="#"
    aria-label="Instagram"
    className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition"
  >
    <span className="font-bold text-sm">ig</span>
  </a>

  <a
    href="#"
    aria-label="X"
    className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 hover:text-white transition"
  >
    <span className="font-bold text-sm">𝕏</span>
  </a>
</div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/products" className="hover:text-white transition">All Products</Link></li>
              <li><Link href="/cart" className="hover:text-white transition">Shopping Cart</Link></li>
              <li><Link href="/profile" className="hover:text-white transition">My Account</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?category=Electronics" className="hover:text-white transition">Electronics</Link></li>
              <li><Link href="/products?category=Home+%26+Kitchen" className="hover:text-white transition">Home & Kitchen</Link></li>
              <li><Link href="/products?category=Books+%26+Stationery" className="hover:text-white transition">Books & Stationery</Link></li>
              <li><Link href="/products?category=Personal+Care" className="hover:text-white transition">Personal Care</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Colombo, Sri Lanka</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>support@ahstore.lk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p> {new Date().getFullYear()} AH Store Sri Lanka. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}