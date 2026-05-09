import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

interface DailyMessageStat {
  count: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Config missing" }, { status: 500 });

    // Fetch message counts grouped by day for the last 7 days
    const { data, error } = await supabase.rpc<DailyMessageStat[]>("get_daily_message_stats", {
      tenant_id_input: tenantId,
      days_limit: 7
    });

    if (error) {
      // Fallback if RPC doesn't exist yet (return empty data)
      console.error("Analytics RPC error:", error);
      return NextResponse.json({ 
        data: [], 
        totalMessages: 0,
        avgResponseTime: "1.2s" 
      });
    }

    const stats = data ?? [];
    const totalMessages = stats.reduce((acc, curr) => acc + (curr?.count ?? 0), 0);

    return NextResponse.json({
      data: stats,
      totalMessages,
      avgResponseTime: "0.8s" // Placeholder for now
    });

  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
