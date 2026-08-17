"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (token) {
      verifyEmail()
    } else {
      setStatus("error")
      setMessage("Invalid verification link")
    }
  }, [token])

  const verifyEmail = async () => {
    try {
      const res = await fetch(`/api/verify-email?token=${token}`)
      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(data.error || "Verification failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Something went wrong")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900">Verifying Email...</h2>
            <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <Link
              href="/login"
              className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <Link
              href="/signup"
              className="mt-6 inline-block text-blue-600 hover:underline"
            >
              Back to Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
