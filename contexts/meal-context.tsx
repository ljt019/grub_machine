"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface MealContextType {
  // Form data
  mealType: string;
  ingredients: string[];
  dislikes: string[];
  cookingMethods: string[];
  extraInstructions: string;
  notInTheMoodFor: string;
  // Recipe recommendations from API
  recommendations: RecipeRecommendation[] | null;
  // Action methods
  setMealType: (type: string) => void;
  setIngredients: (ingredients: string[]) => void;
  setDislikes: (dislikes: string[]) => void;
  setCookingMethods: (methods: string[]) => void;
  setExtraInstructions: (instructions: string) => void;
  setNotInTheMoodFor: (notInMoodFor: string) => void;
  setRecommendations: (recs: RecipeRecommendation[] | null) => void;
}

export interface RecipeRecommendation {
  title: string;
  cookingMethod: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  ingredients: Record<string, string>;
  instructions: Array<string>;
  servingSuggestions: string;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

const STORAGE_KEY = "grubMachineData";

// Helper function to safely parse stored data
const getSavedData = () => {
  if (typeof window === "undefined") {
    return null; // Return null during server-side rendering
  }

  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error("Error parsing saved meal data:", error);
    return null;
  }
};

export function MealProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with saved values or defaults
  const [mealType, setMealTypeState] = useState<string>("");
  const [ingredients, setIngredientsState] = useState<string[]>([]);
  const [dislikes, setDislikesState] = useState<string[]>([]);
  const [cookingMethods, setCookingMethodsState] = useState<string[]>([]);
  const [extraInstructions, setExtraInstructionsState] = useState<string>("");
  const [notInTheMoodFor, setNotInTheMoodForState] = useState<string>("");
  const [recommendations, setRecommendationsState] = useState<RecipeRecommendation[] | null>(null);

  // Load saved data when component mounts
  useEffect(() => {
    const savedData = getSavedData();
    if (savedData) {
      setMealTypeState(savedData.mealType || "");
      setIngredientsState(savedData.ingredients || []);
      setDislikesState(savedData.dislikes || []);
      setCookingMethodsState(savedData.cookingMethods || []);
      setExtraInstructionsState(savedData.extraInstructions || "");
      setNotInTheMoodForState(savedData.notInTheMoodFor || "");
      // We don't restore recommendations as they should be fetched fresh
    }
  }, []);

  // Wrapper functions that update both state and localStorage
  const setMealType = (type: string) => {
    setMealTypeState(type);
    saveToStorage({ mealType: type });
  };

  const setIngredients = (newIngredients: string[]) => {
    setIngredientsState(newIngredients);
    saveToStorage({ ingredients: newIngredients });
  };

  const setDislikes = (newDislikes: string[]) => {
    setDislikesState(newDislikes);
    saveToStorage({ dislikes: newDislikes });
  };

  const setCookingMethods = (methods: string[]) => {
    setCookingMethodsState(methods);
    saveToStorage({ cookingMethods: methods });
  };

  const setExtraInstructions = (instructions: string) => {
    setExtraInstructionsState(instructions);
    saveToStorage({ extraInstructions: instructions });
  };

  const setNotInTheMoodFor = (notInMoodFor: string) => {
    setNotInTheMoodForState(notInMoodFor);
    saveToStorage({ notInTheMoodFor: notInMoodFor });
  };

  const setRecommendations = (recs: RecipeRecommendation[] | null) => {
    setRecommendationsState(recs);
    // We don't save recommendations to storage
  };

  // Helper function to save to localStorage
  const saveToStorage = (
    updates: Partial<Omit<MealContextType, "recommendations" | keyof Function>>
  ) => {
    if (typeof window === "undefined") return; // Skip during SSR

    try {
      const currentData = getSavedData() || {
        mealType,
        ingredients,
        dislikes,
        cookingMethods,
        extraInstructions,
        notInTheMoodFor,
      };

      const updatedData = { ...currentData, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error("Error saving meal data:", error);
    }
  };

  return (
    <MealContext.Provider
      value={{
        mealType,
        ingredients,
        dislikes,
        cookingMethods,
        extraInstructions,
        notInTheMoodFor,
        recommendations,
        setMealType,
        setIngredients,
        setDislikes,
        setCookingMethods,
        setExtraInstructions,
        setNotInTheMoodFor,
        setRecommendations,
      }}
    >
      {children}
    </MealContext.Provider>
  );
}

export function useMealContext() {
  const context = useContext(MealContext);
  if (context === undefined) {
    throw new Error("useMealContext must be used within a MealProvider");
  }
  return context;
}
