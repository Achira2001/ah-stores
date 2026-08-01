"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    adminSecret: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message);
      } else {
        setError(data.error || "Failed to register");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>

      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Create Account</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Join A H Essentials today</p>

        {error && <div className="p-3 mb-4 text-xs font-bold bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
        {successMsg && <div className="p-3 mb-4 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Account Type</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            >
              <option value="user">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === "admin" && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <ShieldCheck className="w-4 h-4" /> Admin Passcode Required
              </label>
              <input
                type="password"
                required
                placeholder="Enter Secret Admin Key"
                value={formData.adminSecret}
                onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                className="w-full px-3 py-2 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            <span>Sign Up</span>
          </button>
        </form>

        <div className="mt-6 text-center border-t pt-4 text-xs text-gray-500">
          Already registered? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}