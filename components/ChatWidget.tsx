"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChefHat } from "lucide-react";
import type { ChatMessage } from "@/types";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1 dot-pulse">
      {[0,1,2].map((i) => (
        <span key={i} className="w-2 h-2 rounded-full block" style={{ backgroundColor: "var(--sage)" }} />
      ))}
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "👋 Hi! I'm your AI cooking assistant. Ask me anything — ingredient swaps, cooking tips, or how to make a recipe healthier!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150); }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.content || "Sorry, try again." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Please try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
          style={{ backgroundColor: "var(--terracotta)" }}
        >
          <MessageCircle size={26} color="white" />
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden border"
          style={{ width: "360px", maxWidth: "calc(100vw-2rem)", height: "520px", backgroundColor: "white", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: "var(--forest)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--terracotta)" }}>
              <ChefHat size={20} color="white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">CookWise AI Chef</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Powered by Groq · Llama 3.3</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`animate-fadeUp flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    msg.role === "user"
                      ? { backgroundColor: "var(--forest)", color: "white", borderBottomRightRadius: "4px" }
                      : { backgroundColor: "var(--cream)", color: "var(--charcoal)", borderBottomLeftRadius: "4px" }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: "var(--cream)", borderBottomLeftRadius: "4px" }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 py-3 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Ask anything about cooking..."
              disabled={loading}
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border outline-none transition-all"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--cream)", color: "var(--charcoal)" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
              style={{ backgroundColor: "var(--terracotta)" }}
            >
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}