export async function handler(event, context) {
    const API_KEY = process.env.WEATHER_API_KEY;
  
    const { lat, lon } = event.queryStringParameters;
  
    if (!lat || !lon) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing latitude or longitude in query parameters' }),
      };
    }
  
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=se&appid=${API_KEY}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OpenWeatherMap error: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      return {
        statusCode: 200,
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
  