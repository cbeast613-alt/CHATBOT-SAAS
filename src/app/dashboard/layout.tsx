"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [plan, setPlan] = useState("Starter");

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      const { data } = await supabase
        .from("tenants")
        .select("business_name, plan")
        .eq("user_id", session.user.id)
        .single();

      if (data) {
        setUserName(data.business_name || "User");
        setPlan(data.plan.charAt(0).toUpperCase() + data.plan.slice(1));
      }
    }
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const menuItems = [
    { name: "Overview", icon: "📊", href: "/dashboard" },
    { name: "Conversations", icon: "💬", href: "/dashboard/conversations" },
    { name: "AI Training", icon: "🧠", href: "/dashboard/training" },
    { name: "Widget", icon: "🎨", href: "/dashboard/widget" },
    { name: "Billing", icon: "💳", href: "/dashboard/billing" },
  ];

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#09090b] border-r border-zinc-800/50 flex flex-col">
        <div className="p-8">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
            <span className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
              ChatBot SaaS
            </span>
          </Link>
        </div>
        <div className="px-6 pb-6 border-b border-zinc-800/50">
          <p className="text-sm text-zinc-500">Hello, {userName}</p>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-zinc-800/50 text-white" 
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <span className={`text-lg ${isActive ? "opacity-100" : "opacity-50"}`}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-zinc-300">{plan} plan</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 text-zinc-500 hover:text-zinc-300 transition-all text-sm font-medium"
          >
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-8 lg:p-12">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #09090b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
