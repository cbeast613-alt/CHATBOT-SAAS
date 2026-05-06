"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
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

export default function Dashboard() {
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: tenantData } = await supabase
        .from("tenants")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (tenantData) {
        setStats(tenantData);
        
        // Fetch Analytics
        const res = await fetch(`/api/analytics?tenantId=${tenantData.id}`);
        const analyticsJson = await res.json();
        setAnalytics(analyticsJson.data || []);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const usagePercent = Math.round(((stats?.monthly_message_count || 0) / (stats?.monthly_message_limit || 50)) * 100);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-1">Overview</h1>
          <p className="text-zinc-500 font-medium">{stats?.business_name || "Business Name"}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">System Live</span>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center space-x-2 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <span>Upgrade plan</span>
            <Zap size={18} fill="white" />
          </button>
        </div>
      </div>

      <div className="h-px bg-zinc-800/50 w-full"></div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="MESSAGES THIS MONTH" 
          value={stats?.monthly_message_count?.toLocaleString() || "0"} 
          subtext={`of ${stats?.monthly_message_limit?.toLocaleString() || "50"} limit`}
          icon={<MessageSquare className="text-orange-500" size={16} />}
        />
        <StatCard 
          label="CONVERSATIONS" 
          value="84" 
          subtext="Total unique sessions"
          icon={<Users className="text-orange-500" size={16} />}
        />
        <StatCard 
          label="CURRENT PLAN" 
          value={stats?.plan?.toUpperCase() || "TRIAL"} 
          subtext={stats?.trial_ends_at ? `Ends ${new Date(stats.trial_ends_at).toLocaleDateString()}` : "Active"}
          valueClassName="text-orange-500"
          icon={<TrendingUp className="text-orange-500" size={16} />}
        />
        <StatCard 
          label="AVG. RESPONSE" 
          value="0.8s" 
          subtext="Lightning fast"
          valueClassName="text-emerald-500"
          icon={<Zap className="text-emerald-500" size={16} />}
        />
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 space-y-8">
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

          <div className="h-[300px] w-full">
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
                <YAxis 
                  hide 
                />
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
          </div>
        </div>

        {/* Usage Progress */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Quota Status</h3>
            
            <div className="relative flex items-center justify-center h-48">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-zinc-800"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
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

          <button className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-xs font-bold transition-all uppercase tracking-widest mt-8">
            Manage Quota
          </button>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Recent Conversations</h3>
        <div className="space-y-3">
          <ConversationItem 
            query="What are your delivery charges for orders above ₹500?" 
            meta="5 May 2025 · 6 messages"
          />
          <ConversationItem 
            query="Kya aap Sunday ko bhi open rehte ho?" 
            meta="4 May 2025 · 4 messages"
          />
          <ConversationItem 
            query="I need to return a product I bought last week" 
            meta="3 May 2025 · 2 messages"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, valueClassName = "text-white", icon }: { label: string, value: string, subtext: string, valueClassName?: string, icon?: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col justify-between min-h-[160px] hover:bg-zinc-900/50 transition-colors group relative overflow-hidden">
      <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 group-hover:text-zinc-400 transition-colors">{label}</p>
        <p className={`text-4xl font-bold tracking-tight mb-2 ${valueClassName}`}>{value}</p>
      </div>
      <p className="text-sm text-zinc-600 font-medium group-hover:text-zinc-500 transition-colors">{subtext}</p>
    </div>
  );
}

function ConversationItem({ query, meta }: { query: string, meta: string }) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 flex items-start space-x-6 hover:bg-zinc-900/50 transition-all cursor-pointer group">
      <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
        <span className="text-xl">💬</span>
      </div>
      <div className="space-y-1">
        <p className="text-lg font-medium text-zinc-100 leading-tight">{query}</p>
        <p className="text-sm text-zinc-500 font-medium">{meta}</p>
      </div>
    </div>
  );
}
