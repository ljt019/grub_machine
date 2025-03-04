export interface Recipe {
  mealTitle: string;
  cookingMethod: string;
  difficulty: string;
  ingredients: Array<{ name: string; amount: string }>;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string | number;
  instructions: Array<string>;
  extraServingSuggestions: Array<string>;
  estimatedCaloriesPerServing: string | number;
}
