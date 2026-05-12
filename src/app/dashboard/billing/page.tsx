"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const router = useRouter();
  const [plan, setPlan] = useState("Starter");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const res = await fetch("/api/tenant/me");
        if (!res.ok) throw new Error("Failed to fetch plan");
        const data = await res.json();
        
        if (data) {
          setPlan(data.plan.charAt(0).toUpperCase() + data.plan.slice(1));
        }
      } catch (err) {
        console.error("Billing fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-1">Billing</h1>
        <p className="text-zinc-500 font-medium">Manage your subscription and payments</p>
      </div>

      <div className="h-px bg-zinc-800/50 w-full"></div>

      {/* Current Plan Card */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Plan</p>
          <h2 className="text-3xl font-bold text-orange-500">{plan}</h2>
          <p className="text-zinc-400 font-medium font-outfit">Billed monthly (Secure payments via Razorpay)</p>
        </div>
        <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-bold transition-all border border-zinc-700/50">
          Cancel subscription
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PricingCard 
          name="Starter" 
          price="₹99" 
          features={["300 Messages/mo", "Standard AI", "Email Support"]}
          isCurrent={plan === "Starter"}
          onUpgrade={() => router.push("/pricing")}
        />
        <PricingCard 
          name="Growth" 
          price="₹499" 
          features={["Unlimited Messages*", "Pro AI", "WhatsApp Integration", "No Branding"]}
          isCurrent={plan === "Growth"}
          highlight
          onUpgrade={() => router.push("/pricing")}
        />
        <PricingCard 
          name="Agency" 
          price="₹1,999" 
          features={["All Growth Features", "White-label Dashboard", "Sub-client Management"]}
          isCurrent={plan === "Agency"}
          onUpgrade={() => router.push("/pricing")}
        />
      </div>
    </div>
  );
}

function PricingCard({ name, price, features, isCurrent, highlight = false, onUpgrade }: { name: string, price: string, features: string[], isCurrent: boolean, highlight?: boolean, onUpgrade: () => void }) {
  return (
    <div className={`p-8 rounded-[2rem] border transition-all flex flex-col ${
      highlight 
        ? "bg-zinc-900/50 border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.1)] scale-[1.02]" 
        : "bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900/40"
    }`}>
      <div className="mb-8">
        <h3 className="text-xl font-bold text-zinc-100 mb-2">{name}</h3>
        <div className="flex items-baseline">
          <span className="text-4xl font-extrabold text-white">{price}</span>
          <span className="text-zinc-500 ml-1">/mo</span>
        </div>
      </div>
      
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center text-sm text-zinc-400 font-medium">
            <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <button 
        disabled={isCurrent}
        onClick={onUpgrade}
        className={`w-full py-4 rounded-2xl font-bold transition-all ${
          isCurrent 
            ? "bg-zinc-800 text-zinc-500 cursor-default" 
            : highlight 
              ? "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
              : "bg-zinc-800 text-white hover:bg-zinc-700"
        }`}
      >
        {isCurrent ? "Current Plan" : "Upgrade"}
      </button>
    </div>
  );
}
