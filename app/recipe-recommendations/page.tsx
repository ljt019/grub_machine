"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Users, Flame, Zap, Wind, Timer, ArrowLeft, Utensils } from "lucide-react";
import { useMealContext } from "@/contexts/meal-context";
import { ensureRecipesArray } from "@/utils/debug-helper";
import { Separator } from "@/components/ui/separator";

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

interface RecipeResponse {
  mealTitle: string;
  cookingMethod: string;
  difficulty: string;
  ingredients: Array<{ name: string; amount: string }>;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  instructions: Array<string>;
  extraServingSuggestions: Array<string> | string;
}

function RecipeCard({ recipe }: { recipe: RecipeResponse }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-800 border-green-500";
      case "medium":
        return "text-orange-800 border-orange-500";
      case "hard":
        return "text-red-800 border-red-500";
      default:
        return "text-gray-800 border-gray-500";
    }
  };

  const getDifficultyBorderColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "very easy":
      case "easy":
        return "border-emerald-500/50";
      case "medium":
        return "border-orange-500/50";
      case "hard":
      case "very hard":
        return "border-destructive/50";
      default:
        return "border-border";
    }
  };

  const getCookingMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "stove":
        return <Flame className="h-5 w-5 text-chart-5" />;
      case "microwave":
        return <Zap className="h-5 w-5 text-chart-2" />;
      case "airfryer":
        return <Wind className="h-5 w-5 text-chart-3" />;
      case "oven":
        return <ChefHat className="h-5 w-5 text-chart-4" />;
      default:
        return <Utensils className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card
      className={`h-full flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-l-4  ${getDifficultyBorderColor(
        recipe.difficulty
      )}`}
    >
      <CardHeader className="pb-3 bg-card/50">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">{recipe.mealTitle}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getCookingMethodIcon(recipe.cookingMethod)}
              <span className="font-medium">{recipe.cookingMethod}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`${getDifficultyColor(
              recipe.difficulty
            )} px-4 py-1 text-sm font-medium text-center rounded-full bg-card items-center justify-center`}
          >
            {recipe.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-4">
        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center p-2 rounded-md hover:bg-secondary transition-colors">
              <Clock className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Prep
              </span>
              <span className="text-sm font-medium">{recipe.prepTime}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-md hover:bg-secondary transition-colors">
              <Timer className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cook
              </span>
              <span className="text-sm font-medium">{recipe.cookTime}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-md hover:bg-secondary transition-colors">
              <Users className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Serves
              </span>
              <span className="text-sm font-medium">{recipe.servings}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2 pb-1 border-b border-border">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1"></span>
              Ingredients
            </h3>
            <ul className="grid gap-2 pl-1">
              {recipe.ingredients.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/30 mt-2"></span>
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">: {item.amount}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="my-4" />

          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2 pb-1 border-b border-border">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-chart-4 mr-1"></span>
              Instructions
            </h3>
            <ol className="space-y-3 pl-0">
              {recipe.instructions.map((step: string, idx: number) => (
                <li key={idx} className="relative pl-8 pb-1 text-sm">
                  <span className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {idx + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 border-t mt-4 p-4">
        <div className="w-full">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-chart-2 mr-1"></span>
            Serving Suggestion
          </h3>
          <p className="text-sm text-muted-foreground italic">
            {Array.isArray(recipe.extraServingSuggestions)
              ? recipe.extraServingSuggestions.join(", ")
              : recipe.extraServingSuggestions}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
