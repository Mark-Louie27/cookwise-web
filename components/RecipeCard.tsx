"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Zap,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
} from "lucide-react";
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
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    isRecipeSaved(recipe.id)
      .then(setSaved)
      .catch(() => {});
  }, [recipe.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      alert("Could not save recipe.");
    } finally {
      setSaving(false);
    }
  };

  const handleClick = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`recipe-${recipe.id}`, JSON.stringify(recipe));
    }
  };

  const cal = Math.round(recipe.calories / (recipe.yield || 1));
  const encodedId = encodeURIComponent(recipe.id);

  return (
    <Link
      href={`/recipe/${encodedId}`}
      className="block no-underline h-full"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* h-full + flex flex-col makes every card stretch to row height */}
      <div
        className={`h-full flex flex-col rounded-2xl overflow-hidden bg-white border border-border-custom transition-all duration-300 ${
          hovered
            ? "shadow-[0_16px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] -translate-y-1"
            : "shadow-[0_2px_8px_rgba(0,0,0,0.04)] translate-y-0"
        }`}
      >
        {/* Image — fixed height, never shrinks */}
        <div className="relative h-52 shrink-0 bg-gray-100 overflow-hidden">
          {recipe.image ? (
            <Image
              src={recipe.image}
              alt={recipe.label}
              fill
              className={`object-cover transition-transform duration-500 ease-in-out ${hovered ? "scale-[1.06]" : "scale-100"}`}
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-amber-50">
              🍽️
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 bg-gradient-to-t from-black/55 via-black/10 to-transparent ${
              hovered ? "opacity-100" : "opacity-60"
            }`}
          />

          {/* Meal type badge */}
          {recipe.mealType?.[0] && (
            <span className="absolute bottom-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize tracking-[0.03em] bg-amber text-charcoal shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              {recipe.mealType[0]}
            </span>
          )}

          {/* Save button */}
          <button
            onClick={toggleSave}
            disabled={saving}
            aria-label={saved ? "Unsave recipe" : "Save recipe"}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.2)] backdrop-blur-sm ${
              saved ? "bg-forest text-white" : "bg-white/92 text-charcoal"
            } ${saving ? "scale-90 opacity-60 cursor-not-allowed" : "scale-100 opacity-100"}`}
          >
            {saved ? (
              <BookmarkCheck size={16} strokeWidth={2.5} />
            ) : (
              <Bookmark size={16} strokeWidth={2} />
            )}
          </button>

          {/* Source watermark */}
          <p className="absolute bottom-3 right-3 text-[10px] font-medium text-white/75 max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
            {recipe.source}
          </p>
        </div>

        {/* Card Body — grows to fill remaining height */}
        <div className="flex flex-col flex-1 p-4 gap-2.5">
          {/* Title — fixed to 2 lines always */}
          <h3
            className={`font-display text-[15px] font-semibold leading-snug transition-colors duration-200 line-clamp-2 min-h-[2.6em] ${
              hovered ? "text-terracotta" : "text-charcoal"
            }`}
          >
            {recipe.label}
          </h3>

          {/* Stats row */}
          <div className="flex items-center gap-2 flex-wrap">
            {recipe.totalTime > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-sage/12 text-forest">
                <Clock size={12} strokeWidth={2.5} />
                {recipe.totalTime} min
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-terracotta/10 text-terracotta">
              <Zap size={12} strokeWidth={2.5} />
              {cal} kcal
            </span>
          </div>

          {/* Diet labels — fixed height slot, always takes up space */}
          <div className="flex flex-wrap gap-1.5 min-h-[24px]">
            {recipe.dietLabels?.slice(0, 3).map((d) => (
              <span
                key={d}
                className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-sage/12 text-forest"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Spacer — pushes CTA to bottom */}
          <div className="flex-1" />

          {/* View recipe CTA */}
          <div
            className={`flex items-center gap-1 text-xs font-semibold text-terracotta overflow-hidden transition-all duration-200 ease-in-out ${
              hovered ? "max-h-6 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            View recipe <ChevronRight size={13} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </Link>
  );
}
