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
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const full = searchParams.get("full") === "true";

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Config missing" }, { status: 500 });

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
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Conversations fetch error:", error);
      return NextResponse.json({ data: [] });
    }

    if (full) {
      return NextResponse.json({ data });
    }

    // Format for lightweight dashboard stats
    const formattedData = data.map((conv: any) => ({
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

export async function DELETE(request: Request) {
  try {
    const { conversationId } = await request.json();

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Config missing" }, { status: 500 });

    // Messages have ON DELETE CASCADE usually, but let's be safe
    await supabase.from("messages").delete().eq("conversation_id", conversationId);
    
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
