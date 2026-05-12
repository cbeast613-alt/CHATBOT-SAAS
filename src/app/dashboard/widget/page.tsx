"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import ChatWidget from "@/components/ChatWidget";
import { useDashboard } from "@/context/DashboardContext";

const PRESET_COLORS = [
  "#f97316", // Orange
  "#3b82f6", // Blue
  "#10b981", // Green
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
];

export default function WidgetConfigurator() {
  const [tenantId, setTenantId] = useState("");
  const [botName, setBotName] = useState("Support");
  const [welcomeMessage, setWelcomeMessage] = useState("Namaste! 👋 How can I help you today?");
  const [placeholder, setPlaceholder] = useState("Type your message...");
  const [brandColor, setBrandColor] = useState("#f97316");
  
  const { isDirty, setIsDirty } = useDashboard();
  const [initialConfig, setInitialConfig] = useState({
    botName: "Support",
    welcomeMessage: "Namaste! 👋 How can I help you today?",
    placeholder: "Type your message...",
    brandColor: "#f97316"
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update global dirty state
  useEffect(() => {
    const dirty = 
      botName !== initialConfig.botName || 
      welcomeMessage !== initialConfig.welcomeMessage || 
      placeholder !== initialConfig.placeholder || 
      brandColor !== initialConfig.brandColor;
    setIsDirty(dirty);
  }, [botName, welcomeMessage, placeholder, brandColor, initialConfig, setIsDirty]);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch("/api/tenant/me");
        if (!res.ok) throw new Error("Failed to fetch config");
        const data = await res.json();

        if (data) {
          const fetched = {
            botName: data.chatbot_name || data.business_name || "Support",
            brandColor: data.chatbot_color || "#f97316",
            welcomeMessage: data.chatbot_welcome || "Namaste! 👋 How can I help you today?",
            placeholder: data.chatbot_placeholder || "Type your message..."
          };
          
          setTenantId(data.id);
          setBotName(fetched.botName);
          setBrandColor(fetched.brandColor);
          setWelcomeMessage(fetched.welcomeMessage);
          setPlaceholder(fetched.placeholder);
          setInitialConfig(fetched);
        }
      } catch (err) {
        console.error("Widget fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  // Browser-level unsaved changes warning (refresh/close tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ""; // Standard way to trigger browser dialog
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/tenant/update-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          config: {
            chatbot_name: botName,
            chatbot_color: brandColor,
            chatbot_welcome: welcomeMessage,
            chatbot_placeholder: placeholder,
          }
        }),
      });

      if (res.ok) {
        setInitialConfig({ botName, welcomeMessage, placeholder, brandColor });
        alert("Configuration saved!");
      } else {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    const code = `<script 
  src="${window.location.origin}/widget-loader.js" 
  data-tenant-id="${tenantId}"
  data-color="${brandColor}"
  data-bot-name="${botName}"
  data-welcome="${welcomeMessage}"
></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-1">Widget configurator</h1>
          <p className="text-zinc-500 font-medium">Customise, preview, then paste one line into any website.</p>
        </div>
        <div className="flex items-center space-x-4">
          {isDirty && (
            <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Unsaved Changes</span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 ${
              isDirty 
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20" 
                : "bg-zinc-100 hover:bg-white text-zinc-900"
            }`}
          >
            {saving ? "Saving..." : "Save config"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Panel: Configuration */}
        <div className="space-y-8">
          {/* Identity */}
          <section className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] p-8 space-y-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Identity</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Bot Name</label>
                <input 
                  type="text" 
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Welcome Message</label>
                <input 
                  type="text" 
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Input Placeholder</label>
                <input 
                  type="text" 
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Brand Colour */}
          <section className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] p-8 space-y-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Brand Colour</h3>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBrandColor(color)}
                    className={`w-10 h-10 rounded-xl transition-all ${brandColor === color ? 'ring-4 ring-white/20 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-4">
                <div 
                  className="w-10 h-10 rounded-xl border border-zinc-800"
                  style={{ backgroundColor: brandColor }}
                />
                <input 
                  type="text" 
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors uppercase font-mono"
                />
              </div>
            </div>
          </section>

          {/* Embed Code */}
          <section className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] p-8 space-y-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Embed Code</h3>
            <p className="text-sm text-zinc-500 font-medium">
              Paste before the closing <code className="text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">&lt;/body&gt;</code> tag of any webpage.
            </p>
            <div className="relative group">
              <pre className="bg-zinc-950/50 border border-zinc-800/50 rounded-3xl p-6 text-[11px] font-mono text-zinc-400 overflow-x-auto leading-relaxed">
                {`<script 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget-loader.js" 
  data-tenant-id="${tenantId}"
  data-color="${brandColor}"
  data-bot-name="${botName}"
  data-welcome="${welcomeMessage}"
></script>`}
              </pre>
              <button 
                onClick={copyToClipboard}
                className="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </section>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Live Preview</h3>
          <div className="relative aspect-[4/5] bg-zinc-900/30 border border-zinc-800/50 rounded-[3rem] overflow-hidden group">
            {/* Browser Header Mockup */}
            <div className="bg-zinc-950/50 border-b border-zinc-800/50 p-4 flex items-center space-x-4">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
              </div>
              <div className="flex-1 bg-zinc-900/50 rounded-lg px-4 py-1.5 text-[10px] text-zinc-600 font-medium truncate">
                yourwebsite.com
              </div>
            </div>

            {/* Content Mockup */}
            <div className="p-8 space-y-4">
              <div className="h-4 bg-zinc-800/50 rounded-full w-3/4"></div>
              <div className="h-4 bg-zinc-800/50 rounded-full w-1/2"></div>
              <div className="h-4 bg-zinc-800/50 rounded-full w-2/3"></div>
            </div>

            {/* The Actual Widget Preview */}
            <div className="absolute inset-0 pointer-events-auto scale-75 origin-bottom-right">
              <ChatWidget 
                tenantId={tenantId}
                botName={botName}
                welcomeMessage={welcomeMessage}
                placeholder={placeholder}
                primaryColor={brandColor}
                isPreview={true}
              />
            </div>

            {/* Visual Overlay to indicate preview mode */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
