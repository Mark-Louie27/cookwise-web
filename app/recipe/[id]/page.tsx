"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import type { Recipe } from "@/types";
import { isRecipeSaved, saveRecipe, removeRecipe } from "@/lib/db";
import {
  ArrowLeft,
  Clock,
  Users,
  Zap,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  CheckCircle2,
  Apple,
} from "lucide-react";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    if (!id) return;
    const stored = sessionStorage.getItem(`recipe-${id}`);
    if (stored) {
      const r = JSON.parse(stored);
      setRecipe(r);
      setLoading(false);
      isRecipeSaved(r.id)
        .then(setSaved)
        .catch(() => {});
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
          <div className="w-10 h-10 border-4 border-sage border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!recipe) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <p className="font-display text-xl mb-4">Recipe not found</p>
          <p className="text-sm mb-6 text-soft-brown">
            This recipe may not be in your session. Please search for it from
            the home page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl bg-forest text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
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

  const nutrients = [
    {
      label: "Calories",
      value: `${cal}`,
      unit: "kcal",
      color: "text-terracotta",
    },
    {
      label: "Protein",
      value: protein ? Math.round(protein.quantity / recipe.yield) + "" : "—",
      unit: "g",
      color: "text-forest",
    },
    {
      label: "Carbs",
      value: carbs ? Math.round(carbs.quantity / recipe.yield) + "" : "—",
      unit: "g",
      color: "text-amber",
    },
    {
      label: "Fat",
      value: fat ? Math.round(fat.quantity / recipe.yield) + "" : "—",
      unit: "g",
      color: "text-sage",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-soft-brown hover:opacity-75 transition-opacity cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft size={18} /> Back to results
        </button>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Left: image + nutrition */}
          <div className="flex flex-col gap-5">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-border-custom">
              {recipe.image ? (
                <Image
                  src={recipe.image}
                  alt={recipe.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🍽️
                </div>
              )}
            </div>

            {/* Nutrition grid */}
            <div className="grid grid-cols-2 gap-3">
              {nutrients.map((n) => (
                <div
                  key={n.label}
                  className="rounded-xl p-3.5 border border-border-custom bg-white text-center"
                >
                  <p className={`font-display text-2xl font-bold ${n.color}`}>
                    {n.value}
                  </p>
                  <p className="text-xs mt-1 text-soft-brown">
                    {n.label} ({n.unit})
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: details */}
          <div className="flex flex-col gap-6">
            {/* Title block */}
            <div>
              {recipe.cuisineType?.[0] && (
                <span className="text-xs font-semibold uppercase tracking-widest text-sage">
                  {recipe.cuisineType[0]} cuisine
                </span>
              )}
              <h1 className="font-display font-bold leading-tight mt-1 text-charcoal text-[clamp(1.75rem,4vw,2.5rem)]">
                {recipe.label}
              </h1>
              <p className="text-sm mt-1 text-soft-brown">
                Recipe by <span className="font-medium">{recipe.source}</span>
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-charcoal">
                {recipe.totalTime > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-sage" /> {recipe.totalTime}{" "}
                    minutes
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users size={16} className="text-sage" /> {recipe.yield}{" "}
                  servings
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap size={16} className="text-terracotta" /> {cal} kcal /
                  serving
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-5 flex-wrap">
                <button
                  onClick={toggleSave}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    saved
                      ? "bg-forest text-white border-none"
                      : "bg-white text-charcoal border border-border-custom"
                  }`}
                >
                  {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {saved ? "Saved" : "Save Recipe"}
                </button>
                <a
                  href={recipe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-terracotta hover:opacity-90 transition-all no-underline"
                >
                  <ExternalLink size={16} /> Full Instructions
                </a>
              </div>
            </div>

            {/* Diet & health labels */}
            {(recipe.dietLabels?.length > 0 ||
              recipe.healthLabels?.length > 0) && (
              <div>
                <h3 className="font-semibold text-sm mb-2 text-soft-brown">
                  Diet & Health
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ...recipe.dietLabels,
                    ...recipe.healthLabels.slice(0, 6),
                  ].map((l) => (
                    <span
                      key={l}
                      className="text-xs px-2.5 py-1 rounded-full bg-sage/15 text-forest"
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
                <Apple size={18} className="text-terracotta" />
                <h3 className="font-display font-semibold text-xl text-charcoal">
                  Ingredients
                </h3>
                <span className="text-xs text-soft-brown">
                  (tap to check off)
                </span>
              </div>
              <ul className="list-none flex flex-col gap-2">
                {recipe.ingredientLines.map((line, i) => {
                  const isChecked = checkedIngredients.has(i);
                  return (
                    <li
                      key={i}
                      onClick={() => toggleIngredient(i)}
                      className={`flex items-start gap-3 text-sm cursor-pointer py-1 ${
                        isChecked ? "text-sage" : "text-charcoal"
                      }`}
                    >
                      <CheckCircle2
                        size={18}
                        className={`mt-0.5 flex-shrink-0 transition-colors ${
                          isChecked ? "text-sage" : "text-border-custom"
                        }`}
                      />
                      <span
                        className={`transition-all ${
                          isChecked ? "line-through opacity-50" : "no-underline"
                        }`}
                      >
                        {line}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <ChatWidget />
    </>
  );
}
