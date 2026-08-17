import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Providers from "@/components/Providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AH Store - Sri Lanka's Premier Online Shopping",
  description:
    "Your one-stop shop for electronics, home essentials, books, personal care and more. Fast delivery across Sri Lanka.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>

          <Footer />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}