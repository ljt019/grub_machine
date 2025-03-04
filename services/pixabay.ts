export enum PIXABAY_CONSTANTS {
  BASE_URL = "https://pixabay.com/api/",
  DEFAULT_PER_PAGE = 3,
  DEFAULT_IMAGE_TYPE = "photo",
}

export enum ERROR_MESSAGES {
  API_COMMUNICATION = "Error communicating with the Pixabay API",
  NO_RESULTS = "No results found for the query",
  EMPTY_QUERY = "Query parameter is required",
}

export interface PixabaySearchOptions {
  query: string;
  imageType?: string;
  perPage?: number;
  category?: string;
  safeSearch?: boolean;
}

export interface PixabayImageResult {
  imageUrl: string;
  largeImageUrl: string;
  attribution: {
    name: string;
    link: string;
  } | null;
}

export class PixabayApiClient {
  api_key: string;
  base_url: string;

  constructor(api_key: string) {
    this.api_key = api_key;
    this.base_url = PIXABAY_CONSTANTS.BASE_URL;
  }

  /**
   * Search for images using the Pixabay API
   */
  async searchImages(options: PixabaySearchOptions): Promise<PixabayImageResult> {
    const {
      query,
      imageType = PIXABAY_CONSTANTS.DEFAULT_IMAGE_TYPE,
      perPage = PIXABAY_CONSTANTS.DEFAULT_PER_PAGE,
      category = "food",
      safeSearch = true,
    } = options;

    if (!query) {
      throw new Error(ERROR_MESSAGES.EMPTY_QUERY);
    }

    try {
      // First attempt with the full query
      const response = await fetch(
        `${this.base_url}?key=${this.api_key}&q=${encodeURIComponent(
          query
        )}&image_type=${imageType}&per_page=${perPage}${
          category ? `&category=${category}` : ""
        }&safesearch=${safeSearch}`
      );

      const data = await response.json();

      // If we found results, return the first one
      if (data.hits && data.hits.length > 0) {
        const image = data.hits[0];
        return {
          imageUrl: image.webformatURL,
          largeImageUrl: image.largeImageURL,
          attribution: {
            name: image.user,
            link: `https://pixabay.com/users/${image.user}-${image.user_id}/`,
          },
        };
      }

      // Try fallback search with main food item
      const mainFood =
        query
          .split(" ")
          .filter((word) => word.length > 3)
          .pop() || query.split(" ").pop();

      const fallbackResponse = await fetch(
        `${this.base_url}?key=${this.api_key}&q=${encodeURIComponent(
          mainFood as string
        )}&image_type=${imageType}&per_page=${perPage}&safesearch=${safeSearch}`
      );

      const fallbackData = await fallbackResponse.json();

      if (fallbackData.hits && fallbackData.hits.length > 0) {
        const image = fallbackData.hits[0];
        return {
          imageUrl: image.webformatURL,
          largeImageUrl: image.largeImageURL,
          attribution: {
            name: image.user,
            link: `https://pixabay.com/users/${image.user}-${image.user_id}/`,
          },
        };
      }

      // Fallback to a placeholder if no image found
      return {
        imageUrl: `/api/placeholder/600/400?text=${encodeURIComponent(query)}`,
        largeImageUrl: `/api/placeholder/1200/800?text=${encodeURIComponent(query)}`,
        attribution: null,
      };
    } catch (error) {
      console.error("Error searching Pixabay:", error);
      throw new Error(ERROR_MESSAGES.API_COMMUNICATION);
    }
  }
}
