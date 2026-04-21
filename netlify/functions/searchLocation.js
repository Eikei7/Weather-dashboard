export async function handler(event, context) {
  const API_KEY = process.env.WEATHER_API_KEY;
  
  // ADD: API key check
  if (!API_KEY) {
    console.error('WEATHER_API_KEY is not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }
  
  const { query } = event.queryStringParameters;

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing query parameter' }),
    };
  }

  // ADD: Validate query length
  if (query.trim().length < 2) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Query must be at least 2 characters' }),
    };
  }

  // CHANGE: lang=se to lang=sv
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&lang=sv&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenWeatherMap API error:', response.status, errorData);
      
      if (response.status === 401) {
        return { statusCode: 500, body: JSON.stringify({ error: 'API authentication failed' }) };
      } else if (response.status === 429) {
        return { statusCode: 429, body: JSON.stringify({ error: 'Rate limit exceeded' }) };
      }
      
      throw new Error(`OpenWeatherMap error: ${response.statusText}`);
    }

    const data = await response.json();

    const formattedData = data.map(item => ({
      name: item.name,
      country: item.country,
      state: item.state,
      lat: item.lat,
      lon: item.lon,
    }));

    return {
      statusCode: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour (location data rarely changes)
      },
      body: JSON.stringify(formattedData),
    };
  } catch (error) {
    console.error('Search location error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to search for location' }),
    };
  }
}