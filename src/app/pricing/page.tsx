"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useRazorpay } from "@/hooks/useRazorpay";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PlanId = "starter" | "growth" | "agency";

const PLANS: {
  id: PlanId;
  name: string;
  price: number;
  display: string;
  limit: string;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    display: "₹99",
    limit: "300 messages/mo",
    features: [
      "1 chatbot widget",
      "English + Hindi",
      "Supabase conversation logs",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 499,
    display: "₹499",
    limit: "2,000 messages/mo",
    highlight: true,
    features: [
      "3 chatbot widgets",
      "English, Hindi & Hinglish",
      "WhatsApp integration",
      "Priority support",
      "Custom bot name & color",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: 1999,
    display: "₹1,999",
    limit: "10,000 messages/mo",
    features: [
      "Unlimited widgets",
      "All languages",
      "White-label widget",
      "Dedicated support",
      "Analytics dashboard",
      "Custom domain",
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanId | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setTenantId(session.user.id);
      const { data } = await supabase
        .from("tenants")
        .select("plan")
        .eq("id", session.user.id)
        .single();
      if (data) setCurrentPlan(data.plan as PlanId);
    });
  }, []);

  const { openCheckout, loading } = useRazorpay({
    tenantId: tenantId ?? "",
    onSuccess: (paymentId) => {
      setFeedback({
        type: "success",
        text: `Payment successful! Your plan is being activated. ID: ${paymentId}`,
      });
      setTimeout(() => window.location.reload(), 2500);
    },
    onError: (err) => {
      setFeedback({ type: "error", text: err });
    },
  });

  const handleUpgrade = (planId: PlanId) => {
    if (!tenantId) {
      router.push("/auth");
      return;
    }
    setFeedback(null);
    openCheckout(planId);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-outfit py-24 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <Link href="/" className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Simple Pricing
          </Link>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">
            Start small. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Grow fast.</span>
          </h1>
          <p className="text-lg text-zinc-500 font-medium max-w-2xl mx-auto">
            Transparent plans built for every stage of your business. Pay in INR via UPI, cards, or net banking.
          </p>
        </div>

        {feedback && (
          <div className={`max-w-md mx-auto mb-12 p-4 rounded-2xl text-sm font-medium border animate-in zoom-in-95 duration-300 ${
            feedback.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {feedback.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isHighlight = plan.highlight;

            return (
              <div 
                key={plan.id}
                className={`relative p-10 rounded-[2.5rem] border transition-all flex flex-col ${
                  isHighlight 
                    ? 'bg-zinc-900 border-orange-500/50 shadow-[0_40px_80px_rgba(249,115,22,0.1)] scale-105 z-10' 
                    : 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900/50'
                }`}
              >
                {isHighlight && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20">
                    Most Popular
                  </span>
                )}
                
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-widest text-[10px] mb-2">{plan.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-white tracking-tighter">{plan.display}</span>
                    <span className="text-zinc-500 ml-2 font-bold text-sm">/mo</span>
                  </div>
                  <p className="text-orange-500 font-bold text-xs mt-3 uppercase tracking-wider">{plan.limit}</p>
                </div>

                <ul className="space-y-4 mb-12 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center text-sm text-zinc-400 font-medium">
                      <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center mr-4 shrink-0">
                        <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading || isCurrent}
                  className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 ${
                    isHighlight 
                      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20' 
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
                >
                  <span>
                    {isCurrent ? "Current Plan" : loading ? "Connecting..." : `Select ${plan.name}`}
                  </span>
                  {!loading && !isCurrent && <span className="text-lg">→</span>}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em] mt-16">
          🔒 Secured by Razorpay · UPI, Cards & Net Banking · No hidden fees
        </p>
      </div>
    </div>
  );
}
