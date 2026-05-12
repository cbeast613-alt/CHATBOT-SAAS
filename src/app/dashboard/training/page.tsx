"use client";
// src/app/dashboard/training/page.tsx
// AI Training UI — Pre-filled with smart default data & Premium Dark Theme

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Globe, FileText, Upload, Link as LinkIcon, Search, CheckCircle, AlertCircle, Zap, Trash2 } from 'lucide-react';

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

const PLACEHOLDERS: Record<string, string> = {
  about: "Example: Sharma Electronics is a trusted store in Delhi. We sell Samsung, Apple, and Dell products...",
  hours: "Example: Monday to Saturday: 10:00 AM – 8:30 PM. Closed on Sundays.",
  pricing: "Example: Price ranges: ₹6,000 – ₹1,50,000. EMI available via HDFC, SBI cards.",
  faq: "Example: Q: Do you offer home delivery? A: Yes, free home delivery within 10km.",
  tone: "Example: Be helpful and professional. Use 'ji' naturally in Hindi. Keep replies short.",
};

type SectionData = Record<string, string>;
type StatusType = "idle" | "saving" | "saved" | "error" | "testing" | "tested" | "importing";

export default function TrainingPage() {
  const [tenantId, setTenantId]     = useState<string | null>(null);
  const [data, setData]             = useState<SectionData>({
    about: "", hours: "", pricing: "", faq: "", tone: ""
  });
  const [status, setStatus]         = useState<StatusType>("idle");
  const [errorMsg, setErrorMsg]     = useState("");
  const [activeSection, setActive]  = useState<string>("about");
  const [testInput, setTestInput]   = useState("");
  const [testReply, setTestReply]   = useState("");
  const [urlInput, setUrlInput]     = useState("");
  const [importType, setImportType] = useState<"website" | "pdf">("website");
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [charCounts, setCharCounts] = useState<Record<string, number>>({
    about: 0, hours: 0, pricing: 0, faq: 0, tone: 0
  });
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { window.location.href = "/auth"; return; }
        setTenantId(session.user.id);

        const res = await fetch("/api/tenant/me");
        if (!res.ok) throw new Error("Could not fetch tenant data");
        const tenant = await res.json();

        if (tenant?.business_context) {
          try {
            const parsed = JSON.parse(tenant.business_context);
            if (typeof parsed === "object" && parsed !== null) {
              setData(parsed);
              setCharCounts(Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v).length])));
            }
          } catch {
            setData({ about: tenant.business_context });
            setCharCounts({ about: tenant.business_context.length });
          }
        }
      } catch (err) {
        console.error("Training init error:", err);
        setErrorMsg("Failed to load your training data.");
      } finally {
        setLoading(false);
      }
    }
    init();
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
    setScrapeProgress(0);
    setErrorMsg("");

    // Simulate progress
    const interval = setInterval(() => {
      setScrapeProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 5;
      });
    }, 400);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      setScrapeProgress(100);
      const currentVal = data[activeSection] || "";
      const newVal = `${currentVal}\n\n--- Source: ${urlInput} ---\n${result.content}`;
      handleChange(activeSection, newVal);
      
      setTimeout(() => {
        setStatus("idle");
        setUrlInput("");
        setScrapeProgress(0);
      }, 500);
    } catch (err: unknown) {
      setStatus("error");
      setScrapeProgress(0); // Reset progress on failure
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      clearInterval(interval);
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

  const handleClearSection = () => {
    const confirmed = window.confirm("Are you sure? This cannot be undone.");
    if (confirmed) {
      handleChange(activeSection, "");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

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
              <div className="space-y-4">
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
                {status === "importing" && importType === "website" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-orange-500 uppercase tracking-widest">
                      <span>Scraping URL...</span>
                      <span>{scrapeProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-300" 
                        style={{ width: `${scrapeProgress}%` }}
                      />
                    </div>
                  </div>
                )}
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
                    <p className="text-white font-bold text-sm">
                      {status === "importing" && importType === "pdf" ? "Processing..." : "Upload PDF Brochure"}
                    </p>
                    <p className="text-zinc-600 text-[11px] font-medium mt-1 uppercase tracking-widest">
                      {status === "importing" && importType === "pdf" ? "This may take a moment" : "Max size 10MB · Price lists, menu, or details"}
                    </p>
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
                  <p className="text-sm text-zinc-500 font-medium">
                    {data[activeSection] ? activeS.hint : "Start by adding your business information below"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleClearSection}
                  className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Clear Section"
                >
                  <Trash2 size={18} />
                </button>
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800/50">
                  {charCounts[activeSection]?.toLocaleString() || 0} chars
                </div>
              </div>
            </div>

            <textarea
              value={data[activeSection] || ""}
              onChange={(e) => handleChange(activeSection, e.target.value)}
              placeholder={PLACEHOLDERS[activeSection]}
              className="w-full h-[400px] bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-8 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-orange-500/30 transition-colors text-sm leading-relaxed font-mono custom-scrollbar"
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
