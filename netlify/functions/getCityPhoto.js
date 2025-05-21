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
        languageCode: 'sv' // Swedish language code
      })
    });

    if (!textSearchResponse.ok) {
      throw new Error(`Error searching for place: ${textSearchResponse.statusText}`);
    }

    const textSearchData = await textSearchResponse.json();
    
    // Check if we got results with photos
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
        body: JSON.stringify({ error: 'No photos found for this city' }),
      };
    }

    // Get the first photo's resource name
    const photoReference = placeWithPhotos.photos[0].name;
    
    // Step 2: Generate the photo URL
    // We don't fetch the actual photo bytes, just return the URL to use in the frontend
    const photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=1200&maxHeightPx=800&key=${API_KEY}`;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ photoUrl }),
    };
  } catch (error) {
    console.error('Error fetching city photo:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch city photo' }),
    };
  }
}