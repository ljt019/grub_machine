// app/api/search-image/route.js

import { NextResponse } from 'next/server';

export async function GET(request: { url: string | URL; }) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // For recipes, we keep the original query and add food
  const searchQuery = `${query} food`;
  
  try {
    // Pixabay API according to documentation
    const response = await fetch(
      `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(searchQuery)}&image_type=photo&per_page=3&category=food&safesearch=true`
    );
    
    const data = await response.json(); //test
    
    if (data.hits && data.hits.length > 0) {
      // Get the first result
      const image = data.hits[0];
      return NextResponse.json({ 
        imageUrl: image.webformatURL,
        largeImageUrl: image.largeImageURL, // Also provide the larger version
        attribution: {
          name: image.user,
          link: `https://pixabay.com/users/${image.user}-${image.user_id}/`
        }
      });
    } else {
      // No results from specific query, try a more generic food search
      // Extract main food item (usually the last substantive word)
      const mainFood = query.split(' ').filter(word => word.length > 3).pop() || query.split(' ').pop();
      
      const fallbackResponse = await fetch(
        `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY!}&q=${encodeURIComponent(mainFood as string)}&image_type=photo&per_page=3&safesearch=true`
      );
      
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData.hits && fallbackData.hits.length > 0) {
        const image = fallbackData.hits[0];
        return NextResponse.json({ 
          imageUrl: image.webformatURL,
          largeImageUrl: image.largeImageURL,
          attribution: {
            name: image.user,
            link: `https://pixabay.com/users/${image.user}-${image.user_id}/`
          }
        });
      }
      
      // Fallback to a placeholder if no image found
      return NextResponse.json({ 
        imageUrl: `/api/placeholder/600/400?text=${encodeURIComponent(query)}`,
        attribution: null
      });
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}