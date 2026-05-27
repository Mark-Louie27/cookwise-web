"use client";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <WifiOff size={20} style={{ color: "var(--sage)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--sage)" }}>
              Available Offline
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--charcoal)" }}>
            Saved Recipes
          </h1>
          <p className="mt-1" style={{ color: "var(--soft-brown)" }}>
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved locally on this device
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <div className="h-52 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <BookmarkX size={56} className="mx-auto" style={{ color: "var(--border)" }} />
            <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--charcoal)" }}>
              No saved recipes yet
            </h2>
            <p style={{ color: "var(--soft-brown)" }}>
              Tap the bookmark icon on any recipe to save it for offline access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
