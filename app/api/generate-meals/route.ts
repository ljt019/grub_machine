import { NextResponse } from 'next/server';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

// Create a rate limiter
// This example allows 10 requests per IP address per minute
const rateLimiter = new RateLimiterMemory({
  points: 15, // Number of Requests
  duration: 60 * 5, // Seconds
});

export async function POST(request: Request) {
  try {
    // Get the client's IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    // Try to consume a point
    try {
      await rateLimiter.consume(ip);
    } catch (rateLimiterError) {
      // If the rate limit is exceeded, return a 429 status code (Too Many Requests)
      const retryAfter = Math.floor((rateLimiterError as RateLimiterRes).msBeforeNext / 1000) || 1;
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': `${retryAfter}`, // Tells the client when they can try again
          }
        }
      );
    }

    // Continue with the existing code
    const { promptData } = await request.json();
   
    // Create the system prompt
    const systemPrompt = `You are a creative and helpful meal assistant.
You receive user requests in this format:
{
  "mealType": "breakfast/lunch/dinner",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "dislikes": ["disliked1", "disliked2", ...],
  "cookingMethods": ["oven", "stovetop", ...],
  "extraInstructions": "User's additional context",
  "notInTheMoodFor": "Foods user doesn't want today"
}
Your job is to recommend recipes the user can make with ONLY the ingredients listed. Follow these guidelines:
- Never suggest ingredients not in the "ingredients" list
- Avoid all items in "dislikes" and "notInTheMoodFor"
- Respect cooking methods specified
- Tailor your suggestions to the meal type
- Consider any special requests in "extraInstructions"
Respond with exactly 3 recipe options in this JSON format:
[
  {
    "mealTitle": "Name of the meal",
    "cookingMethod": "Primary cooking method used",
    "difficulty": "easy/medium/hard",
    "ingredients": [
      {"name": "ingredient1", "amount": "quantity needed"},
      {"name": "ingredient2", "amount": "quantity needed"}
    ],
    "prepTime": "X minutes",
    "cookTime": "X minutes",
    "totalTime": "X minutes",
    "servings": "#",
    "instructions": [
      "Step 1 instruction",
      "Step 2 instruction"
    ],
    "extraServingSuggestions": ["Suggestion 1", "Suggestion 2"]
  },
  ...
]`;
    // Make the API request to Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': `${process.env.ANTHROPIC_KEY}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 8096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: JSON.stringify(promptData)
          }
        ]
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return NextResponse.json(
        { error: 'Error' },
        { status: response.status }
      );
    }
    const data = await response.json();
   
    // Extract the text content from the response
    let fullResponse = "";
    if (data.content && Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === 'text') {
          fullResponse += block.text;
        }
      }
    }
   
    // Clean up the response - remove any markdown code block indicators
    const jsonStr = fullResponse.replace(/```json|```/g, '').trim();
   
    // Parse and format the JSON
    try {
      const responseJson = JSON.parse(jsonStr);
      return NextResponse.json(responseJson);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return NextResponse.json(
        { error: 'Error parsing JSON response', rawResponse: jsonStr },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}