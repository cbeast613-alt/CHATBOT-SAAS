"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Brain, 
  Palette, 
  CreditCard, 
  LogOut,
  ChevronRight
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [plan, setPlan] = useState("Starter");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch('/api/tenant/me');
        if (res.ok) {
          const tenant = await res.json();
          setUserName(tenant.business_name || "User");
          setPlan(tenant.plan ? tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1) : "Starter");
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setUserName(session.user.user_metadata.business_name || "User");
          } else {
            router.push("/auth");
          }
        }
      } catch (err) {
        console.error("Layout user fetch error:", err);
      }
    }
    getUser();
  }, [router]);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const menuItems = [
    { name: "Overview", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { name: "Conversations", icon: <MessageSquare size={20} />, href: "/dashboard/conversations" },
    { name: "AI Training", icon: <Brain size={20} />, href: "/dashboard/training" },
    { name: "Widget", icon: <Palette size={20} />, href: "/dashboard/widget" },
    { name: "Billing", icon: <CreditCard size={20} />, href: "/dashboard/billing" },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-8 md:p-10">
        <Link
          href="/dashboard"
          className="flex items-center space-x-3 group"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)] group-hover:scale-110 transition-transform"></div>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white">
            ChatBot SaaS
          </span>
        </Link>
      </div>

      <div className="px-8 md:px-10 pb-6 md:pb-8 mb-4 border-b border-zinc-800/20">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Logged in as</p>
          <p className="text-sm font-bold text-zinc-300 truncate">{userName}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 md:px-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                isActive
                  ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                  : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300"
              }`}
            >
              <span className={`${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300 transition-colors"}`}>
                {item.icon}
              </span>
              <span className="tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 md:p-8 space-y-4 md:space-y-6">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-3xl p-5 md:p-6 shadow-2xl">
          <div className="flex items-center space-x-3 mb-3 md:mb-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{plan} plan</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center space-x-1"
          >
            <span>Upgrade Access</span>
            <ChevronRight size={12} />
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-3 py-4 text-zinc-400 hover:text-red-400 transition-all text-xs font-black uppercase tracking-widest bg-zinc-900/30 rounded-2xl border border-zinc-800/50 hover:border-red-400/30"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden font-outfit relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
      <aside className="hidden md:flex w-72 bg-zinc-950/50 backdrop-blur-xl border-r border-zinc-800/30 flex-col z-10 relative shrink-0">
        <SidebarContent />
      </aside>

      {/* ── MOBILE OVERLAY BACKDROP ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MOBILE SIDEBAR (slide-in overlay) ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-zinc-950 border-r border-zinc-800/30 flex flex-col z-40 md:hidden
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button inside mobile sidebar */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors rounded-xl hover:bg-zinc-800"
          aria-label="Close menu"
        >
          ✕
        </button>
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar with hamburger */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/30 z-20 shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.6)]"></div>
            <span className="text-base font-black tracking-tighter text-white">ChatBot SaaS</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-all text-xl"
            aria-label="Open menu"
          >
            ☰
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 min-w-0">
          <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 xl:p-20">
            {children}
          </div>
        </main>
      </div>

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
