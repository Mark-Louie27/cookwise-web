"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChefHat } from "lucide-react";
import type { ChatMessage } from "@/types";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1 dot-pulse">
      {[0, 1, 2].map((i) => (
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ backgroundColor: "var(--terracotta)", border: "none", cursor: "pointer" }}
        >
          <MessageCircle size={26} color="white" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: "360px",
            maxWidth: "calc(100vw - 2rem)",
            height: "520px",
            backgroundColor: "white",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ backgroundColor: "var(--forest)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--terracotta)" }}
            >
              <ChefHat size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p className="text-white font-semibold text-sm">CookWise AI Chef</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Powered by Groq · Llama 3.3</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="transition-colors hover:opacity-100"
              style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer", display: "flex" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className="animate-fadeUp"
                style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    ...(msg.role === "user"
                      ? { backgroundColor: "var(--forest)", color: "white", borderBottomRightRadius: "4px" }
                      : { backgroundColor: "var(--cream)", color: "var(--charcoal)", borderBottomLeftRadius: "4px" }),
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "12px 16px", borderRadius: "16px", borderBottomLeftRadius: "4px", backgroundColor: "var(--cream)" }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="shrink-0 flex gap-2 px-4 py-3 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Ask anything about cooking..."
              disabled={loading}
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border outline-none transition-all"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--cream)",
                color: "var(--charcoal)",
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
              style={{ backgroundColor: "var(--terracotta)", border: "none", cursor: !input.trim() || loading ? "not-allowed" : "pointer" }}
            >
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}