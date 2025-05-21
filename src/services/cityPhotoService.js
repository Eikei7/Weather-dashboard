// services/cityPhotoService.js

/**
 * Fetches a city photo using Google Places API
 * @param {string} cityName - The name of the city to get a photo for
 * @returns {Promise<string|null>} URL of the city photo or null if not found
 */
export async function getCityPhoto(cityName) {
  try {
    // Get API key from environment variables
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
    
    // Log key availability for debugging
    console.log('API key available:', !!API_KEY);
    
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
        textQuery: `${cityName} landmarks`,
        maxResultCount: 10
      })
    });

    // Log detailed error information if request fails
    if (!textSearchResponse.ok) {
      const errorText = await textSearchResponse.text();
      console.error('Places API Error Response:', {
        status: textSearchResponse.status,
        statusText: textSearchResponse.statusText,
        body: errorText
      });
      throw new Error(`Error searching for place: ${textSearchResponse.status} ${textSearchResponse.statusText}`);
    }

    const textSearchData = await textSearchResponse.json();
    
    // Debug response
    console.log('Places API response:', textSearchData);
    
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
    const photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?maxHeightPx=1200&key=${API_KEY}`;
    
    return photoUrl;
  } catch (error) {
    console.error('Error fetching city photo:', error);
    // Graceful fallback to Unsplash if Google Places API fails
    console.log('Falling back to Unsplash');
    return `https://source.unsplash.com/1600x900/?${encodeURIComponent(cityName + ' city')}`;
  }
}