import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Config missing" }, { status: 500 });

    // Fetch latest conversations for this tenant
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        started_at,
        messages (
          content,
          role,
          created_at
        )
      `)
      .eq("tenant_id", tenantId)
      .order("started_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Conversations fetch error:", error);
      return NextResponse.json({ data: [] });
    }

    // Format for the dashboard
    const formattedData = data.map((conv: { id: string; started_at: string; messages: { content: string }[] }) => ({
      id: conv.id,
      query: conv.messages?.[0]?.content || "Empty conversation",
      meta: `${new Date(conv.started_at).toLocaleDateString()} · ${conv.messages?.length || 0} messages`
    }));

    return NextResponse.json({ data: formattedData });

  } catch (error) {
    console.error("Conversations API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
