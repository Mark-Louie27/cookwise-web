"use client";
import { Search } from "lucide-react";
import { useState, FormEvent } from "react";

interface Props {
  initialQ?: string;
  onSearch: (query: string, mealType: string, diet: string) => void;
  loading?: boolean;
}

const MEAL_TYPES = ["", "Breakfast", "Lunch", "Dinner", "Snack"];
const DIETS = ["", "balanced", "high-protein", "low-fat", "low-carb", "vegan", "vegetarian"];

export default function SearchBar({ initialQ = "", onSearch, loading }: Props) {
  const [q, setQ] = useState(initialQ);
  const [mealType, setMealType] = useState("");
  const [diet, setDiet] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(q || "popular", mealType, diet);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={submit} className="space-y-3">
        {/* Main search input */}
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--soft-brown)" }}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search recipes — pasta, chicken curry, vegan tacos..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border text-base outline-none transition-all shadow-sm focus:shadow-md"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "white",
              color: "var(--charcoal)",
            }}
          />
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "white",
              color: "var(--charcoal)",
            }}
          >
            {MEAL_TYPES.map((m) => (
              <option key={m} value={m}>
                {m || "All Meal Types"}
              </option>
            ))}
          </select>

          <select
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "white",
              color: "var(--charcoal)",
            }}
          >
            {DIETS.map((d) => (
              <option key={d} value={d}>
                {d || "Any Diet"}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
            style={{ backgroundColor: "var(--terracotta)" }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching…
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
