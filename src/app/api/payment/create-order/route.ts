import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const getRazorpay = () => {
  const id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) return null;
  return new Razorpay({ key_id: id, key_secret: secret });
};

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

// Plan definitions — single source of truth
export const PLANS = {
  starter: { name: "Starter", amountPaise: 9900,  messageLimit: 300   },
  growth:  { name: "Growth",  amountPaise: 49900, messageLimit: 2000  },
  agency:  { name: "Agency",  amountPaise: 199900, messageLimit: 10000 },
} as const;

export type PlanId = keyof typeof PLANS;

export async function POST(request: Request) {
  try {
    const razorpay = getRazorpay();
    const supabase = getSupabase();

    if (!razorpay || !supabase) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }

    const { planId, tenantId } = await request.json();

    if (!planId || !PLANS[planId as PlanId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId required" }, { status: 400 });
    }

    // Verify tenant exists
    const { data: tenant, error } = await supabase
      .from("tenants")
      .select("id, name, email")
      .eq("id", tenantId)
      .single();

    if (error || !tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const plan = PLANS[planId as PlanId];

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: plan.amountPaise,   // in paise (₹99 = 9900)
      currency: "INR",
      receipt: `receipt_${tenantId}_${Date.now()}`,
      notes: {
        tenantId,
        planId,
        tenantEmail: tenant.email,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order. Please try again." },
      { status: 500 }
    );
  }
}
