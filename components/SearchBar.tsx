"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
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

const ALL_SUGGESTIONS = [
  "Pasta",
  "Chicken Curry",
  "Vegan Tacos",
  "Quick Dinner",
  "Meal Prep",
  "Beef Stew",
  "Caesar Salad",
  "Pancakes",
  "Sushi",
  "Ramen",
  "Stir Fry",
  "Avocado Toast",
  "Smoothie Bowl",
  "Fish Tacos",
  "Lemon Chicken",
  "Chocolate Cake",
  "Veggie Burger",
  "Fried Rice",
  "Tomato Soup",
  "Greek Salad",
];

export default function SearchBar({ initialQ = "", onSearch, loading }: Props) {
  const [q, setQ] = useState(initialQ);
  const [mealType, setMealType] = useState("");
  const [diet, setDiet] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasFilters = mealType || diet;

  // Filter suggestions based on query
  const suggestions = q.trim()
    ? ALL_SUGGESTIONS.filter(
        (s) =>
          s.toLowerCase().includes(q.toLowerCase()) &&
          s.toLowerCase() !== q.toLowerCase(),
      ).slice(0, 6)
    : ALL_SUGGESTIONS.slice(0, 5);

  const showDropdown = isFocused && suggestions.length > 0;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    onSearch(q.trim() || "popular", mealType, diet);
    setIsFocused(false);
    setActiveIndex(-1);
  };

  const selectSuggestion = (term: string) => {
    setQ(term);
    setActiveIndex(-1);
    setIsFocused(false);
    onSearch(term, mealType, diet);
  };

  const clearAll = () => {
    setQ("");
    setMealType("");
    setDiet("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "Enter") submit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        selectSuggestion(suggestions[activeIndex]);
      } else {
        submit();
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    // Reset active index when suggestions change
    setActiveIndex(-1);
  }, [q]);

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
    <div className="w-full flex flex-col gap-2.5" data-search-container>
      <form onSubmit={submit} className="w-full">
        <div className="flex gap-2 w-full items-center">
          {/* Main Input */}
          <div className="relative flex-1 min-w-0">
            <div
              className={`relative flex items-center rounded-[10px] bg-white h-[42px] transition-all duration-200 ${
                isFocused
                  ? "border-[1.5px] border-terracotta shadow-[0_0_0_3px_rgba(196,97,58,0.12)]"
                  : "border-[1.5px] border-border-custom"
              }`}
            >
              <Search
                size={15}
                className={`absolute left-3 pointer-events-none shrink-0 transition-colors duration-200 ${
                  isFocused ? "text-terracotta" : "text-soft-brown"
                }`}
              />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search recipes, ingredients, cuisines..."
                className="w-full pl-9 pr-8 text-[13px] outline-none bg-transparent text-charcoal h-full border-none placeholder:text-soft-brown/50"
                autoComplete="off"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 p-1 rounded-md border-none bg-transparent cursor-pointer flex items-center"
                >
                  <X size={13} className="text-soft-brown" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-xl border border-border-custom overflow-hidden z-50 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
                {/* Label */}
                <div className="px-3 pt-2.5 pb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-soft-brown">
                    {q.trim() ? "Suggestions" : "Popular searches"}
                  </p>
                </div>

                {/* Suggestion items */}
                <ul className="py-1">
                  {suggestions.map((term, idx) => {
                    const isActive = activeIndex === idx;
                    // Highlight matched part
                    const lowerTerm = term.toLowerCase();
                    const lowerQ = q.toLowerCase();
                    const matchStart = lowerTerm.indexOf(lowerQ);
                    const hasMatch = q.trim() && matchStart !== -1;

                    return (
                      <li key={term}>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectSuggestion(term);
                          }}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onMouseLeave={() => setActiveIndex(-1)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] cursor-pointer transition-colors duration-100 ${
                            isActive
                              ? "bg-cream text-terracotta"
                              : "text-charcoal hover:bg-cream/60"
                          }`}
                        >
                          <Search
                            size={12}
                            className={`shrink-0 ${isActive ? "text-terracotta" : "text-soft-brown"}`}
                          />
                          {hasMatch ? (
                            <span>
                              {term.slice(0, matchStart)}
                              <span className="font-semibold text-terracotta">
                                {term.slice(matchStart, matchStart + q.length)}
                              </span>
                              {term.slice(matchStart + q.length)}
                            </span>
                          ) : (
                            <span>{term}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Keyboard hint */}
                <div className="px-3 py-2 border-t border-border-custom flex items-center gap-1.5 text-[11px] text-soft-brown/70">
                  <kbd className="px-1.5 py-px rounded bg-gray-100 font-mono text-[10px]">
                    ↑↓
                  </kbd>{" "}
                  navigate
                  <span className="mx-0.5 opacity-50">·</span>
                  <kbd className="px-1.5 py-px rounded bg-gray-100 font-mono text-[10px]">
                    ↵
                  </kbd>{" "}
                  select
                  <span className="mx-0.5 opacity-50">·</span>
                  <kbd className="px-1.5 py-px rounded bg-gray-100 font-mono text-[10px]">
                    esc
                  </kbd>{" "}
                  close
                </div>
              </div>
            )}
          </div>

          {/* Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`relative shrink-0 h-[42px] px-3.5 rounded-[10px] border-[1.5px] cursor-pointer flex items-center gap-1.5 text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
              showFilters
                ? "border-terracotta bg-terracotta text-white"
                : "border-border-custom bg-white text-soft-brown"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {hasFilters && (
              <span
                className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                  showFilters
                    ? "bg-white/30 text-white"
                    : "bg-amber text-charcoal"
                }`}
              >
                {[mealType, diet].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 h-[42px] px-4 rounded-[10px] border-none bg-terracotta text-white text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-[0_2px_8px_rgba(196,97,58,0.3)] transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={14} />
            )}
            <span>{loading ? "Searching…" : "Search"}</span>
          </button>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-xl border border-border-custom p-3.5 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-soft-brown flex items-center gap-1.5">
              <SlidersHorizontal size={12} className="text-terracotta" />
              Filter options
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] text-terracotta bg-transparent border-none cursor-pointer underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
            {/* Meal Type */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-soft-brown mb-1.5">
                Meal type
              </p>
              <div className="flex flex-wrap gap-1">
                {MEAL_TYPES.map((m) => {
                  const active = mealType === m;
                  return (
                    <button
                      key={m || "all-meals"}
                      type="button"
                      onClick={() => setMealType(active ? "" : m)}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium border cursor-pointer transition-all duration-150 ${
                        active
                          ? "border-terracotta bg-terracotta/10 text-terracotta"
                          : "border-border-custom bg-cream text-charcoal"
                      }`}
                    >
                      {m || "All"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Diet */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-soft-brown mb-1.5">
                Dietary preference
              </p>
              <div className="flex flex-wrap gap-1">
                {DIETS.map((d) => {
                  const active = diet === d.value;
                  return (
                    <button
                      key={d.value || "all-diets"}
                      type="button"
                      onClick={() => setDiet(active ? "" : d.value)}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium border cursor-pointer transition-all duration-150 ${
                        active
                          ? "border-terracotta bg-terracotta/10 text-terracotta"
                          : "border-border-custom bg-cream text-charcoal"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="pt-2.5 border-t border-border-custom flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-soft-brown">Active:</span>
              {mealType && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-terracotta/10 text-terracotta">
                  {mealType}
                  <button
                    type="button"
                    onClick={() => setMealType("")}
                    className="bg-transparent border-none cursor-pointer flex p-0"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {diet && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-terracotta/10 text-terracotta">
                  {DIETS.find((d) => d.value === diet)?.label}
                  <button
                    type="button"
                    onClick={() => setDiet("")}
                    className="bg-transparent border-none cursor-pointer flex p-0"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
