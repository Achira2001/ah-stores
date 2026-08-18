import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

// Drop-in replacement SVG components renamed to avoid import conflicts
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 w-full border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Brand - Spans 2 columns on desktop to fill area properly */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center">
              {/* Added a white background wrapper so the dark logo text is readable on the dark footer */}
              <div className="bg-white px-3 py-2 rounded-lg inline-block">
                <img 
                  src="/logo.png" 
                  alt="ShopStore.lk Logo" 
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
            
            <p className="text-gray-400 text-base max-w-md leading-relaxed">
              Sri Lanka's premier online shopping destination. Quality products, fast delivery, 
              and exceptional service right to your doorstep.
            </p>
            
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all duration-300"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="X (Twitter)"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300"
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-lg tracking-wide">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-lg tracking-wide">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Colombo, Sri Lanka</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>+94 70 280 9286</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a href="mailto:support@ahstore.lk" className="hover:text-white transition-colors">
                  support@ahstore.lk
                </a>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ShopStore Sri Lanka. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}