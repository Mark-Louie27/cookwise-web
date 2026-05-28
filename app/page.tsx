"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import RecipeCard from "@/components/RecipeCard";
import ChatWidget from "@/components/ChatWidget";
import QuotaIndicator from "@/components/QuotaIndicator";
import type { Recipe, EdamamResponse } from "@/types";
import { ChefHat, TrendingUp } from "lucide-react";

const FEATURED_QUERIES = ["pasta", "chicken", "salad", "tacos", "soup", "sushi"];

function extractId(hit: { _links: { self: { href: string } } }): string {
  const url = hit._links?.self?.href || "";
  return url.split("/").pop()?.split("?")[0] || Math.random().toString(36);
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border bg-white" style={{ borderColor: "var(--border)" }}>
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

  const fetchRecipes = useCallback(async (q: string, mealType: string, diet: string, append = false) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ q, from: "0", to: "12" });
      if (mealType) params.set("mealType", mealType);
      if (diet) params.set("diet", diet);
      const res = await fetch(`/api/recipes?${params}`);
      if (res.status === 429) { const d = await res.json(); setError(d.error || "Too many requests."); return; }
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error || "Could not load recipes."); return; }
      const data: EdamamResponse = await res.json();
      const mapped: Recipe[] = data.hits.map((h) => ({ ...h.recipe, id: extractId(h) }));
      if (append) setRecipes((r) => [...r, ...mapped]);
      else setRecipes(mapped);
      setHasMore(!!data._links?.next);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

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
      <div style={{
        backgroundColor: "var(--forest)",
        padding: "64px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "288px", height: "288px", borderRadius: "50%",
          backgroundColor: "var(--amber)", opacity: 0.1, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-64px", left: "-64px",
          width: "224px", height: "224px", borderRadius: "50%",
          backgroundColor: "var(--terracotta)", opacity: 0.1, pointerEvents: "none",
        }} />

        {/* Hero content */}
        <div style={{
          maxWidth: "768px",
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
        }}>
          {/* Badge */}
          <div className="flex items-center justify-center gap-2">
            <TrendingUp size={18} style={{ color: "var(--amber)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--amber)" }}>
              Powered by Edamam · 2.3M+ recipes
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-white leading-tight" style={{ fontSize: "clamp(1rem, 5vw, 3rem)", fontWeight: 700 }}>
            Cook smarter, <span style={{ color: "var(--amber)" }}>eat better</span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem" }}>
            Discover millions of recipes and get instant AI cooking guidance.
          </p>

          {/* Search bar */}
          <div style={{ width: "100%" }}>
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          {/* Quick-search pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {FEATURED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSearch(q, "", "")}
                className="text-sm capitalize transition-all hover:opacity-90 active:scale-95"
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
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
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        {error && (
          <div
            className="mb-6 p-4 rounded-xl text-sm flex items-start gap-3"
            style={{
              backgroundColor: isRateLimit ? "rgba(232,168,56,0.12)" : "rgba(196,97,58,0.1)",
              color: isRateLimit ? "var(--amber)" : "var(--terracotta)",
              border: `1px solid ${isRateLimit ? "rgba(232,168,56,0.3)" : "rgba(196,97,58,0.2)"}`,
            }}
          >
            <span>{isRateLimit ? "⏳" : "⚠️"}</span>
            <span>{error}</span>
          </div>
        )}

        {/* Results header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--charcoal)" }}>
              {loading && recipes.length === 0 ? "Loading…" : `Results for "${query}"`}
            </h2>
            {!loading && (
              <p className="text-sm mt-1" style={{ color: "var(--soft-brown)" }}>
                {recipes.length} recipes found
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <QuotaIndicator />
            <ChefHat size={28} style={{ color: "var(--sage)" }} />
          </div>
        </div>

        {/* Recipe grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}>
          {loading && recipes.length === 0
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : recipes.map((r, i) => <RecipeCard key={`${r.id}-${i}`} recipe={r} />)
          }
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              onClick={() => fetchRecipes(query, "", "", true)}
              className="font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                padding: "12px 32px",
                borderRadius: "12px",
                backgroundColor: "var(--forest)",
              }}
            >
              Load More Recipes
            </button>
          </div>
        )}

        {loading && recipes.length > 0 && (
          <div className="flex justify-center mt-8">
            <div
              className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: "var(--sage)", borderTopColor: "transparent" }}
            />
          </div>
        )}
      </main>

      <ChatWidget />
    </>
  );
}