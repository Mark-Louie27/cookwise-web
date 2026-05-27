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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeUp`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 mt-1"
          style={{ backgroundColor: "var(--forest)" }}
        >
          <ChefHat size={16} color="white" />
        </div>
      )}
      <div
        className="max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
        style={
          isUser
            ? { backgroundColor: "var(--forest)", color: "white", borderBottomRightRadius: "4px" }
            : { backgroundColor: "white", color: "var(--charcoal)", borderBottomLeftRadius: "4px", border: "1px solid var(--border)" }
        }
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
      content:
        "👨‍🍳 Welcome! I'm your personal AI Chef. I can help you with recipes, cooking techniques, ingredient substitutions, and anything food-related.\n\nWhat would you like to cook today?",
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
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.content || "Sorry, I had an issue. Please try again." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error — please check your connection and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => {
    setMessages([
      {
        role: "assistant",
        content: "👨‍🍳 Chat cleared! Ask me anything about cooking.",
      },
    ]);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
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
            style={{ color: "var(--soft-brown)", border: "1px solid var(--border)" }}
          >
            <RotateCcw size={14} />
            Clear
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-2 flex-shrink-0" style={{ backgroundColor: "var(--forest)" }}>
                <ChefHat size={16} color="white" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-white border" style={{ borderColor: "var(--border)", borderBottomLeftRadius: "4px" }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex-shrink-0 flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all hover:opacity-80"
                style={{ borderColor: "var(--border)", backgroundColor: "white", color: "var(--soft-brown)" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          className="flex-shrink-0 flex items-end gap-3 p-3 rounded-2xl border"
          style={{ backgroundColor: "white", borderColor: "var(--border)" }}
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
            className="flex-1 text-sm resize-none outline-none bg-transparent leading-relaxed"
            style={{ color: "var(--charcoal)", maxHeight: "120px" }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 hover:opacity-90"
            style={{ backgroundColor: "var(--terracotta)" }}
            aria-label="Send message"
          >
            <Send size={18} color="white" />
          </button>
        </div>
      </div>
    </>
  );
}
