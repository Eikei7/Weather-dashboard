// Create a new Netlify function: functions/getSavedLocationWeather.js

exports.handler = async function(event, context) {
  const API_KEY = process.env.WEATHER_API_KEY;
  
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
    
    // Fetch weather data for each location in parallel
    const weatherPromises = locations.map(async (location) => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&lang=se&appid=${API_KEY}`;
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