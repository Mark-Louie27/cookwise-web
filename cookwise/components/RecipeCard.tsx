"use client";
import Image from "next/image";
import Link from "next/link";
import { Clock, Zap, Bookmark, BookmarkCheck } from "lucide-react";
import { useState, useEffect } from "react";
import type { Recipe } from "@/types";
import { saveRecipe, removeRecipe, isRecipeSaved } from "@/lib/db";

interface Props {
  recipe: Recipe;
  onSaveToggle?: () => void;
}

export default function RecipeCard({ recipe, onSaveToggle }: Props) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    isRecipeSaved(recipe.id).then(setSaved).catch(() => {});
  }, [recipe.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (saved) {
        await removeRecipe(recipe.id);
        setSaved(false);
      } else {
        await saveRecipe(recipe);
        setSaved(true);
      }
      onSaveToggle?.();
    } catch {
      alert("Could not save recipe. Make sure your browser supports IndexedDB.");
    } finally {
      setSaving(false);
    }
  };

  const cal = Math.round(recipe.calories / (recipe.yield || 1));
  const encodedId = encodeURIComponent(recipe.id);

  const handleClick = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`recipe-${recipe.id}`, JSON.stringify(recipe));
    }
  };

  return (
    <Link href={`/recipe/${encodedId}`} className="block" onClick={handleClick}>
      <div
        className="recipe-card rounded-2xl overflow-hidden border bg-white"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Image */}
        <div className="relative h-52 bg-gray-100">
          {recipe.image ? (
            <Image
              src={recipe.image}
              alt={recipe.label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
          )}
          {/* Save button */}
          <button
            onClick={toggleSave}
            disabled={saving}
            aria-label={saved ? "Unsave recipe" : "Save recipe"}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all"
            style={{
              backgroundColor: saved ? "var(--forest)" : "white",
              color: saved ? "white" : "var(--charcoal)",
            }}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          {/* Meal type badge */}
          {recipe.mealType?.[0] && (
            <span
              className="absolute bottom-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full capitalize"
              style={{ backgroundColor: "var(--amber)", color: "var(--charcoal)" }}
            >
              {recipe.mealType[0]}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3
            className="font-display text-lg font-semibold leading-snug mb-2 line-clamp-2"
            style={{ color: "var(--charcoal)" }}
          >
            {recipe.label}
          </h3>
          <p className="text-sm mb-3" style={{ color: "var(--soft-brown)" }}>
            {recipe.source}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            {recipe.totalTime > 0 && (
              <span className="flex items-center gap-1" style={{ color: "var(--soft-brown)" }}>
                <Clock size={14} />
                {recipe.totalTime} min
              </span>
            )}
            <span className="flex items-center gap-1" style={{ color: "var(--terracotta)" }}>
              <Zap size={14} />
              {cal} kcal / serving
            </span>
          </div>

          {/* Diet labels */}
          {recipe.dietLabels?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {recipe.dietLabels.slice(0, 3).map((d) => (
                <span
                  key={d}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(122,158,126,0.15)", color: "var(--forest)" }}
                >
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// Utility: call this from parent to store recipe before nav
export function storeRecipeForNav(recipe: Recipe) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`recipe-${recipe.id}`, JSON.stringify(recipe));
  }
}
