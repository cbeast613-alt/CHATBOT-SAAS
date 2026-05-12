import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export async function POST(request: Request) {
  try {
    const { userId, config } = await request.json();

    if (!userId || !config) {
      return NextResponse.json({ error: "Missing userId or config" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Config missing" }, { status: 500 });

    const { error } = await supabase
      .from("tenants")
      .update({
        chatbot_name: config.chatbot_name,
        chatbot_color: config.chatbot_color,
        chatbot_welcome: config.chatbot_welcome,
      })
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update config error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
