"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMealContext } from "@/contexts/meal-context";

export default function MealForm() {
  const router = useRouter();
  const {
    mealType,
    ingredients,
    dislikes,
    notInTheMoodFor,
    setNotInTheMoodFor,
    extraInstructions,
    setExtraInstructions,
    cookingMethods: selectedCookingMethods,
    setCookingMethods: setSelectedCookingMethods,
    setRecommendations,
  } = useMealContext();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mealType) {
      alert("Please select a meal type first!");
      router.push("/");
      return;
    }

    setIsLoading(true);

    const completeMealPrompt = {
      mealType,
      ingredients,
      dislikes,
      cookingMethods: selectedCookingMethods,
      extraInstructions,
      notInTheMoodFor,
    };

    console.log("Request payload:", completeMealPrompt);

    try {
      // Make the API request to your backend proxy
      const response = await fetch("/api/generate-meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptData: completeMealPrompt,
        }),
      });

      // Handle different error cases
      if (!response.ok) {
        // Get the detailed error response if available
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If we can't parse JSON, just use the status text
          errorData = { error: response.statusText };
        }

        // Check if it's the overloaded API error (529 status)
        if (
          response.status === 529 ||
          (errorData?.error && errorData.error.includes("overloaded"))
        ) {
          throw new Error("API_OVERLOADED");
        } else {
          throw new Error(`API request failed: ${errorData?.error || response.statusText}`);
        }
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Store the recommendations in context
      setRecommendations(data);

      // Check if we have valid recommendations before navigating
      const hasRecommendations =
        (Array.isArray(data) && data.length > 0) ||
        (typeof data === "object" && Object.keys(data).length > 0);

      if (hasRecommendations) {
        // Navigate to recommendations page
        router.push("/recipe-recommendations");
      } else {
        alert(
          "No recipes found for your criteria. Please try different ingredients or preferences."
        );
      }
    } catch (error) {
      console.error("Error calling Anthropic API:", error);

      // Specific error message for API overload
      if (error.message === "API_OVERLOADED") {
        alert(
          "The Claude AI service is currently experiencing high traffic. Please wait a moment and try again later."
        );
      } else {
        alert("There was an error generating meal recommendations. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCookingMethod = (method: string) => {
    setSelectedCookingMethods(
      selectedCookingMethods.includes(method)
        ? selectedCookingMethods.filter((m) => m !== method)
        : [...selectedCookingMethods, method]
    );
  };

  return (
    <div className="h-screen w-screen p-4">
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full p-0 w-8 h-8"
              onClick={() => router.push("/")}
            >
              <ArrowLeft />
            </Button>
            <CardTitle>What else?</CardTitle>
            <div className="w-8"></div> {/* For symmetry */}
          </div>
        </CardHeader>
        <CardContent className="h-full">
          <div className="flex flex-col space-y-3">
            <NotInMoodForPrompt value={notInTheMoodFor} onChange={setNotInTheMoodFor} />
            <ExtraInstructionPrompt value={extraInstructions} onChange={setExtraInstructions} />
            <CookingMethods
              selectedMethods={selectedCookingMethods}
              onChange={toggleCookingMethod}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? "Generating..." : "Generate Meal Options"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

function NotInMoodForPrompt({ value, onChange }: TextInputProps) {
  return (
    <>
      <Label>What are you not in the mood for?</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Not feeling italian tonight"}
      />
    </>
  );
}

function ExtraInstructionPrompt({ value, onChange }: TextInputProps) {
  return (
    <>
      <Label>Any Extra Instructions?</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"I had a long day at work, something quick and simple"}
      />
    </>
  );
}

interface CookingMethodsProps {
  selectedMethods: string[];
  onChange: (method: string) => void;
}

function CookingMethods({ selectedMethods, onChange }: CookingMethodsProps) {
  const methods = ["Crockpot", "Microwave", "Oven", "Stove", "Airfryer"];
  return (
    <div className="space-y-3">
      <Label>Available Cooking Methods</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {methods.map((method) => (
          <CookingMethodOption
            key={method}
            label={method}
            checked={selectedMethods.includes(method)}
            onChange={() => onChange(method)}
          />
        ))}
      </div>
    </div>
  );
}

interface CookingMethodOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function CookingMethodOption({ label, checked, onChange }: CookingMethodOptionProps) {
  return (
    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted transition-colors">
      <Checkbox
        id={`cooking-method-${label.toLowerCase()}`}
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label htmlFor={`cooking-method-${label.toLowerCase()}`} className="cursor-pointer flex-1">
        {label}
      </Label>
    </div>
  );
}
