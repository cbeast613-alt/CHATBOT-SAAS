"use client";

import { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Conversation {
  id: string;
  started_at: string;
  messages: {
    role: string;
    content: string;
    created_at: string;
  }[];
}

function ConversationsContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("id");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    async function init() {
      try {
        const tenantRes = await fetch('/api/tenant/me');
        if (!tenantRes.ok) throw new Error("Tenant fetch failed");
        const tenant = await tenantRes.json();
        setTenantId(tenant.id);
        fetchConversations(tenant.id, 0);
      } catch (err) {
        console.error("Init failed:", err);
        setLoading(false);
      }
    }
    init();
  }, []);

  const fetchConversations = async (tId: string, currentOffset: number) => {
    try {
      const res = await fetch(`/api/conversations?tenantId=${tId}&limit=${PAGE_SIZE}&offset=${currentOffset}&full=true`);
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      
      const newConvs = json.data || [];
      if (currentOffset === 0) {
        setConversations(newConvs);
        if (preselectedId && newConvs.some((c: Conversation) => c.id === preselectedId)) {
          setSelectedId(preselectedId);
        } else if (window.innerWidth >= 768 && newConvs.length > 0) {
          setSelectedId(newConvs[0].id);
        }
      } else {
        setConversations(prev => [...prev, ...newConvs]);
      }

      setHasMore(newConvs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!tenantId || loadingMore) return;
    setLoadingMore(true);
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    fetchConversations(tenantId, nextOffset);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id }),
      });

      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (selectedId === id) {
          setSelectedId(null);
          setIsMobileChatOpen(false);
        }
      }
    } catch (err) {
      alert("Failed to delete conversation");
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedId);

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setIsMobileChatOpen(true);
  };

  const handleBackToList = () => {
    setIsMobileChatOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex h-[calc(100vh-140px)] md:h-[calc(100vh-200px)] animate-in fade-in duration-700 relative">
      <div className={`w-full md:w-80 border-r border-zinc-800/50 flex flex-col bg-zinc-900/10 transition-all duration-300 ${
        isMobileChatOpen ? "-translate-x-full md:translate-x-0 hidden md:flex" : "translate-x-0 flex"
      }`}>
        <div className="p-5 md:p-6 border-b border-zinc-800/50">
          <h3 className="font-bold text-zinc-100 text-lg">Recent Chats</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm font-medium">No conversations yet</div>
          ) : (
            <>
              {conversations.map((conv) => (
                <div key={conv.id} className="relative group">
                  <button
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full p-5 md:p-6 text-left border-b border-zinc-800/30 transition-all ${
                      selectedId === conv.id ? "bg-zinc-800/50" : "hover:bg-zinc-900/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-zinc-200 truncate pr-8">Session: {conv.id.slice(0, 8)}</div>
                      {selectedId === conv.id && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0 mt-1"></div>}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      {new Date(conv.started_at).toLocaleDateString()} · {new Date(conv.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-zinc-400 mt-3 truncate font-medium">
                      {conv.messages[conv.messages.length - 1]?.content || "No messages"}
                    </div>
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="absolute top-5 right-5 p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {hasMore && (
                <div className="p-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full py-3 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
                  >
                    {loadingMore ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <span>Load More</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-zinc-950/20 transition-all duration-300 fixed inset-0 z-50 md:relative md:z-0 md:flex ${
        isMobileChatOpen ? "translate-x-0" : "translate-x-full md:translate-x-0 hidden md:flex"
      }`}>
        {selectedConv ? (
          <>
            <div className="p-4 md:p-6 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md md:bg-zinc-900/10">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleBackToList}
                  className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm md:text-base">Conversation Details</h3>
                  <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">ID: {selectedConv.id}</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 custom-scrollbar bg-zinc-950/30">
              {selectedConv.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] md:max-w-[80%] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] text-sm shadow-xl transition-all ${
                    msg.role === "user" 
                      ? "bg-orange-500 text-white rounded-tr-none shadow-orange-950/20" 
                      : "bg-zinc-800/80 text-zinc-100 rounded-tl-none border border-zinc-700/50"
                  }`}>
                    <p className="leading-relaxed font-medium break-words">{msg.content}</p>
                    <div className={`text-[10px] mt-3 font-bold opacity-50 ${msg.role === "user" ? "text-right" : ""}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-4 bg-zinc-950/20">
            <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center text-3xl">💬</div>
            <p className="font-bold text-sm uppercase tracking-widest opacity-50">Select a chat to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    }>
      <ConversationsContent />
    </Suspense>
  );
}
