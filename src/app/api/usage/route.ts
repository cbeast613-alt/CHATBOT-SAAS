import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendUsageWarningEmail, sendBotPausedEmail } from "@/lib/emails";

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

// ── GET: Check usage for a tenant ──────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Config missing" }, { status: 500 });

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("monthly_message_count, message_limit, plan, is_active")
    .eq("id", tenantId)
    .single();

  if (error || !tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const used = tenant.monthly_message_count || 0;
  const limit = tenant.message_limit || 100;
  const percentage = Math.round((used / limit) * 100);

  return NextResponse.json({
    used,
    limit,
    percentage,
    remaining: Math.max(0, limit - used),
    isLimitReached: used >= limit,
    isWarning: percentage >= 80 && percentage < 100,
    isActive: tenant.is_active
  });
}

// ── POST: Increment usage + trigger alerts ───────────────────
// Usually called after a successful chat response
export async function POST(req: Request) {
  try {
    const { tenantId } = await req.json();

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Config missing" }, { status: 500 });

    // 1. Fetch current tenant state
    const { data: tenant, error: fetchError } = await supabase
      .from("tenants")
      .select("id, name, email, plan, monthly_message_count, message_limit, usage_warning_sent_at, limit_reached_at, is_active")
      .eq("id", tenantId)
      .single();

    if (fetchError || !tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // 2. Safely increment message count using RPC
    await supabase.rpc("increment_message_count", { tenant_id_input: tenantId });

    const newCount = (tenant.monthly_message_count || 0) + 1;
    const limit = tenant.message_limit || 100;
    const percentage = Math.round((newCount / limit) * 100);

    // ── Send 80% warning (only once per month/reset) ──────────
    if (percentage >= 80 && percentage < 100 && !tenant.usage_warning_sent_at) {
      await sendUsageWarningEmail(
        tenant.email,
        tenant.name,
        newCount,
        limit,
        tenant.plan
      ).catch(console.error);

      await supabase
        .from("tenants")
        .update({ usage_warning_sent_at: new Date().toISOString() })
        .eq("id", tenantId);
    }

    // ── Pause bot at 100% (only once) ─────────────────────────
    if (newCount >= limit && !tenant.limit_reached_at) {
      await supabase
        .from("tenants")
        .update({ 
          is_active: false,
          limit_reached_at: new Date().toISOString() 
        })
        .eq("id", tenantId);

      await sendBotPausedEmail(
        tenant.email, 
        tenant.name, 
        tenant.plan
      ).catch(console.error);

      return NextResponse.json({
        allowed: false,
        reason: "limit_reached",
        message: "Monthly limit reached. Bot paused.",
        newCount
      });
    }

    return NextResponse.json({
      allowed: true,
      used: newCount,
      limit,
      percentage
    });

  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
