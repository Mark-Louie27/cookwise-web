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
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }} data-search-container>
      <form onSubmit={submit} style={{ width: "100%" }}>
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>

          {/* Main Input */}
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            {/* Focus glow */}
            <div
              style={{
                position: "absolute", inset: "-2px", borderRadius: "20px",
                pointerEvents: "none", transition: "opacity 0.3s",
                background: "linear-gradient(135deg, var(--terracotta), var(--amber))",
                opacity: isFocused ? 0.15 : 0, filter: "blur(8px)",
              }}
            />
            <div
              style={{
                position: "relative", display: "flex", alignItems: "center",
                borderRadius: "16px", border: `2px solid ${isFocused ? "var(--terracotta)" : "var(--border)"}`,
                backgroundColor: "white", overflow: "hidden", transition: "all 0.2s",
                boxShadow: isFocused ? "0 4px 20px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Search size={18} style={{ position: "absolute", left: "16px", pointerEvents: "none", color: isFocused ? "var(--terracotta)" : "var(--soft-brown)" }} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActiveQuickIndex(-1); }}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search recipes, ingredients, cuisines..."
                style={{ width: "100%", paddingLeft: "44px", paddingRight: "96px", paddingTop: "14px", paddingBottom: "14px", fontSize: "14px", outline: "none", background: "transparent", color: "var(--charcoal)" }}
                autoComplete="off"
              />
              <div style={{ position: "absolute", right: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                {q && (
                  <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                    <X size={14} style={{ color: "var(--soft-brown)" }} />
                  </button>
                )}
                {hasFilters && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: "var(--terracotta)", color: "white" }}>
                    <Sparkles size={10} />
                    {[mealType, DIETS.find((d) => d.value === diet)?.label].filter(Boolean).length}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Search Dropdown */}
            {isFocused && !q && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", borderRadius: "16px", border: `1px solid var(--border)`, overflow: "hidden", zIndex: 50, backgroundColor: "white", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}>
                <div className="px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--soft-brown)" }}>Quick Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SEARCHES.map((term, idx) => (
                      <button key={term} type="button"
                        onClick={() => { setQ(term); inputRef.current?.focus(); }}
                        className="px-3 py-1.5 rounded-lg text-sm transition-all duration-150"
                        style={{ border: `1px solid ${activeQuickIndex === idx ? "var(--terracotta)" : "var(--border)"}`, backgroundColor: activeQuickIndex === idx ? "rgba(194,65,12,0.08)" : "var(--cream)", color: activeQuickIndex === idx ? "var(--terracotta)" : "var(--charcoal)", cursor: "pointer" }}
                        onMouseEnter={() => setActiveQuickIndex(idx)}
                        onMouseLeave={() => setActiveQuickIndex(-1)}>
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t flex items-center gap-2 text-xs" style={{ borderColor: "var(--border)", color: "var(--soft-brown)" }}>
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-[10px]">↵</kbd> to search
                  <span className="mx-1">·</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-[10px]">esc</kbd> to close
                </div>
              </div>
            )}
          </div>

          {/* Filters Toggle */}
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            className="relative shrink-0 flex items-center gap-2 text-sm font-medium transition-all duration-200"
            style={{ padding: "0 16px", borderRadius: "16px", border: `2px solid ${showFilters ? "var(--terracotta)" : "var(--border)"}`, backgroundColor: showFilters ? "var(--terracotta)" : "white", color: showFilters ? "white" : "var(--soft-brown)", cursor: "pointer", boxShadow: showFilters ? "0 4px 12px rgba(194,65,12,0.25)" : "0 2px 8px rgba(0,0,0,0.04)" }}>
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && !showFilters && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: "var(--amber)" }}>
                {[mealType, DIETS.find((d) => d.value === diet)?.label].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Search Button */}
          <button type="submit" disabled={loading}
            className="shrink-0 flex items-center gap-2 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ padding: "0 24px", borderRadius: "16px", backgroundColor: "var(--terracotta)", border: "none", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(194,65,12,0.35)" }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(194,65,12,0.45)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(194,65,12,0.35)"; }}>
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={15} />}
            <span>{loading ? "Searching…" : "Search"}</span>
          </button>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-2xl border p-5" style={{ backgroundColor: "white", borderColor: "var(--border)", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
              <SlidersHorizontal size={14} style={{ color: "var(--terracotta)" }} /> Filter Options
            </h3>
            {hasFilters && (
              <button type="button" onClick={clearAll} className="text-xs font-medium hover:underline" style={{ color: "var(--terracotta)", background: "none", border: "none", cursor: "pointer" }}>Clear all</button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: "var(--soft-brown)" }}>Meal Type</label>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPES.map((m) => {
                  const active = mealType === m;
                  return (
                    <button key={m || "all-meals"} type="button" onClick={() => setMealType(active ? "" : m)}
                      className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150"
                      style={{ border: `1px solid ${active ? "var(--terracotta)" : "var(--border)"}`, backgroundColor: active ? "rgba(194,65,12,0.08)" : "var(--cream)", color: active ? "var(--terracotta)" : "var(--charcoal)", cursor: "pointer" }}>
                      {m || "All"}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: "var(--soft-brown)" }}>Dietary Preference</label>
              <div className="flex flex-wrap gap-2">
                {DIETS.map((d) => {
                  const active = diet === d.value;
                  return (
                    <button key={d.value || "all-diets"} type="button" onClick={() => setDiet(active ? "" : d.value)}
                      className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150"
                      style={{ border: `1px solid ${active ? "var(--terracotta)" : "var(--border)"}`, backgroundColor: active ? "rgba(194,65,12,0.08)" : "var(--cream)", color: active ? "var(--terracotta)" : "var(--charcoal)", cursor: "pointer" }}>
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {hasFilters && (
            <div className="pt-3 mt-4 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs font-medium" style={{ color: "var(--soft-brown)" }}>Active:</span>
              {mealType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "rgba(194,65,12,0.1)", color: "var(--terracotta)" }}>
                  {mealType}
                  <button type="button" onClick={() => setMealType("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", opacity: 0.7 }}><X size={12} /></button>
                </span>
              )}
              {diet && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "rgba(194,65,12,0.1)", color: "var(--terracotta)" }}>
                  {DIETS.find((d) => d.value === diet)?.label}
                  <button type="button" onClick={() => setDiet("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", opacity: 0.7 }}><X size={12} /></button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}