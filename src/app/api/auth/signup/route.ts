import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

const PLAN_LIMITS: Record<string, number> = {
  starter: 300,
  growth: 2000,
  agency: 10000,
};

export async function POST(request: Request) {
  try {
    const { email, password, businessName, plan = "starter", messageLimit } = await request.json();

    if (!email || !password || !businessName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }

    const selectedPlan = PLAN_LIMITS[plan] ? plan : "starter";
    const selectedLimit = typeof messageLimit === "number" && messageLimit > 0
      ? messageLimit
      : PLAN_LIMITS[selectedPlan];

    // 1. Create the Auth User using Admin API (Bypasses confirmation for profile creation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { business_name: businessName },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Create the Tenant entry using Admin client (Bypasses RLS)
    const { error: tenantError } = await supabaseAdmin.from("tenants").insert({
      user_id: userId,
      business_name: businessName,
      email: email,
      plan: plan,
      is_active: true,
      monthly_message_count: 0,
      monthly_message_limit: messageLimit,
      messages_limit: messageLimit,
      plan_status: "active",
      subscription_status: "trial",
      plan_started_at: new Date().toISOString(),
    });

    if (tenantError) {
      // Cleanup: Delete the auth user if tenant creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Profile setup failed: " + tenantError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Account created successfully! You can now log in." 
    });

  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
