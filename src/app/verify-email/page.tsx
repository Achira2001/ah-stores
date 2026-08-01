"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Guard flag to prevent React StrictMode double execution
  const hasCalledApi = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus({ success: false, message: "No token provided." });
      setLoading(false);
      return;
    }

    if (hasCalledApi.current) return;
    hasCalledApi.current = true;

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();
        setStatus({ success: data.success, message: data.message || data.error });
      } catch (err) {
        setStatus({ success: false, message: "Verification failed. Please try again." });
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-gray-600">Verifying your email...</p>
          </div>
        ) : status?.success ? (
          <div className="space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-sm text-gray-500">{status.message}</p>
            <Link
              href="/login"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
            >
              Continue to Login
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-sm text-gray-500">{status?.message}</p>
            <Link
              href="/register"
              className="inline-block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition"
            >
              Back to Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}