import { RECIPE_GENERATOR_SYSTEM_PROMPT } from "@/prompts";
import { Recipe } from "@/types";

enum CLAUDE_MODEL_OPTIONS {
  CLAUDE_3_HAIKU = "claude-3-haiku-20240307",
  CLAUDE_3_OPUS = "claude-3-opus-20240229",
  CLAUDE_3_5_HAIKU = "claude-3-5-haiku-20241022",
  CLAUDE_3_5_SONNET = "claude-3-5-sonnet-20240620",
  CLAUDE_3_6_SONNET = "claude-3-5-sonnet-20241022",
  CLAUDE_3_7_SONNET = "claude-3-7-sonnet-20250219",
}

enum ERROR_TYPES {
  OVERLOADED = "overloaded_error",
  PARSE_ERROR = "Failed to parse recipe data from Claude's response",
  UNEXPECTED_FORMAT = "Unexpected response format from Claude API",
}

enum API_CONSTANTS {
  CLAUDE_MODEL = CLAUDE_MODEL_OPTIONS.CLAUDE_3_HAIKU,
  MAX_TOKENS = 8096,
  URL = "https://api.anthropic.com/v1/messages",
  ANTHROPIC_VERSION = "2023-06-01",
}

export interface RecipeRequest {
  mealType: string;
  ingredients: string[];
  dislikes: string[];
  cookingMethods: string[];
  extraInstructions: string;
  notInTheMoodFor: string;
}

export type RecipePromptResponse = Array<Recipe>;

export class ClaudeClient {
  system_prompt: string;
  model: string;
  max_tokens: number;
  api_key: string;

  constructor(api_key: string) {
    this.system_prompt = RECIPE_GENERATOR_SYSTEM_PROMPT;
    this.model = API_CONSTANTS.CLAUDE_MODEL;
    this.max_tokens = API_CONSTANTS.MAX_TOKENS;
    this.api_key = api_key;
  }

  /**
   * Prompt Claude for recipes
   */
  async prompt_claude_for_recipes(recipeRequest: RecipeRequest): Promise<RecipePromptResponse> {
    const url = API_CONSTANTS.URL;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": this.api_key,
      "anthropic-version": API_CONSTANTS.ANTHROPIC_VERSION as string,
    };

    const body = {
      model: this.model,
      max_tokens: this.max_tokens,
      system: this.system_prompt,
      messages: [
        {
          role: "user",
          content: JSON.stringify(recipeRequest),
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 529) {
          const overloadedError = new Error("The Claude API is currently overloaded");
          overloadedError.name = "OverloadedError";
          throw overloadedError;
        }

        const errorData = await response.json().catch(() => ({}));
        console.error("Error calling Claude API:", errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const responseData = await response.json();

      const assistantMessage = responseData.content[0];
      if (assistantMessage && assistantMessage.type === "text") {
        try {
          const recipes = JSON.parse(assistantMessage.text) as RecipePromptResponse;
          return recipes;
        } catch (parseError: unknown) {
          console.error("Error parsing Claude's response as JSON:", parseError);
          throw new Error(ERROR_TYPES.PARSE_ERROR);
        }
      } else {
        throw new Error(ERROR_TYPES.UNEXPECTED_FORMAT);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "OverloadedError") {
        throw error;
      }

      if (error instanceof Error && error.message.includes(ERROR_TYPES.OVERLOADED)) {
        const overloadedError = new Error("The Claude API is currently overloaded");
        overloadedError.name = "OverloadedError";
        throw overloadedError;
      }

      throw error;
    }
  }
}
