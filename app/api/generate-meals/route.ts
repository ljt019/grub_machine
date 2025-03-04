import { NextResponse } from "next/server";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { ClaudeClient, RecipeRequest } from "@/services/claude";
import { getFakeRecipeData } from "@/utils/get-fake-recipe-data";

enum STATUS_CODES {
  TOO_MANY_REQUESTS = 429,
  SERVER_ERROR = 500,
  OVERLOADED = 529,
}

enum ERROR_MESSAGES {
  RATE_LIMIT = "Too many requests, please try again later.",
  PARSE_ERROR = "Error parsing JSON response",
  API_COMMUNICATION = "Error communicating with the Claude API",
  INTERNAL_SERVER = "Internal server error",
  OVERLOADED = "The Claude API is currently overloaded. Please try again later.",
}

enum ENV_TYPES {
  DEV = "Dev",
  PROD = "Prod",
}

interface ApiError extends Error {
  name: string;
  response?: {
    status: number;
    data: {
      error?: {
        message: string;
      };
    };
  };
}

const rateLimiter = new RateLimiterMemory({
  points: 15,
  duration: 60 * 5, // Seconds
});

export async function POST(request: Request) {
  try {
    // Get the client's IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

    try {
      await rateLimiter.consume(ip);
    } catch (rateLimiterError) {
      const retryAfter = Math.floor((rateLimiterError as RateLimiterRes).msBeforeNext / 1000) || 1;

      return NextResponse.json(
        { error: ERROR_MESSAGES.RATE_LIMIT },
        {
          status: STATUS_CODES.TOO_MANY_REQUESTS,
          headers: {
            "Retry-After": `${retryAfter}`,
          },
        }
      );
    }

    const requestData = await request.json();
    const recipeRequest = requestData.promptData as RecipeRequest;

    const environment = process.env.DEPLOYMENT_ENVIRONMENT || ENV_TYPES.DEV;

    if (environment === ENV_TYPES.DEV) {
      console.log("Development environment detected. Returning mock data.");
      return NextResponse.json(getFakeRecipeData());
    }

    try {
      if (!process.env.ANTHROPIC_KEY) {
        console.error("Missing ANTHROPIC_KEY environment variable");
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: STATUS_CODES.SERVER_ERROR }
        );
      }

      const claudeApiClient = new ClaudeClient(process.env.ANTHROPIC_KEY);
      const response = await claudeApiClient.prompt_claude_for_recipes(
        recipeRequest as RecipeRequest
      );

      try {
        return NextResponse.json(response);
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        return NextResponse.json(
          { error: ERROR_MESSAGES.PARSE_ERROR },
          { status: STATUS_CODES.SERVER_ERROR }
        );
      }
    } catch (apiError: unknown) {
      const isApiError = (err: unknown): err is ApiError => {
        return typeof err === "object" && err !== null && "name" in err;
      };

      if (isApiError(apiError) && apiError.name === "OverloadedError") {
        console.log("Detected overloaded API, returning appropriate status code");
        return NextResponse.json(
          { error: ERROR_MESSAGES.OVERLOADED },
          { status: STATUS_CODES.OVERLOADED }
        );
      }

      console.error("API error:", isApiError(apiError) ? apiError : "Unknown error");
      return NextResponse.json(
        { error: ERROR_MESSAGES.API_COMMUNICATION },
        { status: STATUS_CODES.SERVER_ERROR }
      );
    }
  } catch (error: unknown) {
    console.error("Server error:", error);

    const isApiError = (err: unknown): err is ApiError => {
      return (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as ApiError).response?.data === "object"
      );
    };

    if (isApiError(error) && error.response && error.response.data) {
      const errorData = error.response.data;

      return NextResponse.json(
        { error: errorData.error?.message || ERROR_MESSAGES.API_COMMUNICATION },
        { status: error.response.status || STATUS_CODES.SERVER_ERROR }
      );
    }

    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER },
      { status: STATUS_CODES.SERVER_ERROR }
    );
  }
}
