"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Users, MessageSquare, Zap } from 'lucide-react';

interface TenantStats {
  id: string;
  business_name: string;
  plan: string;
  monthly_message_limit: number;
  monthly_message_count: number;
  trial_ends_at: string;
  created_at: string;
}



interface RecentConversation {
  id: string;
  query: string;
  meta: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [conversations, setConversations] = useState<RecentConversation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // const chartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const tenantRes = await fetch('/api/tenant/me');
        if (!tenantRes.ok) throw new Error("Failed to fetch tenant");
        
        const tenantData = await tenantRes.json();
        setStats(tenantData);
        
        const [conversationsJson] = await Promise.all([
          fetch(`/api/conversations?tenantId=${tenantData.id}`).then(r => r.json())
        ]);
        
        setConversations(conversationsJson.data || []);

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const scrollToCharts = () => {
    // chartsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getLimit = () => {
    if (stats?.monthly_message_limit) return stats.monthly_message_limit;
    const plan = stats?.plan?.toLowerCase() || 'trial';
    if (plan === 'starter') return 300;
    if (plan === 'pro') return 1000;
    return 50;
  };
  const messageLimit = getLimit();
  const usagePercent = stats ? Math.round((stats.monthly_message_count / messageLimit) * 100) : 0;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-2">Platform Overview</p>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">
            Welcome back, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-600 break-words">
              {stats?.business_name || "Business"}
            </span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={scrollToCharts}
            className="bg-white/5 hover:bg-white/10 text-white px-5 py-3 md:px-8 md:py-4 rounded-2xl font-bold transition-all border border-white/10 backdrop-blur-md text-sm"
          >
            View Analytics
          </button>
          <Link 
            href="/dashboard/billing"
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 md:px-8 md:py-4 rounded-2xl font-black transition-all flex items-center space-x-2 shadow-2xl shadow-orange-500/20 active:scale-95 text-sm"
          >
            <span>Upgrade</span>
            <Zap size={16} fill="white" />
          </Link>
        </div>
      </div>

      {/* Live Chatbot Test Panel - TOP SECTION */}
      <div className="space-y-4 animate-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center space-x-3 px-6 py-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl w-fit">
          <span className="text-lg">💡</span>
          <p className="text-sm font-bold text-orange-400">Try your AI assistant below — test before sharing with customers</p>
        </div>
        {stats?.id && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatTestPanel 
                tenantId={stats.id} 
                businessName={stats.business_name} 
                setConversations={setConversations}
              />
            </div>
            <div className="hidden lg:flex bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 flex-col justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-orange-500/10 rounded-3xl flex items-center justify-center text-3xl mx-auto border border-orange-500/20 shadow-xl shadow-orange-500/5">🤖</div>
              <h4 className="text-xl font-black text-white tracking-tight">AI Training</h4>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                Your assistant learns from the documents and URLs you provide. 
                Keep it smart by updating your knowledge base.
              </p>
              <Link 
                href="/dashboard/training" 
                className="mt-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-widest border border-zinc-700/50"
              >
                Train Assistant
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid - 3 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard 
          label="MONTHLY MESSAGES" 
          value={stats?.monthly_message_count?.toLocaleString() || "0"} 
          subtext={`of ${messageLimit.toLocaleString()} limit`}
          icon={<MessageSquare className="text-orange-500" size={16} />}
        />
        <StatCard 
          label="ACTIVE SESSIONS" 
          value={conversations.length.toString()} 
          subtext="Last 30 days"
          icon={<Users className="text-orange-500" size={16} />}
        />
        <StatCard 
          label="SUBSCRIPTION" 
          value={stats?.plan?.toUpperCase() || "TRIAL"} 
          subtext={stats?.trial_ends_at ? `Ends ${new Date(stats.trial_ends_at).toLocaleDateString()}` : "Active"}
          valueClassName="text-orange-500"
          icon={<TrendingUp className="text-orange-500" size={16} />}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 w-full max-w-xl">
          <div className="h-3 w-24 bg-zinc-800 rounded-full"></div>
          <div className="h-20 w-full bg-zinc-800 rounded-3xl"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-14 w-32 bg-zinc-800 rounded-2xl"></div>
          <div className="h-14 w-32 bg-zinc-800 rounded-2xl"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-44 bg-zinc-800/50 rounded-[2.5rem]"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[450px] bg-zinc-800/30 rounded-[2.5rem]"></div>
        <div className="h-[450px] bg-zinc-800/30 rounded-[2.5rem]"></div>
      </div>
    </div>
  );
}

function ChatTestPanel({ 
  tenantId, 
  businessName, 
  setConversations 
}: { 
  tenantId?: string, 
  businessName?: string, 
  setConversations: (data: any[]) => void 
}) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: `Hi! I'm your AI assistant for ${businessName || 'your business'}. Send me a message to test my responses!` }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !tenantId) return;
    
    const userMessage = input.trim();
    setInput("");
    
    // Add user message to UI immediately
    const updatedMessages: { role: 'user' | 'assistant', content: string }[] = [
      ...messages, 
      { role: 'user', content: userMessage }
    ];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          tenantId,
          history: messages, // Send history BEFORE the new user message (API handles the new one)
          preview: true 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Server error");
      }

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        
        // Refresh conversation list in background
        fetch(`/api/conversations?tenantId=${tenantId}`)
          .then(res => res.json())
          .then(json => setConversations(json.data || []))
          .catch(err => console.error("Conversations refresh failed:", err));
      } else {
        throw new Error("No response from AI");
      }
    } catch (err: any) {
      console.error("Test chat failed:", err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Error: ${err.message || "Please check your AI configuration."}` 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-6 flex flex-col h-full lg:min-h-[480px]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/50 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-orange-500/20">🤖</div>
          <div>
            <h3 className="text-sm font-black text-white leading-tight">Live Test Panel</h3>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bot Online</span>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="h-[280px] overflow-y-auto space-y-4 px-2 mb-6 custom-scrollbar scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' 
                : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/80 p-4 rounded-2xl border border-zinc-700/50 flex space-x-1">
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="relative mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Test your bot here..."
          className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors pr-12"
        />
        <button 
          onClick={handleSend}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
        >
          <span className="text-sm">→</span>
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, valueClassName = "text-white", icon }: { label: string, value: string, subtext: string, valueClassName?: string, icon?: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between min-h-[140px] md:min-h-[180px] hover:bg-zinc-900/50 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/10 transition-colors"></div>
      <div className="absolute top-6 right-6 md:top-8 md:right-8 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 md:mb-4 group-hover:text-zinc-400 transition-colors">{label}</p>
        <p className={`text-2xl md:text-4xl font-black tracking-tighter mb-2 break-words ${valueClassName}`}>{value}</p>
      </div>
      <p className="text-xs md:text-sm text-zinc-500 font-bold group-hover:text-zinc-400 transition-colors">{subtext}</p>
    </div>
  );
}

function ConversationItem({ id, query, meta }: { id: string, query: string, meta: string }) {
  return (
    <Link 
      href={`/dashboard/conversations?id=${id}`}
      className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 flex items-start space-x-6 hover:bg-zinc-900/50 transition-all cursor-pointer group"
    >
      <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
        <span className="text-xl">💬</span>
      </div>
      <div className="space-y-1">
        <p className="text-lg font-medium text-zinc-100 leading-tight truncate max-w-[200px] sm:max-w-none">{query}</p>
        <p className="text-sm text-zinc-500 font-medium">{meta}</p>
      </div>
    </Link>
  );
}
