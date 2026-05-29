"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import ChatWidget from "@/components/ChatWidget";
import { getSavedRecipes } from "@/lib/db";
import type { SavedRecipe } from "@/types";
import { BookmarkX, WifiOff } from "lucide-react";

export default function SavedPage() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getSavedRecipes();
      setRecipes(data);
    } catch {
      console.error("Could not load saved recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div className="flex items-center gap-3 mb-1">
            <WifiOff size={20} style={{ color: "var(--sage)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--sage)" }}>
              Available Offline
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--charcoal)" }}>
            Saved Recipes
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--soft-brown)" }}>
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved locally on this device
          </p>
        </div>

        {/* Loading skeletons */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <div className="h-52 animate-pulse" style={{ backgroundColor: "#e5e7eb" }} />
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="animate-pulse rounded" style={{ height: "16px", width: "75%", backgroundColor: "#e5e7eb" }} />
                  <div className="animate-pulse rounded" style={{ height: "12px", width: "50%", backgroundColor: "#e5e7eb" }} />
                </div>
              </div>
            ))}
          </div>

        ) : recipes.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: "center", padding: "96px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <BookmarkX size={56} style={{ color: "var(--border)" }} />
            <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--charcoal)" }}>
              No saved recipes yet
            </h2>
            <p style={{ color: "var(--soft-brown)", maxWidth: "360px" }}>
              Tap the bookmark icon on any recipe to save it for offline access.
            </p>
            <Link
              href="/"
              style={{
                marginTop: "8px",
                padding: "12px 28px",
                borderRadius: "12px",
                backgroundColor: "var(--forest)",
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Browse Recipes
            </Link>
          </div>

        ) : (
          /* Recipe grid */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} onSaveToggle={load} />
            ))}
          </div>
        )}
      </main>
      <ChatWidget />
    </>
  );
}