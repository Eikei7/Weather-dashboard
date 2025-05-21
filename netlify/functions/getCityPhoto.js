// netlify/functions/getCityPhoto.js
export async function handler(event, context) {
  const API_KEY = process.env.GOOGLE_API_KEY;
  const { cityName } = event.queryStringParameters;

  if (!cityName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing cityName parameter' }),
    };
  }

  // Debug: Log information to help troubleshoot
  console.log(`Processing request for city: ${cityName}`);
  console.log(`API Key available: ${API_KEY ? 'Yes (not showing value)' : 'No - Missing API key!'}`);

  // Verify API key is available
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key configuration missing' }),
    };
  }

  try {
    // Step 1: Find a place using Text Search API
    // New correct endpoint for Places API Text Search
    const textSearchUrl = `https://places.googleapis.com/v1/places:searchText`;
    
    // Following Google's documentation for text search
    const searchBody = JSON.stringify({
      textQuery: `${cityName} landmark`, // Search for landmarks in the city
      languageCode: "en"
    });
    
    console.log(`Making request to Text Search API for: ${cityName}`);
    
    const textSearchResponse = await fetch(textSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos'
      },
      body: searchBody
    });

    // Handle error responses
    if (!textSearchResponse.ok) {
      const errorText = await textSearchResponse.text();
      console.error(`Search API error: Status ${textSearchResponse.status}, Body: ${errorText}`);
      
      return {
        statusCode: textSearchResponse.status,
        body: JSON.stringify({ 
          error: `Google Places API error: ${textSearchResponse.statusText}`,
          details: errorText
        }),
      };
    }

    const textSearchData = await textSearchResponse.json();
    console.log("Search results:", JSON.stringify(textSearchData, null, 2));
    
    // Check if we got results
    if (!textSearchData.places || textSearchData.places.length === 0) {
      console.log('No places found for city:', cityName);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No places found for this city' }),
      };
    }

    // Find the first place with photos
    const placeWithPhotos = textSearchData.places.find(place => 
      place.photos && place.photos.length > 0
    );

    if (!placeWithPhotos || !placeWithPhotos.photos || placeWithPhotos.photos.length === 0) {
      console.log('No photos found for city:', cityName);
      
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          error: 'No photos found for this city',
          placeInfo: placeWithPhotos?.displayName?.text || null
        }),
      };
    }

    // Get the photo name (which is now the complete identifier for the photo)
    const photoName = placeWithPhotos.photos[0].name;
    console.log("Photo name:", photoName);
    
    // Step 2: Generate the photo URL according to the updated API format
    // Per documentation: https://places.googleapis.com/v1/NAME/media?key=API_KEY&maxHeightPx=X&maxWidthPx=Y
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=1200&key=${API_KEY}`;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        photoUrl,
        placeName: placeWithPhotos.displayName?.text || cityName
      }),
    };
  } catch (error) {
    console.error('Error fetching city photo:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch city photo',
        message: error.message
      }),
    };
  }
}