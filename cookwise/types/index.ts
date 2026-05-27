export interface Recipe {
  id: string;
  label: string;
  image: string;
  source: string;
  url: string;
  yield: number;
  calories: number;
  totalTime: number;
  cuisineType: string[];
  mealType: string[];
  dishType: string[];
  dietLabels: string[];
  healthLabels: string[];
  ingredientLines: string[];
  totalNutrients: Record<string, Nutrient>;
  digest: DigestItem[];
}

export interface Nutrient {
  label: string;
  quantity: number;
  unit: string;
}

export interface DigestItem {
  label: string;
  tag: string;
  total: number;
  unit: string;
}

export interface EdamamHit {
  recipe: Recipe;
  _links: { self: { href: string; title: string } };
}

export interface EdamamResponse {
  hits: EdamamHit[];
  count: number;
  from: number;
  to: number;
  _links: { next?: { href: string } };
}

export interface SavedRecipe extends Recipe {
  savedAt: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
