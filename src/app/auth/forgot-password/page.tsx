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
      setMessage({ type: 'success', text: "Check your email for a password reset link." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-outfit flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
            <span className="text-2xl font-bold tracking-tight">ChatBot SaaS</span>
          </Link>
          <h2 className="text-3xl font-black tracking-tight">Reset Password</h2>
          <p className="mt-2 text-zinc-400">Enter your email and we&apos;ll send you a link to reset your password.</p>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/50 py-10 px-6 shadow-2xl backdrop-blur-xl rounded-[2.5rem] sm:px-10">
          <form className="space-y-6" onSubmit={handleReset}>
            <div>
              <label htmlFor="email" className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
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
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="name@company.com"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-bold ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {message.text}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-5 px-4 border border-transparent rounded-2xl shadow-xl shadow-orange-500/20 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 focus:outline-none transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link href="/auth" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
