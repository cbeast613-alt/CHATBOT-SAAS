"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tab = "login" | "signup";
type Plan = "starter" | "growth" | "agency";

const PLANS: { id: Plan; name: string; price: string; limit: number }[] = [
  { id: "starter", name: "Starter", price: "₹99", limit: 300 },
  { id: "growth",  name: "Growth",  price: "₹499", limit: 2000 },
  { id: "agency",  name: "Agency",  price: "₹1,999", limit: 10000 },
];

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [plan, setPlan] = useState<Plan>("growth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Welcome back! Redirecting to dashboard..." });
      setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!businessName.trim()) {
        throw new Error("Please enter your business name.");
      }

      const selectedPlan = PLANS.find((p) => p.id === plan)!;

      // Call the new Server-Side Signup API
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          businessName: businessName.trim(),
          plan,
          messageLimit: selectedPlan.limit,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed.");
      }

      // Success feedback
      setMessage({
        type: "success",
        text: data.message || "Account created! You can now log in.",
      });
      
      // Send welcome email (Non-blocking)
      fetch("/api/emails/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: businessName.trim() }),
      }).catch(err => console.error("Welcome email trigger failed:", err));

      // Auto-switch to login tab after success
      setTimeout(() => setTab("login"), 2500);

    } catch (err: any) {
      console.error("Signup process failed:", err);
      setMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-outfit flex flex-col md:flex-row">
      {/* Left Side: Branding & Info */}
      <div className="md:w-1/2 bg-zinc-950/50 p-12 lg:p-24 flex flex-col justify-between border-r border-zinc-800/30">
        <div>
          <Link href="/" className="flex items-center space-x-3 mb-16">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
            <span className="text-xl font-bold tracking-tight text-white">ChatBot SaaS</span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9]">
              The smart way to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">scale support.</span>
            </h1>
            <p className="text-xl text-zinc-500 font-medium max-w-sm">
              Join 500+ Indian businesses automating their customer support with AI.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-16 border-t border-zinc-800/30">
          <div>
            <p className="text-2xl font-black text-orange-500">10K+</p>
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-1">Messages/Day</p>
          </div>
          <div>
            <p className="text-2xl font-black text-orange-500">₹99</p>
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-1">To Start</p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative overflow-hidden">
        {/* Animated Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -z-10"></div>

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Tabs */}
          <div className="flex p-1.5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${tab === "login" ? "bg-zinc-800 text-white shadow-xl" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Log in
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${tab === "signup" ? "bg-zinc-800 text-white shadow-xl" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Sign up
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-sm font-medium border animate-in zoom-in-95 duration-300 ${
              message.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={tab === "login" ? handleLogin : handleSignup} className="space-y-6">
            {tab === "signup" && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Sharma Electronics"
                  className="w-full bg-zinc-900/30 border border-zinc-800/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className="w-full bg-zinc-900/30 border border-zinc-800/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900/30 border border-zinc-800/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>

            {tab === "signup" && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Select Plan</label>
                <div className="grid grid-cols-3 gap-3">
                  {PLANS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlan(p.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        plan === p.id 
                          ? "bg-orange-500/10 border-orange-500/50" 
                          : "bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900/50"
                      }`}
                    >
                      <p className="text-xs font-bold text-white mb-1">{p.name}</p>
                      <p className={`text-sm font-black ${plan === p.id ? "text-orange-500" : "text-zinc-500"}`}>{p.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? "Processing..." : tab === "login" ? "Log in" : "Start Free Trial"}</span>
              {!loading && <span className="text-lg">→</span>}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-zinc-600">
            {tab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setTab(tab === "login" ? "signup" : "login")}
              className="text-orange-500 hover:text-orange-400 transition-colors"
            >
              {tab === "login" ? "Sign up free" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
