/**
 * Helper function to safely convert any data structure to an array of recipes
 */
export function ensureRecipesArray(data: any): any[] {
  // For debugging
  console.log("Recipe data type:", typeof data);
  console.log("Is array?", Array.isArray(data));
  
  if (!data) {
    console.log("No data provided");
    return [];
  }
  
  // If it's already an array, return it
  if (Array.isArray(data)) {
    console.log("Data is an array with length:", data.length);
    return data;
  }
  
  // If it has a recipes property that's an array
  if (data.recipes && Array.isArray(data.recipes)) {
    console.log("Found recipes array with length:", data.recipes.length);
    return data.recipes;
  }
  
  // If it's an object with numeric keys (like {"0": {...}, "1": {...}})
  if (typeof data === 'object') {
    console.log("Data is an object with keys:", Object.keys(data));
    
    // Try to convert object with numeric keys to array
    const possibleArray = Object.keys(data)
      .filter(key => !isNaN(Number(key)))
      .sort((a, b) => Number(a) - Number(b))
      .map(key => data[key]);
      
    if (possibleArray.length > 0) {
      console.log("Converted object to array with length:", possibleArray.length);
      return possibleArray;
    }
    
    // Last resort: just grab all values
    const allValues = Object.values(data);
    console.log("Using all object values as array with length:", allValues.length);
    return allValues;
  }
  
  console.log("Could not convert data to array, returning empty array");
  return [];
}