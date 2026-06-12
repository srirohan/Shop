"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, Sparkles, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

function ResetForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const supabase = createClient();

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          toast.error("Invalid or expired reset link. Please request a new one.");
          router.push("/admin/login");
        } else {
          setReady(true);
        }
      });
    } else {
      // Check if already has session (came via callback route)
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setReady(true);
        } else {
          toast.error("Invalid reset link. Please request a new one.");
          router.push("/admin/login");
        }
      });
    }
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("Could not update password. Try again.");
    } else {
      setDone(true);
      setTimeout(() => router.push("/admin/login"), 2500);
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Sparkles className="text-white" size={22} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Set New Password</h1>
        <p className="text-gray-400 text-sm mt-1">Aradhya Collection Admin Panel</p>
      </div>

      {done ? (
        <div className="text-center space-y-3">
          <CheckCircle className="text-green-500 mx-auto" size={40} />
          <p className="text-green-700 font-semibold">Password updated!</p>
          <p className="text-gray-400 text-sm">Redirecting to login...</p>
        </div>
      ) : !ready ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-rose-400" size={28} />
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-rose-50">
      <Navbar minimal />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <Suspense fallback={
            <div className="bg-white rounded-2xl shadow-xl p-8 flex justify-center">
              <Loader2 className="animate-spin text-rose-400" size={28} />
            </div>
          }>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
