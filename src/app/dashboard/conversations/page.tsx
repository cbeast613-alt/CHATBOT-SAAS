"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Conversation {
  id: string;
  started_at: string;
  messages: {
    role: string;
    content: string;
    created_at: string;
  }[];
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      type ConversationResult = {
      id: string;
      started_at: string;
      messages: {
        role: string;
        content: string;
        created_at: string;
      }[];
    }[];

    const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          started_at,
          messages (
            role,
            content,
            created_at
          )
        `) as { data: ConversationResult | null; error: unknown };

      if (data && !error) {
        setConversations(data);
        if (data.length > 0) setSelectedId(data[0].id);
      }
      setLoading(false);
    }

    fetchConversations();
  }, []);

  const selectedConv = conversations.find((c) => c.id === selectedId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] overflow-hidden flex h-[calc(100vh-200px)] animate-in fade-in duration-700">
      {/* Sidebar - List of sessions */}
      <div className="w-80 border-r border-zinc-800/50 flex flex-col bg-zinc-900/10">
        <div className="p-6 border-b border-zinc-800/50">
          <h3 className="font-bold text-zinc-100 text-lg">Recent Chats</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full p-6 text-left border-b border-zinc-800/30 transition-all ${
                  selectedId === conv.id ? "bg-zinc-800/50" : "hover:bg-zinc-900/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-sm text-zinc-200 truncate">Session: {conv.id.slice(0, 8)}</div>
                  {selectedId === conv.id && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>}
                </div>
                <div className="text-xs text-zinc-500 font-medium">
                  {new Date(conv.started_at).toLocaleDateString()} · {new Date(conv.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-zinc-400 mt-3 truncate font-medium">
                  {conv.messages[conv.messages.length - 1]?.content || "No messages"}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat View */}
      <div className="flex-1 flex flex-col bg-zinc-950/20">
        {selectedConv ? (
          <>
            <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/10">
              <div>
                <h3 className="font-bold text-zinc-100">Conversation Details</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">ID: {selectedConv.id}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {selectedConv.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-5 rounded-[1.5rem] text-sm shadow-xl transition-all hover:scale-[1.01] ${
                    msg.role === "user" 
                      ? "bg-orange-500 text-white rounded-tr-none shadow-orange-950/20" 
                      : "bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50"
                  }`}>
                    <p className="leading-relaxed font-medium">{msg.content}</p>
                    <div className={`text-[10px] mt-3 font-bold opacity-50 ${msg.role === "user" ? "text-right" : ""}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-4">
            <span className="text-4xl">💬</span>
            <p className="font-medium">Select a conversation to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
