"use client";

import type React from "react";
import { type MealOption, MealOptionPill } from "@/components/meal-option";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useMealContext } from "@/contexts/meal-context";

export default function Home() {
  return (
    <div className="flex flex-col justify-center min-h-screen items-center p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-8">Grub Machine</h1>
      <MealSelectionForm />
    </div>
  );
}

interface ContinueButtonProps {
  mealSelected: boolean;
}

function ContinueButton({ mealSelected }: ContinueButtonProps) {
  const router = useRouter();

  return (
    <Button
      className="rounded-full p-0 w-6 h-6 flex items-center justify-center"
      onClick={() => router.push("/meal-form")}
      disabled={!mealSelected}
    >
      <ArrowRight />
    </Button>
  );
}

function IngredientsList() {
  const { ingredients, setIngredients } = useMealContext();
  const [newIngredient, setNewIngredient] = useState("");

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          placeholder="Add ingredient"
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={addIngredient} size="sm">
          Add
        </Button>
      </div>

      {ingredients.length > 0 && (
        <div className="space-y-2">
          <ul className="space-y-1">
            {ingredients.map((ingredient, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-muted/50 px-3 py-1 rounded-md"
              >
                <span>{ingredient}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeIngredient(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DislikesList() {
  const { dislikes, setDislikes } = useMealContext();
  const [newDislike, setNewDislike] = useState("");

  const addDislike = () => {
    if (newDislike.trim()) {
      setDislikes([...dislikes, newDislike.trim()]);
      setNewDislike("");
    }
  };

  const removeDislike = (index: number) => {
    setDislikes(dislikes.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addDislike();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newDislike}
          onChange={(e) => setNewDislike(e.target.value)}
          placeholder="Add dislike"
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={addDislike} size="sm">
          Add
        </Button>
      </div>

      {dislikes.length > 0 && (
        <div className="space-y-2">
          <ul className="space-y-1">
            {dislikes.map((dislike, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-muted/50 px-3 py-1 rounded-md"
              >
                <span>{dislike}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeDislike(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MealSelectionForm() {
  const { mealType, setMealType } = useMealContext();
  const [selectedMealOption, setSelectedMealOption] = useState<MealOption | null>(
    (mealType as MealOption) || null
  );

  const onMealSelect = (value: MealOption) => {
    setSelectedMealOption(value);
    setMealType(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-[900px]">
      {/* Main meal type selection card - takes more space */}
      <Card className="md:col-span-3">
        <CardHeader>
          <div className="justify-between flex">
            <CardTitle>What meal are you making?</CardTitle>
            <ContinueButton mealSelected={selectedMealOption != null} />
          </div>
        </CardHeader>
        <CardContent>
          <MealSelection selectedMealOption={selectedMealOption} onMealSelect={onMealSelect} />
        </CardContent>
      </Card>

      {/* Ingredients card - smaller and less prominent */}
      <Card className="md:col-span-3 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <IngredientsList />
        </CardContent>
      </Card>

      {/* Dislikes card - smaller and less prominent */}
      <Card className="md:col-span-3 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Dislikes</CardTitle>
        </CardHeader>
        <CardContent>
          <DislikesList />
        </CardContent>
      </Card>
    </div>
  );
}

interface MealSelectionProps {
  selectedMealOption: MealOption | null;
  onMealSelect: (value: MealOption) => void;
}

function MealSelection({ selectedMealOption, onMealSelect }: MealSelectionProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <MealOptionPill
        label={"Breakfast"}
        icon={"🍳"}
        value={"breakfast"}
        selected={selectedMealOption === "breakfast"}
        onSelect={onMealSelect}
      />
      <MealOptionPill
        label={"Lunch"}
        icon={"🥪"}
        value={"lunch"}
        selected={selectedMealOption === "lunch"}
        onSelect={onMealSelect}
      />
      <MealOptionPill
        label={"Dinner"}
        icon={"🍽️"}
        value={"dinner"}
        selected={selectedMealOption === "dinner"}
        onSelect={onMealSelect}
      />
    </div>
  );
}
