import { NextRequest, NextResponse } from "next/server";
import { PixabayApiClient, ERROR_MESSAGES } from "@/services/pixabay";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: ERROR_MESSAGES.EMPTY_QUERY }, { status: 400 });
  }

  try {
    if (!process.env.PIXABAY_API_KEY) {
      console.error("Missing PIXABAY_API_KEY environment variable");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const pixabayClient = new PixabayApiClient(process.env.PIXABAY_API_KEY);
    const imageResult = await pixabayClient.searchImages({ query });

    return NextResponse.json(imageResult);
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch image",
      },
      {
        status: 500,
      }
    );
  }
}
