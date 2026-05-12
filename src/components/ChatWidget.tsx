"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  tenantId: string;
  primaryColor?: string;
  welcomeMessage?: string;
  placeholder?: string;
  botName?: string;
  isPreview?: boolean;
}

export default function ChatWidget({
  tenantId,
  primaryColor = "#6C63FF",
  welcomeMessage = "Namaste! 👋 How can I help you today?",
  placeholder = "Type your message...",
  botName = "Assistant",
  isPreview = false,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    // Never auto-open on mobile (< 768px)
    if (window.innerWidth < 768) return false;
    // Auto-open in dashboard preview
    if (isPreview && window.location.pathname.includes("/dashboard")) {
      return true;
    }
    return false; // Always start closed for preview
  });

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: welcomeMessage },
  ]);

  const [isFixed] = useState(() => {
    if (typeof window !== "undefined" && isPreview && window.location.pathname.includes("/dashboard")) {
      return false;
    }
    return true;
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          tenantId,
          history: messages,
          preview: isPreview, // Pass preview flag to API
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error");

      if (data.sessionId && !sessionId) setSessionId(data.sessionId);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "Something went wrong. Please try again.",
        },
      ]);

    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{
          position: isFixed ? "fixed" : "absolute",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: primaryColor,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          zIndex: 9999,
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "scale(1.08)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
            <path d="M4 4l12 12M16 4L4 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          style={{
            position: isFixed ? "fixed" : "absolute",
            bottom: "92px",
            right: "24px",
            width: "360px",
            maxHeight: "520px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9998,
            overflow: "hidden",
            fontFamily: "'Segoe UI', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: primaryColor,
              padding: "14px 18px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              🤖
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "15px" }}>{botName}</div>
              <div style={{ fontSize: "12px", opacity: 0.85 }}>
                {isLoading ? "Typing..." : "Online"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#f7f8fa",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background:
                      msg.role === "user" ? primaryColor : "#fff",
                    color: msg.role === "user" ? "#fff" : "#1a1a1a",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "18px 18px 18px 4px",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#aaa",
                        display: "inline-block",
                        animation: `bounce 1.2s ${dot * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #eee",
              display: "flex",
              gap: "10px",
              background: "#fff",
              alignItems: "center",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={placeholder}
              disabled={isLoading}
              style={{
                flex: 1,
                border: "1px solid #e0e0e0",
                borderRadius: "24px",
                padding: "9px 16px",
                fontSize: "14px",
                outline: "none",
                background: "#f7f8fa",
                color: "#1a1a1a",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background:
                  isLoading || !input.trim() ? "#ddd" : primaryColor,
                border: "none",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          </div>

          {/* Branding */}
          <div
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: "#94a3b8",
              padding: "10px",
              background: "#fff",
              borderTop: "1px solid #f1f5f9",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            POWERED BY <span style={{ color: primaryColor, fontWeight: 900 }}>CHATBOT SAAS</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
