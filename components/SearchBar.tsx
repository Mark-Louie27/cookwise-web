"use client";

import { Search, SlidersHorizontal, X, Sparkles } from "lucide-react";
import { useState, FormEvent, useRef, useEffect, KeyboardEvent } from "react";

interface Props {
  initialQ?: string;
  onSearch: (query: string, mealType: string, diet: string) => void;
  loading?: boolean;
}

const MEAL_TYPES = ["", "Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
const DIETS = [
  { value: "", label: "Any Diet" },
  { value: "balanced", label: "Balanced" },
  { value: "high-protein", label: "High Protein" },
  { label: "Low Fat", value: "low-fat" },
  { value: "low-carb", label: "Low Carb" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "keto", label: "Keto" },
  { value: "gluten-free", label: "Gluten Free" },
];

const QUICK_SEARCHES = ["Pasta", "Chicken Curry", "Vegan Tacos", "Quick Dinner", "Meal Prep"];

export default function SearchBar({ initialQ = "", onSearch, loading }: Props) {
  const [q, setQ] = useState(initialQ);
  const [mealType, setMealType] = useState("");
  const [diet, setDiet] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeQuickIndex, setActiveQuickIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasFilters = mealType || diet;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    onSearch(q.trim() || "popular", mealType, diet);
    setIsFocused(false);
  };

  const clearAll = () => {
    setQ("");
    setMealType("");
    setDiet("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (activeQuickIndex >= 0 && activeQuickIndex < QUICK_SEARCHES.length) {
        setQ(QUICK_SEARCHES[activeQuickIndex]);
        setActiveQuickIndex(-1);
      } else {
        submit();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveQuickIndex((prev) => (prev < QUICK_SEARCHES.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveQuickIndex((prev) => (prev > 0 ? prev - 1 : QUICK_SEARCHES.length - 1));
    } else if (e.key === "Escape") {
      setIsFocused(false);
      setActiveQuickIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-search-container]")) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }} data-search-container>
      <form onSubmit={submit} style={{ width: "100%" }}>
        <div style={{ display: "flex", gap: "8px", width: "100%", alignItems: "center" }}>

          {/* Main Input */}
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <div
              style={{
                position: "relative", display: "flex", alignItems: "center",
                borderRadius: "10px",
                border: `1.5px solid ${isFocused ? "var(--terracotta)" : "var(--border)"}`,
                backgroundColor: "white",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxShadow: isFocused ? "0 0 0 3px rgba(196,97,58,0.12)" : "none",
                height: "42px",
              }}
            >
              <Search
                size={15}
                style={{ position: "absolute", left: "12px", pointerEvents: "none", color: isFocused ? "var(--terracotta)" : "var(--soft-brown)", flexShrink: 0 }}
              />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActiveQuickIndex(-1); }}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search recipes, ingredients, cuisines..."
                style={{
                  width: "100%", paddingLeft: "36px", paddingRight: q ? "32px" : "12px",
                  fontSize: "13px", outline: "none", background: "transparent",
                  color: "var(--charcoal)", height: "100%", border: "none",
                }}
                autoComplete="off"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => { setQ(""); inputRef.current?.focus(); }}
                  style={{ position: "absolute", right: "8px", padding: "4px", borderRadius: "6px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <X size={13} style={{ color: "var(--soft-brown)" }} />
                </button>
              )}
            </div>

            {/* Quick Search Dropdown */}
            {isFocused && !q && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                borderRadius: "12px", border: `1px solid var(--border)`,
                overflow: "hidden", zIndex: 50, backgroundColor: "white",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              }}>
                <div style={{ padding: "10px 12px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", color: "var(--soft-brown)" }}>
                    Quick searches
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {QUICK_SEARCHES.map((term, idx) => (
                      <button
                        key={term} type="button"
                        onClick={() => { setQ(term); inputRef.current?.focus(); }}
                        style={{
                          padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
                          border: `1px solid ${activeQuickIndex === idx ? "var(--terracotta)" : "var(--border)"}`,
                          backgroundColor: activeQuickIndex === idx ? "rgba(196,97,58,0.08)" : "var(--cream)",
                          color: activeQuickIndex === idx ? "var(--terracotta)" : "var(--charcoal)",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                        onMouseEnter={() => setActiveQuickIndex(idx)}
                        onMouseLeave={() => setActiveQuickIndex(-1)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "8px 12px", borderTop: `1px solid var(--border)`, display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--soft-brown)" }}>
                  <kbd style={{ padding: "1px 5px", borderRadius: "4px", backgroundColor: "#f3f4f6", fontFamily: "monospace", fontSize: "10px" }}>↵</kbd> search
                  <span style={{ margin: "0 2px", opacity: 0.5 }}>·</span>
                  <kbd style={{ padding: "1px 5px", borderRadius: "4px", backgroundColor: "#f3f4f6", fontFamily: "monospace", fontSize: "10px" }}>esc</kbd> close
                </div>
              </div>
            )}
          </div>

          {/* Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            style={{
              position: "relative", flexShrink: 0,
              height: "42px", padding: "0 14px",
              borderRadius: "10px",
              border: `1.5px solid ${showFilters ? "var(--terracotta)" : "var(--border)"}`,
              backgroundColor: showFilters ? "var(--terracotta)" : "white",
              color: showFilters ? "white" : "var(--soft-brown)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              fontSize: "13px", fontWeight: 500, transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {hasFilters && (
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "16px", height: "16px", borderRadius: "50%",
                backgroundColor: showFilters ? "rgba(255,255,255,0.3)" : "var(--amber)",
                color: showFilters ? "white" : "var(--charcoal)",
                fontSize: "10px", fontWeight: 700,
              }}>
                {[mealType, diet].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              flexShrink: 0, height: "42px", padding: "0 18px",
              borderRadius: "10px", border: "none",
              backgroundColor: "var(--terracotta)", color: "white",
              fontSize: "13px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              whiteSpace: "nowrap", transition: "opacity 0.2s, transform 0.15s",
              boxShadow: "0 2px 8px rgba(196,97,58,0.3)",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {loading
              ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Search size={14} />
            }
            <span>{loading ? "Searching…" : "Search"}</span>
          </button>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div style={{
          borderRadius: "12px", border: `1px solid var(--border)`,
          padding: "14px 16px", backgroundColor: "white",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          display: "flex", flexDirection: "column", gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--soft-brown)", display: "flex", alignItems: "center", gap: "6px" }}>
              <SlidersHorizontal size={12} style={{ color: "var(--terracotta)" }} />
              Filter options
            </span>
            {hasFilters && (
              <button type="button" onClick={clearAll} style={{ fontSize: "11px", color: "var(--terracotta)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Clear all
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            {/* Meal Type */}
            <div>
              <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--soft-brown)", marginBottom: "6px" }}>Meal type</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {MEAL_TYPES.map((m) => {
                  const active = mealType === m;
                  return (
                    <button key={m || "all-meals"} type="button" onClick={() => setMealType(active ? "" : m)}
                      style={{
                        padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
                        border: `1px solid ${active ? "var(--terracotta)" : "var(--border)"}`,
                        backgroundColor: active ? "rgba(196,97,58,0.08)" : "var(--cream)",
                        color: active ? "var(--terracotta)" : "var(--charcoal)",
                        cursor: "pointer", transition: "all 0.15s",
                      }}>
                      {m || "All"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Diet */}
            <div>
              <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--soft-brown)", marginBottom: "6px" }}>Dietary preference</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {DIETS.map((d) => {
                  const active = diet === d.value;
                  return (
                    <button key={d.value || "all-diets"} type="button" onClick={() => setDiet(active ? "" : d.value)}
                      style={{
                        padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
                        border: `1px solid ${active ? "var(--terracotta)" : "var(--border)"}`,
                        backgroundColor: active ? "rgba(196,97,58,0.08)" : "var(--cream)",
                        color: active ? "var(--terracotta)" : "var(--charcoal)",
                        cursor: "pointer", transition: "all 0.15s",
                      }}>
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div style={{ paddingTop: "10px", borderTop: `1px solid var(--border)`, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "var(--soft-brown)" }}>Active:</span>
              {mealType && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, backgroundColor: "rgba(196,97,58,0.1)", color: "var(--terracotta)" }}>
                  {mealType}
                  <button type="button" onClick={() => setMealType("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}><X size={11} /></button>
                </span>
              )}
              {diet && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, backgroundColor: "rgba(196,97,58,0.1)", color: "var(--terracotta)" }}>
                  {DIETS.find((d) => d.value === diet)?.label}
                  <button type="button" onClick={() => setDiet("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}><X size={11} /></button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}