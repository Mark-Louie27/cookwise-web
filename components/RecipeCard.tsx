"use client";
import Image from "next/image";
import Link from "next/link";
import { Clock, Zap, Bookmark, BookmarkCheck, ChevronRight } from "lucide-react";
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
    isRecipeSaved(recipe.id).then(setSaved).catch(() => {});
  }, [recipe.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    try {
      if (saved) { await removeRecipe(recipe.id); setSaved(false); }
      else        { await saveRecipe(recipe);      setSaved(true);  }
      onSaveToggle?.();
    } catch { alert("Could not save recipe."); }
    finally { setSaving(false); }
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
      style={{ display: "block", textDecoration: "none" }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "white",
          border: "1px solid var(--border)",
          boxShadow: hovered
            ? "0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)"
            : "0 2px 8px rgba(0,0,0,0.04)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.3s ease",
        }}
      >
        {/* Image */}
        <div style={{ position: "relative", height: "208px", backgroundColor: "#f3f4f6", overflow: "hidden" }}>
          {recipe.image ? (
            <Image
              src={recipe.image}
              alt={recipe.label}
              fill
              style={{
                objectFit: "cover",
                transform: hovered ? "scale(1.06)" : "scale(1)",
                transition: "transform 0.5s ease",
              }}
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", backgroundColor: "#fffbeb" }}>🍽️</div>
          )}

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
              opacity: hovered ? 1 : 0.6,
              transition: "opacity 0.3s",
            }}
          />

          {/* Meal type badge */}
          {recipe.mealType?.[0] && (
            <span
              style={{
                position: "absolute",
                bottom: "12px",
                left: "12px",
                fontSize: "11px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "9999px",
                textTransform: "capitalize",
                letterSpacing: "0.03em",
                backgroundColor: "var(--amber)",
                color: "var(--charcoal)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {recipe.mealType[0]}
            </span>
          )}

          {/* Save button */}
          <button
            onClick={toggleSave}
            disabled={saving}
            aria-label={saved ? "Unsave recipe" : "Save recipe"}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              backgroundColor: saved ? "var(--forest)" : "rgba(255,255,255,0.92)",
              color: saved ? "white" : "var(--charcoal)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              backdropFilter: "blur(4px)",
              transform: saving ? "scale(0.9)" : "scale(1)",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saved
              ? <BookmarkCheck size={16} strokeWidth={2.5} />
              : <Bookmark size={16} strokeWidth={2} />
            }
          </button>

          {/* Source watermark */}
          <p
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              fontSize: "10px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {recipe.source}
          </p>
        </div>

        {/* Card Body */}
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>

          {/* Title */}
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "15px",
              fontWeight: 600,
              lineHeight: 1.4,
              color: hovered ? "var(--terracotta)" : "var(--charcoal)",
              transition: "color 0.2s",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {recipe.label}
          </h3>

          {/* Stats row */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {recipe.totalTime > 0 && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  padding: "4px 10px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(122,158,126,0.12)",
                  color: "var(--forest)",
                }}
              >
                <Clock size={12} strokeWidth={2.5} />
                {recipe.totalTime} min
              </span>
            )}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 500,
                padding: "4px 10px",
                borderRadius: "8px",
                backgroundColor: "rgba(196,97,58,0.1)",
                color: "var(--terracotta)",
              }}
            >
              <Zap size={12} strokeWidth={2.5} />
              {cal} kcal
            </span>
          </div>

          {/* Diet labels */}
          {recipe.dietLabels?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {recipe.dietLabels.slice(0, 3).map((d) => (
                <span
                  key={d}
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    fontWeight: 500,
                    backgroundColor: "rgba(122,158,126,0.12)",
                    color: "var(--forest)",
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          )}

          {/* View recipe CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--terracotta)",
              maxHeight: hovered ? "24px" : "0px",
              opacity: hovered ? 1 : 0,
              overflow: "hidden",
              transition: "all 0.2s ease",
            }}
          >
            View recipe <ChevronRight size={13} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </Link>
  );
}