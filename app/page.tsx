"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import RecipeCard from "@/components/RecipeCard";
import ChatWidget from "@/components/ChatWidget";
import QuotaIndicator from "@/components/QuotaIndicator";
import type { Recipe, EdamamResponse } from "@/types";
import { ChefHat, TrendingUp } from "lucide-react";

const FEATURED_QUERIES = [
  "pasta",
  "chicken",
  "salad",
  "tacos",
  "soup",
  "sushi",
];

function extractId(hit: { _links: { self: { href: string } } }): string {
  const url = hit._links?.self?.href || "";
  return url.split("/").pop()?.split("?")[0] || Math.random().toString(36);
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border-custom bg-warm-white">
      <div className="h-52 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="h-3 skeleton rounded w-2/3 mt-2" />
      </div>
    </div>
  );
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("chicken");
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  const fetchRecipes = useCallback(
    async (q: string, mealType: string, diet: string, append = false) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ q, from: "0", to: "12" });
        if (mealType) params.set("mealType", mealType);
        if (diet) params.set("diet", diet);
        const res = await fetch(`/api/recipes?${params}`);
        if (res.status === 429) {
          const d = await res.json();
          setError(d.error || "Too many requests.");
          return;
        }
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d.error || "Could not load recipes.");
          return;
        }
        const data: EdamamResponse = await res.json();
        const mapped: Recipe[] = data.hits.map((h) => ({
          ...h.recipe,
          id: extractId(h),
        }));
        if (append) setRecipes((r) => [...r, ...mapped]);
        else setRecipes(mapped);
        setHasMore(!!data._links?.next);
      } catch {
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchRecipes("chicken", "", "");
  }, [fetchRecipes]);

  const handleSearch = (q: string, mealType: string, diet: string) => {
    setQuery(q);
    fetchRecipes(q, mealType, diet);
  };

  const isRateLimit = error.includes("limit") || error.includes("slow down");

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="bg-forest py-16 px-6 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber opacity-10 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-terracotta opacity-10 pointer-events-none" />

        {/* Hero content */}
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-5 relative">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2">
            <TrendingUp size={18} className="text-amber" />
            <span className="text-sm font-medium text-amber">
              Powered by Edamam · 2.3M+ recipes
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-white leading-tight text-3xl sm:text-4xl md:text-5xl">
            Cook smarter, <span className="text-amber">eat better</span>
          </h1>

          <p className="text-white/70 text-lg">
            Discover millions of recipes and get instant AI cooking guidance.
          </p>

          {/* Search bar */}
          <div className="w-full">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          {/* Quick-search pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {FEATURED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSearch(q, "", "")}
                className="text-sm capitalize transition-all hover:opacity-90 active:scale-95 px-4 py-1.5 rounded-full bg-white/10 text-white/80 border border-white/15"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-7xl mx-auto py-10 px-6">
        {error && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 ${
              isRateLimit
                ? "bg-amber/10 text-amber border border-amber/30"
                : "bg-terracotta/10 text-terracotta border border-terracotta/20"
            }`}
          >
            <span>{isRateLimit ? "⏳" : "⚠️"}</span>
            <span>{error}</span>
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-charcoal">
              {loading && recipes.length === 0
                ? "Loading…"
                : `Results for "${query}"`}
            </h2>
            {!loading && (
              <p className="text-sm mt-1 text-soft-brown">
                {recipes.length} recipes found
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <QuotaIndicator />
            <ChefHat size={28} className="text-sage" />
          </div>
        </div>

        {/* Recipe grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {loading && recipes.length === 0
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : recipes.map((r, i) => (
                <RecipeCard key={`${r.id}-${i}`} recipe={r} />
              ))}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div className="text-center mt-10">
            <button
              onClick={() => fetchRecipes(query, "", "", true)}
              className="font-semibold text-white bg-forest px-8 py-3 rounded-xl transition-all hover:opacity-90 active:scale-95"
            >
              Load More Recipes
            </button>
          </div>
        )}

        {loading && recipes.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </main>

      <ChatWidget />
    </>
  );
}
