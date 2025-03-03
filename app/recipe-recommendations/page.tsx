"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Users, Flame, Zap, Wind, Timer, ArrowLeft } from "lucide-react";
import { useMealContext } from "@/contexts/meal-context";
import { ensureRecipesArray } from "@/utils/debug-helper";

export default function RecipeRecommendations() {
  const router = useRouter();
  const { recommendations } = useMealContext();
  const [recipesArray, setRecipesArray] = useState<RecipeResponse[]>([]);

  useEffect(() => {
    console.log("Raw recommendations data:", recommendations);
    const safeArray = ensureRecipesArray(recommendations);
    console.log("Converted to safe array:", safeArray);
    setRecipesArray(safeArray);

    // If no recommendations, redirect back to home
    if (!recommendations || safeArray.length === 0) {
      console.log("No recipes found, redirecting to home");
      router.push("/");
    }
  }, [recommendations, router]);

  if (!recipesArray || recipesArray.length === 0) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold order-first md:order-none">Meal Recommendations</h1>
      </div>

      <div className="text-center mb-10">
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover delicious recipes tailored to your preferences and available ingredients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {recipesArray.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} />
        ))}
      </div>

      <div className="flex w-full md:w-auto pt-4 items-center justify-center">
        <Button size="sm" className="flex items-center gap-2" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Start
        </Button>
      </div>
    </div>
  );
}

// Update the RecipeResponse interface to match the actual API response
interface RecipeResponse {
  mealTitle: string;
  cookingMethod: string;
  difficulty: string;
  ingredients: Array<{ name: string; amount: string }>; // Changed from Record<string, string>
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  instructions: Array<string>;
  extraServingSuggestions: Array<string> | string; // Handle both array and string
}

function RecipeCard({ recipe }: { recipe: RecipeResponse }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "very easy":
        return "bg-green-100 text-green-800";
      case "easy":
        return "bg-emerald-100 text-emerald-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "hard":
        return "bg-orange-100 text-orange-800";
      case "very hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getCookingMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "stove":
        return <Flame className="h-5 w-5" />;
      case "microwave":
        return <Zap className="h-5 w-5" />;
      case "airfryer":
        return <Wind className="h-5 w-5" />;
      default:
        return <ChefHat className="h-5 w-5" />;
    }
  };

  console.log(recipe);

  return (
    <Card
      className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow border-l-4"
      style={{
        borderLeftColor: recipe.difficulty.toLowerCase().includes("easy")
          ? "#10b981"
          : recipe.difficulty.toLowerCase().includes("medium")
          ? "#f59e0b"
          : "#ef4444",
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{recipe.mealTitle}</CardTitle>
          <Badge variant="outline" className={getDifficultyColor(recipe.difficulty)}>
            {recipe.difficulty}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 mt-1">
          {getCookingMethodIcon(recipe.cookingMethod)}
          <span>{recipe.cookingMethod}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="bg-muted/30 p-4 rounded-md mb-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <Clock className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs font-medium">Prep Time</span>
              <span className="text-sm">{recipe.prepTime}</span>
            </div>
            <div className="flex flex-col items-center">
              <Timer className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs font-medium">Cook Time</span>
              <span className="text-sm">{recipe.cookTime}</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs font-medium">Servings</span>
              <span className="text-sm">{recipe.servings}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-1">
              {recipe.ingredients.map((item, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-medium">{item.name}</span>: {item.amount}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Instructions</h3>
            <ol className="list-decimal pl-5 space-y-1">
              {recipe.instructions.map((step: string, idx: number) => (
                <li key={idx} className="text-sm">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div>
          <h3 className="font-medium mb-1">Serving Suggestion</h3>
          <p className="text-sm text-muted-foreground">
            {Array.isArray(recipe.extraServingSuggestions)
              ? recipe.extraServingSuggestions.join(", ")
              : recipe.extraServingSuggestions}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
