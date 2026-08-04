"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Invalid Link</h2>
          <p className="text-sm text-gray-500">
            No reset token found in the URL.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
          Set New Password
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Enter your new password below
        </p>

        {error && (
          <div className="p-3 mb-4 text-xs font-bold bg-red-50 text-red-700 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">
              Password Reset Complete!
            </h2>
            <p className="text-sm text-gray-500">
              Your password has been updated successfully.
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                <Lock className="w-5 h-5" />
              )}
              <span>Update Password</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}