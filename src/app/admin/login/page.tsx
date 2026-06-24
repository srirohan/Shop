"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Sparkles, KeyRound, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Invalid email or password.");
      setLoading(false);
      return;
    }
    toast.success("Logged in successfully!");
    router.push("/admin");
    router.refresh();
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset-password`,
    });
    if (error) {
      toast.error("Could not send reset email. Try again.");
    } else {
      setResetSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7ede4] bg-[radial-gradient(#c0622a22_1.5px,transparent_1.5px)] [background-size:32px_32px] relative overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#e8956d]/30 to-[#c0622a]/10 blur-[100px] animate-[float-slow_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-[#dbb99a]/40 to-[#a66a4f]/10 blur-[120px] animate-[float-slow_12s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="relative z-10 w-full">
        <Navbar minimal />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Frosted Glass Login Card */}
          <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-[#3d1f10]/10 border border-white/60 p-10 relative overflow-hidden">
            {/* Inner subtle glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/40 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div className="text-center mb-8 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#c0622a] to-[#e8956d] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#c0622a]/20 transform transition-transform hover:scale-110 duration-300">
                {forgotMode ? (
                  <KeyRound className="text-white" size={28} strokeWidth={2.5} />
                ) : (
                  <Sparkles className="text-white" size={28} strokeWidth={2.5} />
                )}
              </div>
              <h1 className="text-3xl font-black text-[#2a160f] tracking-tight">
                {forgotMode ? "Reset Password" : "Admin Login"}
              </h1>
              <p className="text-[#8b674f] text-sm mt-2 font-medium tracking-wide uppercase">Aradhya Collection</p>
            </div>

            <div className="relative z-10">
              {resetSent ? (
                <div className="text-center space-y-6">
                  <div className="bg-white/60 border border-white rounded-2xl p-6 shadow-sm">
                    <p className="text-[#c0622a] text-base font-bold mb-2">Reset email sent!</p>
                    <p className="text-[#6f5344] text-sm leading-relaxed">
                      Check your inbox at <strong className="text-[#2a160f]">{email}</strong> and follow the link to reset your password.
                    </p>
                  </div>
                  <button
                    onClick={() => { setForgotMode(false); setResetSent(false); }}
                    className="text-sm text-[#a66a4f] hover:text-[#c0622a] font-bold tracking-widest uppercase transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>

              ) : forgotMode ? (
                /* Forgot Password Form */
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <p className="text-[#6f5344] text-sm text-center -mt-2 mb-4">
                    Enter your email and we will send you a reset link.
                  </p>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-[#a66a4f] transition-colors group-focus-within:text-[#c0622a]" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Admin Email"
                      className="w-full pl-12 pr-4 py-3 bg-white/60 border border-white/50 rounded-xl text-sm font-medium text-[#2a160f] placeholder:text-[#a66a4f]/60 focus:outline-none focus:ring-2 focus:ring-[#c0622a]/50 focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#c0622a] to-[#e8956d] hover:shadow-lg hover:shadow-[#c0622a]/20 hover:-translate-y-0.5 text-white font-bold tracking-widest uppercase text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotMode(false)}
                    className="w-full text-xs text-[#8b674f] hover:text-[#c0622a] font-bold tracking-widest uppercase py-2 transition-colors mt-2"
                  >
                    ← Back to Login
                  </button>
                </form>

              ) : (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-[#a66a4f] transition-colors group-focus-within:text-[#c0622a]" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Admin Email"
                      className="w-full pl-12 pr-4 py-3 bg-white/60 border border-white/50 rounded-xl text-sm font-medium text-[#2a160f] placeholder:text-[#a66a4f]/60 focus:outline-none focus:ring-2 focus:ring-[#c0622a]/50 focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-[#a66a4f] transition-colors group-focus-within:text-[#c0622a]" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-12 pr-12 py-3 bg-white/60 border border-white/50 rounded-xl text-sm font-medium text-[#2a160f] placeholder:text-[#a66a4f]/60 focus:outline-none focus:ring-2 focus:ring-[#c0622a]/50 focus:bg-white transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-[#a66a4f] hover:text-[#c0622a] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right -mt-2">
                    <button
                      type="button"
                      onClick={() => setForgotMode(true)}
                      className="text-xs text-[#a66a4f] hover:text-[#c0622a] font-bold tracking-wider transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#c0622a] to-[#e8956d] hover:shadow-lg hover:shadow-[#c0622a]/20 hover:-translate-y-0.5 text-white font-bold tracking-widest uppercase text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Logging in..." : "Login to Dashboard"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

