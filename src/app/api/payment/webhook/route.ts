import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { PLANS, type PlanId } from "../create-order/route";
import { sendPaymentSuccessEmail } from "@/lib/emails";

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Config missing" }, { status: 500 });

  const body = await request.text(); // raw body for signature verification
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  // ── 1. Verify webhook signature ──────────────────────────
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSig !== signature) {
    console.warn("Razorpay webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const eventType: string = event.event;

  // ── 2. Handle payment.captured ───────────────────────────
  if (eventType === "payment.captured") {
    const payment = event.payload.payment.entity;
    const { tenantId, planId } = payment.notes ?? {};

    if (!tenantId || !planId || !PLANS[planId as PlanId]) {
      console.error("Webhook: missing tenantId or planId in notes", payment.notes);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const plan = PLANS[planId as PlanId];
    
    // Generate custom invoice number
    const invoiceNum = `CB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;

    // Activate plan in Supabase & Reset Usage Alerts
    const { error } = await supabase
      .from("tenants")
      .update({
        plan: planId,
        is_active: true,
        message_limit: plan.messageLimit,
        monthly_message_count: 0,           // reset count on plan change
        usage_warning_sent_at: null,        // clear usage alerts
        limit_reached_at: null,             // clear usage alerts
        razorpay_payment_id: payment.id,
        plan_activated_at: new Date().toISOString(),
      })
      .eq("id", tenantId);

    if (error) {
      console.error("Webhook: Supabase update failed", error);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    // Log payment in payments table
    await supabase.from("payments").insert({
      tenant_id: tenantId,
      razorpay_payment_id: payment.id,
      razorpay_order_id: payment.order_id,
      plan: planId,
      amount_paise: payment.amount,
      currency: payment.currency,
      invoice_number: invoiceNum,
      status: "captured",
      paid_at: new Date().toISOString(),
    });

    // 3. Send success email
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("name, email")
      .eq("id", tenantId)
      .single();

    if (tenantData) {
      await sendPaymentSuccessEmail(
        tenantData.email,
        tenantData.name,
        planId,
        payment.amount,
        invoiceNum
      ).catch(console.error);
    }

    console.log(`✅ Payment captured & Email sent: tenant=${tenantId} plan=${planId}`);
    return NextResponse.json({ received: true });
  }

  // ── 3. Handle subscription.cancelled ────────────────────
  if (eventType === "subscription.cancelled") {
    const sub = event.payload.subscription.entity;
    const tenantId = sub.notes?.tenantId;

    if (tenantId) {
      await supabase
        .from("tenants")
        .update({ is_active: false }) // Pause bot if subscription cancelled
        .eq("id", tenantId);

      console.log(`❌ Subscription cancelled for tenant ${tenantId}`);
    }
    return NextResponse.json({ received: true });
  }

  // ── 4. Handle payment.failed ─────────────────────────────
  if (eventType === "payment.failed") {
    const payment = event.payload.payment.entity;
    const { tenantId, planId } = payment.notes ?? {};

    if (tenantId) {
      await supabase.from("payments").insert({
        tenant_id: tenantId,
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        plan: planId ?? "unknown",
        amount_paise: payment.amount,
        currency: payment.currency ?? "INR",
        status: "failed",
        paid_at: new Date().toISOString(),
      });
    }

    console.warn(`❌ Payment failed: tenant=${tenantId}`);
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
