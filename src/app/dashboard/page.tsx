"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
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

interface AnalyticsData {
  date: string;
  count: number;
}

interface RecentConversation {
  id: string;
  query: string;
  meta: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<RecentConversation[]>([]);
  const [mounted, setMounted] = useState(false);
  
  const chartsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const tenantRes = await fetch('/api/tenant/me');
        if (!tenantRes.ok) throw new Error("Failed to fetch tenant");
        
        const tenantData = await tenantRes.json();
        setStats(tenantData);
        
        Promise.all([
          fetch(`/api/analytics?tenantId=${tenantData.id}`).then(r => r.json()),
          fetch(`/api/conversations?tenantId=${tenantData.id}`).then(r => r.json())
        ]).then(([analyticsJson, conversationsJson]) => {
          setAnalytics(analyticsJson.data || []);
          setConversations(conversationsJson.data || []);
        }).catch(err => console.error("Parallel fetch failed:", err));

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const scrollToCharts = () => {
    chartsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const usagePercent = Math.round(((stats?.monthly_message_count || 0) / (stats?.monthly_message_limit || 50)) * 100);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
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

      <div className="h-px bg-zinc-800/30 w-full"></div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          label="MONTHLY MESSAGES" 
          value={stats?.monthly_message_count?.toLocaleString() || "0"} 
          subtext={`of ${stats?.monthly_message_limit?.toLocaleString() || "50"} limit`}
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
        <StatCard 
          label="BOT PERFORMANCE" 
          value="99.2%" 
          subtext="Uptime & Accuracy"
          valueClassName="text-emerald-500"
          icon={<Zap className="text-emerald-500" size={16} />}
        />
      </div>

      {/* Analytics & Live Test Panel */}
      <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 scroll-mt-10">
        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 space-y-6 md:space-y-8 h-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Message Volume</h3>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">Last 7 Days</p>
            </div>
            <div className="flex items-center space-x-2 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20">
              <TrendingUp size={14} className="text-orange-500" />
              <span className="text-xs font-black text-orange-500">+12%</span>
            </div>
          </div>

          <div className="h-[350px] w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.length > 0 ? analytics : [
                { date: '1 May', count: 4 },
                { date: '2 May', count: 12 },
                { date: '3 May', count: 8 },
                { date: '4 May', count: 18 },
                { date: '5 May', count: 15 },
                { date: '6 May', count: 24 },
                { date: '7 May', count: stats?.monthly_message_count || 0 },
              ]}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#f97316', fontWeight: 800, fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Live Chatbot Test Panel */}
        {stats?.id && (
          <ChatTestPanel 
            tenantId={stats.id} 
            businessName={stats.business_name} 
            setConversations={setConversations}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usage Progress */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col justify-between h-full">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Quota Status</h3>
            
            <div className="relative flex items-center justify-center h-48">
              <svg className="w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-800" />
                <circle
                  cx="50%" cy="50%" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                  strokeDasharray={`${(usagePercent / 100) * 440} 440`}
                  strokeLinecap="round"
                  className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{usagePercent}%</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Used</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-zinc-500">{stats?.monthly_message_count?.toLocaleString() || "0"} used</span>
                <span className="text-zinc-500">{(stats?.monthly_message_limit || 50) - (stats?.monthly_message_count || 0)} remaining</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${usagePercent}%` }}></div>
              </div>
            </div>
          </div>
          <Link 
            href="/dashboard/billing"
            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-xs font-bold transition-all uppercase tracking-widest mt-8 text-center"
          >
            Manage Quota
          </Link>
        </div>

        {/* Recent Conversations */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 space-y-6 h-full">
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
          <div className="space-y-4">
            {conversations.length > 0 ? (
              conversations.map((conv, i) => (
                <ConversationItem 
                  key={i}
                  id={conv.id}
                  query={conv.query} 
                  meta={conv.meta}
                />
              ))
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="text-4xl">📭</div>
                <p className="text-sm font-bold text-zinc-500">No activity yet. Start a test chat!</p>
              </div>
            )}
          </div>
        </div>
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
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          tenantId,
          history: messages,
          preview: true // Doesn't count towards quota
        })
      });

      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        
        // Refresh conversations list in the parent
        fetch(`/api/conversations?tenantId=${tenantId}`)
          .then(res => res.json())
          .then(json => setConversations(json.data || []))
          .catch(err => console.error("Conversations refresh failed:", err));
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I hit a snag. Please check your AI configuration." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Make sure your API is live." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-6 flex flex-col h-[500px] lg:h-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/50">
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
        className="flex-1 overflow-y-auto space-y-4 px-2 mb-6 custom-scrollbar"
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
        <p className="text-lg font-medium text-zinc-100 leading-tight">{query}</p>
        <p className="text-sm text-zinc-500 font-medium">{meta}</p>
      </div>
    </Link>
  );
}
