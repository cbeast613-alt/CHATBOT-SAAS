"use client";
// src/app/dashboard/training/page.tsx
// AI Training UI — Pre-filled with smart default data & Premium Dark Theme

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Section {
  id: string;
  icon: string;
  label: string;
  placeholder: string;
  hint: string;
}

const SECTIONS: Section[] = [
  {
    id: "about",
    icon: "🏪",
    label: "About your business",
    placeholder: "Name, location, what you sell, brands you carry.",
    hint: "Name, location, what you sell, brands you carry.",
  },
  {
    id: "hours",
    icon: "🕐",
    label: "Working hours",
    placeholder: "Store timings, holidays, special hours.",
    hint: "Store timings, holidays, special hours.",
  },
  {
    id: "pricing",
    icon: "💰",
    label: "Pricing & offers",
    placeholder: "Price ranges, EMI, payment methods, current offers.",
    hint: "Price ranges, EMI, payment methods, current offers.",
  },
  {
    id: "faq",
    icon: "❓",
    label: "Common questions & answers",
    placeholder: "Write Q&A pairs for questions customers ask most.",
    hint: "Write Q&A pairs for questions customers ask most.",
  },
  {
    id: "tone",
    icon: "🗣️",
    label: "Bot personality & language",
    placeholder: "Tone, language style, how the bot should behave.",
    hint: "Tone, language style, how the bot should behave.",
  },
];

const DEFAULT_DATA: Record<string, string> = {
  about: `Sharma Electronics is a trusted consumer electronics store located in Lajpat Nagar, New Delhi. We have been serving customers since 2005 — over 18 years of experience.

We sell:
• Mobile phones (Samsung, Apple, OnePlus, Vivo, OPPO, Realme)
• Laptops & computers (Dell, HP, Lenovo, ASUS, Apple MacBook)
• Televisions (Samsung, LG, Sony, Mi, Vu)
• Home appliances (ACs, refrigerators, washing machines, microwaves)
• Audio & accessories (earphones, speakers, smartwatches, power banks)

We are authorised dealers for Samsung, LG, and Sony. All products come with official brand warranty. We also stock genuine accessories and spare parts.

Our store address: Shop No. 14, Main Market, Lajpat Nagar-2, New Delhi – 110024.
Contact: +91 98765 43210 | sharma.electronics@gmail.com`,

  hours: `Monday to Saturday: 10:00 AM – 8:30 PM
Sunday: 11:00 AM – 6:00 PM

We are closed on the following national holidays:
• Republic Day (26 January)
• Independence Day (15 August)
• Gandhi Jayanti (2 October)
• Diwali (main day)
• Holi (main day)

During festival season (Diwali, Navratri), we may extend timings to 10:00 PM. Follow our WhatsApp status for updates.

For urgent queries outside hours, WhatsApp us at +91 98765 43210 — we reply within a few hours.`,

  pricing: `Our pricing is competitive and we match prices with major online platforms like Amazon and Flipkart on most products.

Price ranges:
• Mobile phones: ₹6,000 – ₹1,50,000
• Laptops: ₹25,000 – ₹2,00,000
• Televisions: ₹10,000 – ₹3,00,000
• ACs: ₹28,000 – ₹90,000
• Refrigerators: ₹12,000 – ₹80,000

EMI options:
• Zero cost EMI available on purchases above ₹5,000
• EMI tenures: 3, 6, 9, 12, and 24 months
• Available via HDFC, ICICI, SBI, Axis Bank credit cards
• Bajaj Finserv EMI card also accepted — no credit card needed

Payment methods we accept:
• UPI (Google Pay, PhonePe, Paytm, BHIM)
• All debit and credit cards (Visa, Mastercard, RuPay)
• Net banking
• Cash
• No extra charges on any payment method

Current offers:
• 10% instant discount on all ACs — valid till 31 May 2025
• Free Bluetooth earphones worth ₹999 on laptop purchase above ₹50,000
• Exchange offer: Get up to ₹15,000 off on new smartphone with old phone exchange
• Students get 5% additional discount on laptops (college ID required)`,

  faq: `Q: Do you offer home delivery?
A: Yes! We offer free home delivery within 10 km for purchases above ₹2,000. For orders below ₹2,000, a ₹99 delivery charge applies. Delivery is same-day or next-day depending on stock.

Q: Do you do price matching with Amazon or Flipkart?
A: Yes, we match prices with Amazon and Flipkart on most products. Show us the online price and we will match it or beat it.

Q: Do you offer repair services?
A: Yes, we have an in-store service centre open Monday to Saturday, 10 AM to 7 PM. We repair mobiles, laptops, and home appliances. Most mobile repairs are done within 1–2 hours.

Q: Is warranty available on all products?
A: Yes, all products come with official brand warranty. Mobile phones get 1 year warranty, laptops get 1–3 years, and appliances get 1–10 years depending on the brand and product.`,

  tone: `You are a helpful, friendly, and knowledgeable assistant for Sharma Electronics. Think of yourself as a trusted shop assistant who genuinely wants to help the customer find the right product or get their question answered.

LANGUAGE RULES:
• Always reply in the same language the customer uses (Hindi, English, or Hinglish)
• Use "ji" naturally in Hindi/Hinglish (e.g. "Haan ji", "Zaroor ji")
• Keep replies short and to the point — 2 to 4 sentences max

BEHAVIOUR RULES:
• If a customer asks for a product recommendation, ask their budget first
• Always mention EMI options when a customer asks about price
• If you don't know the exact stock availability, say: "Please WhatsApp us at +91 98765 43210 for live stock updates"
• Always end your reply by asking: "Is there anything else I can help you with?"`,
};

import { Globe, FileText, Upload, Link as LinkIcon, Search, CheckCircle, AlertCircle, Zap } from 'lucide-react';

type SectionData = Record<string, string>;
type StatusType = "idle" | "saving" | "saved" | "error" | "testing" | "tested" | "importing";

export default function TrainingPage() {
  const [tenantId, setTenantId]     = useState<string | null>(null);
  const [data, setData]             = useState<SectionData>(DEFAULT_DATA);
  const [status, setStatus]         = useState<StatusType>("idle");
  const [errorMsg, setErrorMsg]     = useState("");
  const [activeSection, setActive]  = useState<string>("about");
  const [testInput, setTestInput]   = useState("");
  const [testReply, setTestReply]   = useState("");
  const [urlInput, setUrlInput]     = useState("");
  const [importType, setImportType] = useState<"website" | "pdf">("website");
  const [charCounts, setCharCounts] = useState<Record<string, number>>(
    Object.fromEntries(Object.entries(DEFAULT_DATA).map(([k, v]) => [k, v.length]))
  );

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/auth"; return; }
      const uid = session.user.id;
      setTenantId(uid);

      const { data: tenant } = await supabase
        .from("tenants")
        .select("business_context")
        .eq("user_id", uid)
        .single();

      if (tenant?.business_context) {
        try {
          const parsed = JSON.parse(tenant.business_context);
          if (typeof parsed === "object") {
            setData(parsed);
            setCharCounts(Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, (v as string).length])));
          }
        } catch {
          setData({ about: tenant.business_context });
          setCharCounts({ about: tenant.business_context.length });
        }
      }
    });
  }, []);

  const handleChange = (sectionId: string, value: string) => {
    setData((d) => ({ ...d, [sectionId]: value }));
    setCharCounts((c) => ({ ...c, [sectionId]: value.length }));
  };

  const handleSave = async () => {
    if (!tenantId) return;
    setStatus("saving");
    setErrorMsg("");

    try {
      const res = await fetch("/api/tenant/update-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tenantId, businessContext: JSON.stringify(data) }),
      });

      if (res.ok) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        throw new Error("Save failed");
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const handleWebsiteImport = async () => {
    if (!urlInput.trim()) return;
    setStatus("importing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      // Append to active section or 'about'
      const currentVal = data[activeSection] || "";
      const newVal = `${currentVal}\n\n--- Source: ${urlInput} ---\n${result.content}`;
      handleChange(activeSection, newVal);
      setStatus("idle");
      setUrlInput("");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("importing");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/pdf-parse", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      const currentVal = data[activeSection] || "";
      const newVal = `${currentVal}\n\n--- Source: ${file.name} ---\n${result.content}`;
      handleChange(activeSection, newVal);
      setStatus("idle");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const handleTest = async () => {
    if (!testInput.trim() || !tenantId) return;
    setStatus("testing");
    setTestReply("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: testInput.trim(), 
          tenantId, 
          history: [],
          preview: true 
        }),
      });
      const d = await res.json();
      setTestReply(d.reply ?? d.error ?? "No response");
    } catch {
      setTestReply("Failed to reach chat API.");
    }
    setStatus("tested");
  };

  const totalChars = Object.values(data).join("").length;
  const activeS = SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-outfit pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">AI Training</h1>
          <p className="text-zinc-500 font-medium">Teach your bot about your business — it uses this to answer customer questions accurately.</p>
        </div>
        <div className="flex items-center space-x-3">
          {status === "error" && (
            <div className="flex items-center space-x-2 text-red-500 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={status === "saving" || status === "importing"}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-500/20"
          >
            {status === "saving" ? "Deploying..." : status === "saved" ? "✓ Saved & Active" : "Save & Activate"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 ml-4">Knowledge Areas</div>
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActive(sec.id)}
              className={`w-full flex items-center space-x-3 p-4 rounded-2xl border transition-all text-left group ${
                activeSection === sec.id 
                  ? "bg-zinc-800 border-orange-500/50 text-white shadow-xl shadow-orange-500/5" 
                  : "bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${activeSection === sec.id ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                {sec.icon}
              </span>
              <span className="flex-1 text-sm font-bold">{sec.label}</span>
              {(data[sec.id] || "").length > 50 && (
                <CheckCircle size={14} className="text-emerald-500" />
              )}
            </button>
          ))}

          <div className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl space-y-4">
            <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              <span>Knowledge Depth</span>
              <span className="text-orange-500">{totalChars.toLocaleString()} chars</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                style={{ width: `${Math.min((totalChars / 10000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 leading-tight">More detailed context results in more helpful and accurate AI responses.</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Advanced Import Card */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Smart Import</h3>
                  <p className="text-sm text-zinc-500 font-medium">Auto-fill knowledge from external sources.</p>
                </div>
              </div>

              <div className="flex bg-zinc-950/50 p-1 rounded-xl border border-zinc-800/50">
                <button 
                  onClick={() => setImportType("website")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${importType === "website" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <Globe size={14} />
                  <span>Website</span>
                </button>
                <button 
                  onClick={() => setImportType("pdf")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${importType === "pdf" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <FileText size={14} />
                  <span>PDF Document</span>
                </button>
              </div>
            </div>

            {importType === "website" ? (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://yourbusiness.com/about"
                    className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-orange-500/30 transition-colors"
                  />
                </div>
                <button 
                  onClick={handleWebsiteImport}
                  disabled={status === "importing" || !urlInput.trim()}
                  className="bg-zinc-100 hover:bg-white text-zinc-900 px-8 py-4 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {status === "importing" && importType === "website" ? (
                    <div className="w-4 h-4 border-2 border-zinc-900/20 border-t-zinc-900 rounded-full animate-spin" />
                  ) : (
                    <LinkIcon size={18} />
                  )}
                  <span>Fetch Content</span>
                </button>
              </div>
            ) : (
              <div className="relative group">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="bg-zinc-950/50 border-2 border-dashed border-zinc-800/50 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 group-hover:border-orange-500/30 transition-colors">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 group-hover:text-orange-500 transition-colors">
                    {status === "importing" && importType === "pdf" ? (
                      <div className="w-6 h-6 border-2 border-zinc-500/20 border-t-orange-500 rounded-full animate-spin" />
                    ) : (
                      <Upload size={24} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">Upload PDF Brochure</p>
                    <p className="text-zinc-600 text-[11px] font-medium mt-1 uppercase tracking-widest">Max size 10MB · Price lists, menu, or details</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Editor Area */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <span className="text-4xl">{activeS.icon}</span>
                <div>
                  <h3 className="text-xl font-black text-white">{activeS.label}</h3>
                  <p className="text-sm text-zinc-500 font-medium">{activeS.hint}</p>
                </div>
              </div>
              <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800/50">
                {charCounts[activeSection]?.toLocaleString() || 0} chars
              </div>
            </div>

            <textarea
              value={data[activeSection] || ""}
              onChange={(e) => handleChange(activeSection, e.target.value)}
              placeholder={activeS.placeholder}
              className="w-full h-[400px] bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-8 text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-orange-500/30 transition-colors text-sm leading-relaxed font-mono custom-scrollbar"
            />
          </div>

          {/* Test Panel */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white">🧪 Live Playground</h3>
                <p className="text-sm text-zinc-500 font-medium">Test your bot live using the saved context above.</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTest()}
                placeholder="Ask your bot a question... (e.g. 'What are your hours?')"
                className="flex-1 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500/30 transition-colors"
              />
              <button
                onClick={handleTest}
                disabled={status === "testing" || !testInput.trim()}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50"
              >
                {status === "testing" ? "Thinking..." : "Test Bot →"}
              </button>
            </div>

            {testReply && (
              <div className="bg-zinc-950/80 border border-zinc-800/50 rounded-2xl p-6 animate-in zoom-in-95 duration-300">
                <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3">AI Response</div>
                <p className="text-zinc-200 text-sm leading-relaxed">{testReply}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
