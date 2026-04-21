export async function handler(event, context) {
  const API_KEY = process.env.WEATHER_API_KEY;

  // ADD: Verify API key exists
  if (!API_KEY) {
    console.error('WEATHER_API_KEY is not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  const { lat, lon } = event.queryStringParameters;

  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing latitude or longitude in query parameters' }),
    };
  }

  // ADD: Validate latitude and longitude format
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  
  if (isNaN(latitude) || isNaN(longitude) || 
      latitude < -90 || latitude > 90 || 
      longitude < -180 || longitude > 180) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid latitude or longitude values' }),
    };
  }

  // CHANGE: lang=se to lang=sv (Swedish language code)
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=sv&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      // ADD: Better error handling with specific status codes
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenWeatherMap API error:', response.status, errorData);
      
      if (response.status === 401) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'API authentication failed' }),
        };
      } else if (response.status === 404) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Location not found' }),
        };
      } else if (response.status === 429) {
        return {
          statusCode: 429,
          body: JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
        };
      }
      
      throw new Error(`OpenWeatherMap error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      // ADD: Cache headers to reduce API calls
      headers: {
        'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch weather data' }),
    };
  }
}