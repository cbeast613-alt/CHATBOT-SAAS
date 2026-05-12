import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { sendUsageWarningEmail, sendBotPausedEmail } from "@/lib/emails";

interface Tenant {
  id: string;
  business_name: string;
  business_context: string;
  is_active: boolean;
  monthly_message_count: number;
  monthly_message_limit: number;
  plan: string;
  email: string;
  limit_reached_at?: string | null;
}

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
- IMPORTANT: Write naturally without excessive markdown formatting. Avoid using asterisks, bullet points, or numbered lists unless absolutely necessary. Keep responses conversational and easy to read.
- Always provide complete answers to user questions. Never cut off mid-sentence.

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
      console.error("Supabase config missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ error: "Server configuration missing (Supabase)" }, { status: 500 });
    }
    if (!genAI) {
      console.error("AI config missing: GEMINI_API_KEY");
      return NextResponse.json({ error: "AI configuration missing (Gemini API Key)" }, { status: 500 });
    }

    // --- Handle Tenant Lookup ---
    let tenant: Tenant | null = null;
    
    if (tenantId === "demo") {
      tenant = {
        id: "demo",
        business_name: "ChatBot SaaS",
        business_context: "Demo assistant.",
        is_active: true,
        monthly_message_count: 0,
        monthly_message_limit: 1000,
        plan: "demo",
        email: "demo@chatbotsaas.in",
        limit_reached_at: null,
      };
    } else {
      // Try lookup by ID first
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .select("id, business_name, email, business_context, plan, is_active, monthly_message_count, monthly_message_limit, limit_reached_at")
        .eq("id", tenantId)
        .single();

      if (tenantError || !tenantData) {
        // --- Fallback: Try lookup by session (for the owner) ---
        const cookieStore = await cookies();
        const serverSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { cookies: { get(name) { return cookieStore.get(name)?.value; } } }
        );
        const { data: { session } } = await serverSupabase.auth.getSession();
        
        if (session) {
          const { data: sessionTenant } = await supabase
            .from("tenants")
            .select("id, business_name, email, business_context, plan, is_active, monthly_message_count, monthly_message_limit, limit_reached_at")
            .eq("user_id", session.user.id)
            .single();
          
          if (sessionTenant) {
            tenant = sessionTenant;
          }
        }

        if (!tenant) {
          console.warn(`[Chat API] No business profile found for tenantId ${tenantId}. Using default fallback.`);
          // Fallback tenant for new users or trial testing
          tenant = {
            id: tenantId,
            business_name: "AI Assistant",
            business_context: "You are a helpful AI assistant. Answer user questions helpfully, professionally, and concisely.",
            is_active: true,
            monthly_message_count: 0,
            monthly_message_limit: 50,
            plan: "trial",
            email: "support@chatbotsaas.in",
            limit_reached_at: null,
          };
        }
      } else {
        tenant = tenantData;
      }
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
          .filter(([, value]) => (value as string).trim())
          .map(([key, value]) => `## ${key.toUpperCase()}\n${value}`)
          .join("\n\n");
      }
    } catch {
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

    const getErrorMessage = (error: unknown) =>
      error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";

    // --- Multi-model fallback chain ---
    // Updated for May 2026 model inventory
    const MODELS_TO_TRY = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-flash-latest",
    ];

    let responseText = "";
    let lastError: unknown = null;

    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`[Chat API] Attempting model: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
            topP: 0.9,
          },
        });

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(message.trim());
        responseText = result.response.text();
        console.log(`[Chat API] Success with model: ${modelName}`);
        break; // success
      } catch (err: unknown) {
        lastError = err;
        const errorMessage = getErrorMessage(err);
        console.error(`[Chat API] Model ${modelName} failed:`, errorMessage);
        
        // Non-retryable errors
        if (errorMessage.includes("SAFETY") || errorMessage.includes("INVALID_ARGUMENT") || errorMessage.includes("permission")) {
          throw err;
        }
        
        continue; // try next model
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
