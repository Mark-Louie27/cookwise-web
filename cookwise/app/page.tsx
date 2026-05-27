"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import RecipeCard from "@/components/RecipeCard";
import ChatWidget from "@/components/ChatWidget";
import type { Recipe, EdamamResponse } from "@/types";
import { ChefHat, TrendingUp } from "lucide-react";

const FEATURED_QUERIES = ["pasta", "chicken", "salad", "tacos", "soup", "sushi"];

function extractId(hit: { _links: { self: { href: string } } }): string {
  const url = hit._links?.self?.href || "";
  return url.split("/").pop()?.split("?")[0] || Math.random().toString(36);
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("popular chicken");
  const [hasMore, setHasMore] = useState(false);
  const [nextHref, setNextHref] = useState<string | null>(null);
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
        if (!res.ok) throw new Error("Failed to fetch");
        const data: EdamamResponse = await res.json();
        const mapped: Recipe[] = data.hits.map((h) => ({
          ...h.recipe,
          id: extractId(h),
        }));
        if (append) setRecipes((r) => [...r, ...mapped]);
        else setRecipes(mapped);
        setHasMore(!!data._links?.next);
        setNextHref(data._links?.next?.href || null);
      } catch {
        setError("Could not load recipes. Please check your Edamam API keys.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchRecipes("popular chicken", "", "");
  }, [fetchRecipes]);

  const handleSearch = (q: string, mealType: string, diet: string) => {
    setQuery(q);
    fetchRecipes(q, mealType, diet);
  };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div
        className="relative overflow-hidden py-16 px-4"
        style={{ backgroundColor: "var(--forest)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10"
          style={{ backgroundColor: "var(--amber)" }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10"
          style={{ backgroundColor: "var(--terracotta)" }}
        />

        <div className="relative max-w-3xl mx-auto text-center space-y-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp size={18} style={{ color: "var(--amber)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--amber)" }}>
              Powered by Edamam · 2.3M+ recipes
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
            Cook smarter,{" "}
            <span style={{ color: "var(--amber)" }}>eat better</span>
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.7)" }}>
            Discover millions of recipes and get instant AI cooking guidance.
          </p>
          <SearchBar onSearch={handleSearch} loading={loading} />

          {/* Quick picks */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {FEATURED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSearch(q, "", "")}
                className="text-sm px-3 py-1.5 rounded-full capitalize transition-all hover:opacity-90"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {error && (
          <div
            className="mb-6 p-4 rounded-xl text-sm"
            style={{ backgroundColor: "rgba(196,97,58,0.1)", color: "var(--terracotta)" }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--charcoal)" }}>
              {recipes.length > 0 ? `Results for "${query}"` : "Loading..."}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--soft-brown)" }}>
              {recipes.length} recipes found
            </p>
          </div>
          <ChefHat size={28} style={{ color: "var(--sage)" }} />
        </div>

        {/* Grid */}
        {loading && recipes.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <div className="h-52 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recipes.map((r, i) => (
              <RecipeCard key={`${r.id}-${i}`} recipe={r} />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="text-center mt-10">
            <button
              onClick={() => {
                // Re-fetch with incremented from
                fetchRecipes(query, "", "", true);
              }}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--forest)" }}
            >
              Load More Recipes
            </button>
          </div>
        )}
      </main>

      <ChatWidget />
    </>
  );
}
