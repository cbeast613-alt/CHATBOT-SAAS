import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendUsageWarningEmail, sendBotPausedEmail } from "@/lib/emails";

const getGenAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
};

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

// ... (SYSTEM_PROMPT stays the same)
const SYSTEM_PROMPT = `You are a helpful AI assistant for an Indian business. 
- Respond naturally in the same language the user writes in (English, Hindi, or Hinglish).
- Be warm, friendly, and culturally aware of Indian context.
- Keep responses concise and helpful.
- If asked about pricing, mention amounts in Indian Rupees (₹).
- You represent the business whose context is provided below.

Business Context:
{BUSINESS_CONTEXT}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId, tenantId, history = [], preview = false } = body;

    // --- Validation ---
    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const genAI = getGenAI();

    if (!supabase) {
      return NextResponse.json({ error: "Supabase configuration missing (SERVICE_ROLE_KEY or URL)" }, { status: 500 });
    }
    if (!genAI) {
      return NextResponse.json({ error: "AI configuration missing (GEMINI_API_KEY)" }, { status: 500 });
    }

    // --- Handle Demo Mode for Landing Page ---
    let tenant: any = null;
    if (tenantId === "demo") {
      tenant = {
        id: "demo",
        business_name: "ChatBot SaaS",
        business_context: "You are a demo assistant for ChatBot SaaS. Our platform helps Indian businesses automate customer support using AI. We support English, Hindi, and Hinglish. Pricing starts at ₹99/month. Features include WhatsApp integration, lead generation, and website scraping. We have 3 plans: Starter, Growth, and Agency.",
        is_active: true,
        monthly_message_count: 0,
        monthly_message_limit: 1000,
        plan: "demo"
      };
    } else {
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .select("id, business_name, email, business_context, plan, is_active, monthly_message_count, monthly_message_limit, limit_reached_at")
        .eq("id", tenantId)
        .single();

      if (tenantError || !tenantData) {
        return NextResponse.json({ error: "Invalid tenant" }, { status: 403 });
      }
      tenant = tenantData;
    }

    if (!tenant.is_active) {
      return NextResponse.json(
        { error: "Your chatbot is currently paused. Please check your billing or quota." },
        { status: 403 }
      );
    }

    // --- Check message quota ---
    if (tenant.monthly_message_count >= tenant.monthly_message_limit) {
      return NextResponse.json(
        {
          error: "Monthly message limit reached. Please upgrade your plan.",
          upgrade_url: "/pricing",
        },
        { status: 429 }
      );
    }

    // --- Build system prompt with tenant context ---
    let formattedContext = tenant.business_context || `You are an assistant for ${tenant.business_name}.`;
    
    try {
      const parsed = JSON.parse(tenant.business_context);
      if (typeof parsed === "object") {
        formattedContext = Object.entries(parsed)
          .filter(([_, value]) => (value as string).trim())
          .map(([key, value]) => `## ${key.toUpperCase()}\n${value}`)
          .join("\n\n");
      }
    } catch (e) {
      // Not JSON, use as-is
    }

    const systemPrompt = SYSTEM_PROMPT.replace(
      "{BUSINESS_CONTEXT}",
      formattedContext
    );

    // --- Map history to Gemini format ---
    const chatHistory = history
      .filter((msg: { role: string; content: string }) => msg.role && msg.content)
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // Gemini requires history to start with 'user', not 'model'
    if (chatHistory.length > 0 && chatHistory[0].role === "model") {
      chatHistory.shift();
    }

    // --- Multi-model fallback chain ---
    // Try models in order until one works (quota issues auto-handled)
    const MODELS_TO_TRY = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-1.5-pro-latest",
      "gemini-1.5-pro",
      "gemini-2.0-flash-exp",
      "gemini-pro",
    ];

    let responseText = "";
    let lastError: any = null;

    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
            topP: 0.9,
          },
        });

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(message.trim());
        responseText = result.response.text();
        break; // success — stop trying more models
      } catch (err: any) {
        lastError = err;
        const isQuotaErr = err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("404");
        if (isQuotaErr) {
          continue; // try next model
        } else {
          throw err; // non-quota error — stop immediately
        }
      }
    }

    if (!responseText) throw lastError;

    // --- Save conversation & Update Usage (Only if NOT a preview) ---
    let conversationId = sessionId;

    if (!preview && tenantId !== "demo") {
      if (!conversationId) {
        const { data: conversation, error: convError } = await supabase
          .from("conversations")
          .insert({
            tenant_id: tenantId,
            started_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (!convError && conversation) {
          conversationId = conversation.id;
        }
      }

      if (conversationId) {
        // Save messages
        await supabase.from("messages").insert([
          { conversation_id: conversationId, tenant_id: tenantId, role: "user", content: message.trim() },
          { conversation_id: conversationId, tenant_id: tenantId, role: "assistant", content: responseText },
        ]);

        // --- Usage Logic ---
        const newCount = (tenant.monthly_message_count || 0) + 1;
        const limit = tenant.monthly_message_limit || 100;
        const percentage = Math.round((newCount / limit) * 100);

        // Increment in DB
        await supabase.rpc("increment_message_count", { tenant_id_input: tenantId });

        // 80% Warning
        if (percentage >= 80 && percentage < 100) {
          sendUsageWarningEmail(tenant.email, tenant.business_name, newCount, limit, tenant.plan).catch(console.error);
        }

        // 100% Pause
        if (newCount >= limit && !tenant.limit_reached_at) {
          await supabase.from("tenants").update({ 
            is_active: false, 
            limit_reached_at: new Date().toISOString() 
          }).eq("id", tenantId);
          sendBotPausedEmail(tenant.email, tenant.business_name, tenant.plan).catch(console.error);
        }
      }
    }

    return NextResponse.json({
      reply: responseText,
      sessionId: conversationId,
    });

  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Chat API error:", err);

    // Handle Gemini-specific errors
    if (err.message?.includes("SAFETY")) {

      return NextResponse.json(
        { error: "Message blocked by safety filters. Please rephrase." },
        { status: 400 }
      );
    }

    if (err.message?.includes("quota") || err.message?.includes("429")) {
      return NextResponse.json(
        { error: `[Quota/Rate limit] ${err.message}` },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Something went wrong. Please try again." },
      { status: 500 }
    );

  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "chatbot-api" });
}
