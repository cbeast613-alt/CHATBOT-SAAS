"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: "Verification link sent! Please check your inbox (and spam folder) for instructions to reset your password." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-outfit flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px]"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-10 px-4">
          <Link href="/" className="inline-flex items-center space-x-3 mb-12 group">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)] group-hover:scale-110 transition-transform"></div>
            <span className="text-2xl font-black tracking-tighter">ChatBot SaaS</span>
          </Link>
          <h2 className="text-4xl font-black tracking-tighter mb-4">Forgotten Password?</h2>
          <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">No worries! Enter your registered email and we&apos;ll send you a secure link to reset it.</p>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/50 py-12 px-6 shadow-2xl backdrop-blur-xl rounded-[2.5rem] sm:px-12 mx-4">
          <form className="space-y-8" onSubmit={handleReset}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                placeholder="name@company.com"
              />
            </div>

            {message && (
              <div className={`p-5 rounded-2xl text-sm font-bold border animate-in zoom-in-95 duration-300 ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {message.text}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-5 px-4 border border-transparent rounded-2xl shadow-2xl shadow-orange-500/20 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 focus:outline-none transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Sending link..." : "Send Reset Link →"}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <Link href="/auth" className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em] hover:text-white transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
