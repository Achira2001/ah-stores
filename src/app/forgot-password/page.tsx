"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(data.message);
      } else {
        setError(data.error || "Failed to send reset link.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </Link>

      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
          Reset Password
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Enter your email to receive a password reset link
        </p>

        {error && (
          <div className="p-3 mb-4 text-xs font-bold bg-red-50 text-red-700 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {message ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm font-medium text-gray-700">{message}</p>
            <Link
              href="/login"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              <span>Send Reset Link</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}