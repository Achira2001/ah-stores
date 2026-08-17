"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setSent(true)
        toast.success("Reset link sent to your email")
      } else {
        toast.error(data.error || "Failed to send reset link")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a password reset link to {email}. Please check your inbox.
          </p>
          <Link href="/login" className="mt-6 inline-block text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <Link href="/login" className="flex items-center text-gray-600 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Link>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="mt-1 text-gray-500">Enter your email and we'll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}