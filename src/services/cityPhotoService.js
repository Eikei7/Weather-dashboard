// services/cityPhotoService.js
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

/**
 * Fetches a city photo using Google Places API
 * @param {string} cityName - The name of the city to get a photo for
 * @returns {Promise<string|null>} URL of the city photo or null if not found
 */
export async function getCityPhoto(cityName) {
  try {
    // Step 1: Find the place ID using Text Search
    const textSearchUrl = `https://places.googleapis.com/v1/places:searchText`;
    const textSearchResponse = await fetch(textSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos'
      },
      body: JSON.stringify({
        textQuery: `${cityName} city landmarks`,
        languageCode: 'sv' // Swedish language code (adjust if needed)
      })
    });

    if (!textSearchResponse.ok) {
      throw new Error(`Error searching for place: ${textSearchResponse.statusText}`);
    }

    const textSearchData = await textSearchResponse.json();
    
    // Check if we got results with photos
    if (!textSearchData.places || textSearchData.places.length === 0) {
      console.log('No places found for city:', cityName);
      return null;
    }

    // Find the first place with photos
    const placeWithPhotos = textSearchData.places.find(place => 
      place.photos && place.photos.length > 0
    );

    if (!placeWithPhotos || !placeWithPhotos.photos || placeWithPhotos.photos.length === 0) {
      console.log('No photos found for city:', cityName);
      return null;
    }

    // Get the first photo's resource name
    const photoReference = placeWithPhotos.photos[0].name;
    
    // Step 2: Get the actual photo using the reference
    // Format: places/{placeId}/photos/{photoId}/media
    const photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=1200&maxHeightPx=800&key=${API_KEY}`;
    
    // We don't fetch the image here - we just return the URL
    // The URL will be used directly in the background style of the component
    return photoUrl;
  } catch (error) {
    console.error('Error fetching city photo:', error);
    return null;
  }
}