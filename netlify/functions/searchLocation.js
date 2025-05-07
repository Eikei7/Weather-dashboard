export async function handler(event, context) {
    const API_KEY = process.env.WEATHER_API_KEY;
    const { query } = event.queryStringParameters;
  
    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing query parameter' }),
      };
    }
  
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
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
  