"use client";

import { useState, useEffect, useRef } from "react";
import { User, Bot, Send, RotateCcw } from "lucide-react";

type Message = {
  role: "bot" | "user";
  content: string;
};

export default function LiveDemo() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! Welcome to ChatBot SaaS. How can I help you today?" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps = [
    { type: "greeting" },
    { type: "ask_name", prompt: "Sure, I can help with that! First, may I know your name?" },
    { type: "ask_phone", prompt: (name: string) => `Nice to meet you, ${name}! Could you share your phone number so our team can reach out?` },
    { type: "ask_query", prompt: "Got it! What specific questions do you have about our AI chatbots?" },
    { type: "thank_you", prompt: "Thank you! Our team will get back to you shortly. Feel free to explore more of our features while you wait." },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addBotMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", content }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSend = () => {
    if (!input.trim() || step >= steps.length - 1) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");

    const nextStep = step + 1;
    setStep(nextStep);

    let botResponse = "";
    if (nextStep === 1) {
      botResponse = steps[1].prompt as string;
    } else if (nextStep === 2) {
      botResponse = (steps[2].prompt as Function)(userText);
    } else if (nextStep === 3) {
      botResponse = steps[3].prompt as string;
    } else if (nextStep === 4) {
      botResponse = steps[4].prompt as string;
    }

    addBotMessage(botResponse);
  };

  const resetDemo = () => {
    setStep(0);
    setMessages([{ role: "bot", content: "Hi! Welcome to ChatBot SaaS. How can I help you today?" }]);
    setInput("");
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[600px] relative">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white leading-tight">Demo Assistant</h3>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Demo</span>
            </div>
          </div>
        </div>
        <button 
          onClick={resetDemo}
          className="text-zinc-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-zinc-800"
          title="Reset Demo"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar scroll-smooth bg-zinc-950/20"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex items-end space-x-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-zinc-800" : "bg-orange-500/20 border border-orange-500/30"
              }`}>
                {msg.role === "user" ? <User size={14} className="text-zinc-400" /> : <Bot size={14} className="text-orange-500" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                msg.role === "user" 
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/10" 
                  : "bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex items-end space-x-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <Bot size={14} className="text-orange-500" />
              </div>
              <div className="bg-zinc-800/80 p-4 rounded-2xl border border-zinc-700/50 flex space-x-1">
                <div className="w-1.5 h-1.5 bg-orange-500/50 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-orange-500/50 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-orange-500/50 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-zinc-900 border-t border-zinc-800 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={step >= steps.length - 1}
            placeholder={step >= steps.length - 1 ? "Demo complete" : "Type your message..."}
            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors pr-14 disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || step >= steps.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:grayscale"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center text-zinc-600 font-bold uppercase tracking-widest mt-4">
          Interactive Lead Capture Simulation
        </p>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
