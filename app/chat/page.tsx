"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import type { ChatMessage } from "@/types";
import { Send, ChefHat, RotateCcw } from "lucide-react";

const SUGGESTIONS = [
  "How do I make pasta from scratch?",
  "What can I substitute for buttermilk?",
  "Tips for perfectly crispy chicken skin?",
  "How long to rest a steak after cooking?",
  "What spices go well with salmon?",
  "How do I thicken a sauce without cornstarch?",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1 dot-pulse">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: "var(--sage)" }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }} className="animate-fadeUp">
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1"
          style={{ backgroundColor: "var(--forest)", marginRight: "8px" }}
        >
          <ChefHat size={16} color="white" />
        </div>
      )}
      <div
        style={{
          maxWidth: "75%",
          padding: "14px 20px",
          borderRadius: "16px",
          fontSize: "14px",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          ...(isUser
            ? { backgroundColor: "var(--forest)", color: "white", borderBottomRightRadius: "4px" }
            : { backgroundColor: "white", color: "var(--charcoal)", borderBottomLeftRadius: "4px", border: "1px solid var(--border)" }),
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "👨‍🍳 Welcome! I'm your personal AI Chef. I can help you with recipes, cooking techniques, ingredient substitutions, and anything food-related.\n\nWhat would you like to cook today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    const userMsg: ChatMessage = { role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.content || "Sorry, I had an issue. Please try again." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — please check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const reset = () => {
    setMessages([{ role: "assistant", content: "👨‍🍳 Chat cleared! Ask me anything about cooking." }]);
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          maxWidth: "768px",
          margin: "0 auto",
          padding: "24px",
          height: "calc(100vh - 4rem)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexShrink: 0 }}>
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: "var(--charcoal)" }}>
              AI Chef Assistant
            </h1>
            <p className="text-sm" style={{ color: "var(--soft-brown)" }}>
              Powered by Groq · Llama 3.3 70B
            </p>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-all hover:opacity-75"
            style={{ color: "var(--soft-brown)", border: "1px solid var(--border)", backgroundColor: "white", cursor: "pointer" }}
          >
            <RotateCcw size={14} /> Clear
          </button>
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 0", display: "flex", flexDirection: "column", gap: "16px", minHeight: 0 }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--forest)", marginRight: "8px" }}>
                <ChefHat size={16} color="white" />
              </div>
              <div style={{ padding: "14px 20px", borderRadius: "16px", borderBottomLeftRadius: "4px", backgroundColor: "white", border: "1px solid var(--border)" }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{ flexShrink: 0, display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                style={{ border: "1px solid var(--border)", backgroundColor: "white", color: "var(--soft-brown)", cursor: "pointer" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-end",
            gap: "12px",
            padding: "12px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            backgroundColor: "white",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKey}
            placeholder="Ask about any recipe, technique, or ingredient..."
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              fontSize: "14px",
              resize: "none",
              outline: "none",
              background: "transparent",
              lineHeight: 1.6,
              color: "var(--charcoal)",
              maxHeight: "120px",
              border: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 hover:opacity-90"
            style={{ backgroundColor: "var(--terracotta)", border: "none", cursor: !input.trim() || loading ? "not-allowed" : "pointer" }}
            aria-label="Send message"
          >
            <Send size={18} color="white" />
          </button>
        </div>
      </div>
    </>
  );
}