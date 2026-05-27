"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import type { Recipe } from "@/types";
import { isRecipeSaved, saveRecipe, removeRecipe } from "@/lib/db";
import {
  ArrowLeft, Clock, Users, Zap, Bookmark, BookmarkCheck,
  ExternalLink, CheckCircle2, Apple
} from "lucide-react";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!id) return;

    const stored = sessionStorage.getItem(`recipe-${id}`);
    if (stored) {
      const r = JSON.parse(stored);
      setRecipe(r);
      setLoading(false);
      isRecipeSaved(r.id).then(setSaved).catch(() => {});
      return;
    }
    setLoading(false);
  }, [id]);

  const toggleIngredient = (i: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const toggleSave = async () => {
    if (!recipe) return;
    if (saved) {
      await removeRecipe(recipe.id);
      setSaved(false);
    } else {
      await saveRecipe(recipe);
      setSaved(true);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--sage)", borderTopColor: "transparent" }} />
        </div>
      </>
    );
  }

  if (!recipe) {
    return (
      <>
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <p className="text-xl font-display mb-4">Recipe not found</p>
          <p className="text-sm mb-6" style={{ color: "var(--soft-brown)" }}>
            This recipe may not be in your session. Please search for it from the home page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: "var(--forest)" }}
          >
            Back to Search
          </button>
        </div>
      </>
    );
  }

  const cal = Math.round(recipe.calories / (recipe.yield || 1));
  const carbs = recipe.totalNutrients?.CHOCDF;
  const protein = recipe.totalNutrients?.PROCNT;
  const fat = recipe.totalNutrients?.FAT;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm mb-6 hover:opacity-75 transition-opacity"
          style={{ color: "var(--soft-brown)" }}
        >
          <ArrowLeft size={18} />
          Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: image + quick stats */}
          <div className="lg:col-span-2 space-y-5">
            <div className="relative rounded-2xl overflow-hidden aspect-square">
              {recipe.image ? (
                <Image src={recipe.image} alt={recipe.label} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl" style={{ backgroundColor: "var(--border)" }}>🍽️</div>
              )}
            </div>

            {/* Nutrition cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Calories", value: `${cal}`, unit: "kcal", color: "var(--terracotta)" },
                { label: "Protein", value: protein ? Math.round(protein.quantity / recipe.yield) + "" : "—", unit: "g", color: "var(--forest)" },
                { label: "Carbs", value: carbs ? Math.round(carbs.quantity / recipe.yield) + "" : "—", unit: "g", color: "var(--amber)" },
                { label: "Fat", value: fat ? Math.round(fat.quantity / recipe.yield) + "" : "—", unit: "g", color: "var(--sage)" },
              ].map((n) => (
                <div key={n.label} className="rounded-xl p-3 border text-center" style={{ borderColor: "var(--border)", backgroundColor: "white" }}>
                  <p className="text-2xl font-bold font-display" style={{ color: n.color }}>{n.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--soft-brown)" }}>{n.label} ({n.unit})</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title + actions */}
            <div>
              {recipe.cuisineType?.[0] && (
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--sage)" }}>
                  {recipe.cuisineType[0]} cuisine
                </span>
              )}
              <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1 leading-tight" style={{ color: "var(--charcoal)" }}>
                {recipe.label}
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--soft-brown)" }}>
                Recipe by <span className="font-medium">{recipe.source}</span>
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                {recipe.totalTime > 0 && (
                  <span className="flex items-center gap-1.5" style={{ color: "var(--charcoal)" }}>
                    <Clock size={16} style={{ color: "var(--sage)" }} />
                    {recipe.totalTime} minutes
                  </span>
                )}
                <span className="flex items-center gap-1.5" style={{ color: "var(--charcoal)" }}>
                  <Users size={16} style={{ color: "var(--sage)" }} />
                  {recipe.yield} servings
                </span>
                <span className="flex items-center gap-1.5" style={{ color: "var(--charcoal)" }}>
                  <Zap size={16} style={{ color: "var(--terracotta)" }} />
                  {cal} kcal / serving
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={toggleSave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={
                    saved
                      ? { backgroundColor: "var(--forest)", color: "white" }
                      : { backgroundColor: "white", color: "var(--charcoal)", border: "1.5px solid var(--border)" }
                  }
                >
                  {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {saved ? "Saved" : "Save Recipe"}
                </button>
                <a
                  href={recipe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "var(--terracotta)" }}
                >
                  <ExternalLink size={16} />
                  Full Instructions
                </a>
              </div>
            </div>

            {/* Diet & health labels */}
            {(recipe.dietLabels?.length > 0 || recipe.healthLabels?.length > 0) && (
              <div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--soft-brown)" }}>Diet & Health</h3>
                <div className="flex flex-wrap gap-1.5">
                  {[...recipe.dietLabels, ...recipe.healthLabels.slice(0, 6)].map((l) => (
                    <span
                      key={l}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(122,158,126,0.15)", color: "var(--forest)" }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Apple size={18} style={{ color: "var(--terracotta)" }} />
                <h3 className="font-display font-semibold text-xl" style={{ color: "var(--charcoal)" }}>
                  Ingredients
                </h3>
                <span className="text-xs ml-1" style={{ color: "var(--soft-brown)" }}>
                  (tap to check off)
                </span>
              </div>
              <ul className="space-y-2">
                {recipe.ingredientLines.map((line, i) => (
                  <li
                    key={i}
                    onClick={() => toggleIngredient(i)}
                    className="flex items-start gap-3 text-sm cursor-pointer group py-1"
                    style={{ color: checkedIngredients.has(i) ? "var(--sage)" : "var(--charcoal)" }}
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 flex-shrink-0 transition-colors"
                      style={{ color: checkedIngredients.has(i) ? "var(--sage)" : "var(--border)" }}
                    />
                    <span style={{ textDecoration: checkedIngredients.has(i) ? "line-through" : "none", opacity: checkedIngredients.has(i) ? 0.5 : 1 }}>
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <ChatWidget />
    </>
  );
}
