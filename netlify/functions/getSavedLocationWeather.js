export const handler = async function(event, context) {
  const API_KEY = process.env.WEATHER_API_KEY;
  
  // ADD: API key check
  if (!API_KEY) {
    console.error('WEATHER_API_KEY is not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }
  
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing location data in request body' }),
    };
  }
  
  try {
    const { locations } = JSON.parse(event.body);
    
    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid or empty locations array in request body' }),
      };
    }
    
    // ADD: Limit number of locations to prevent abuse
    const MAX_LOCATIONS = 20;
    if (locations.length > MAX_LOCATIONS) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Maximum ${MAX_LOCATIONS} locations allowed` }),
      };
    }
    
    // Fetch weather data for each location in parallel
    const weatherPromises = locations.map(async (location) => {
      try {
        // ADD: Validate location data
        if (!location.lat || !location.lon) {
          return {
            locationKey: `${location.lat}-${location.lon}`,
            error: 'Invalid location data'
          };
        }
        
        // CHANGE: lang=se to lang=sv
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&lang=sv&appid=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Error fetching weather for ${location.name}: ${response.statusText}`);
          return {
            locationKey: `${location.lat}-${location.lon}`,
            error: `Failed to fetch weather data: ${response.statusText}`
          };
        }
        
        const data = await response.json();
        
        return {
          locationKey: `${location.lat}-${location.lon}`,
          data: {
            temp: Math.round(data.main.temp),
            icon: data.weather[0].icon,
            timestamp: new Date().getTime()
          }
        };
      } catch (error) {
        console.error(`Error processing location ${location.name}:`, error);
        return {
          locationKey: `${location.lat}-${location.lon}`,
          error: 'Failed to process location'
        };
      }
    });
    
    const results = await Promise.all(weatherPromises);
    
    // Convert array of results to an object keyed by locationKey
    const weatherData = results.reduce((acc, result) => {
      if (result.data) {
        acc[result.locationKey] = result.data;
      }
      return acc;
    }, {});
    
    return {
      statusCode: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
      body: JSON.stringify({ weatherData }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request' }),
    };
  }
};