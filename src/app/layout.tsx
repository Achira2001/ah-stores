import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "A H Essentials | Daily Store",
  description: "Shop quality daily essentials online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}