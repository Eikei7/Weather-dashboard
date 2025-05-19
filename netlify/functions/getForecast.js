export async function handler(event, context) {
    const API_KEY = process.env.WEATHER_API_KEY;
    const { lat, lon } = event.queryStringParameters;
  
    if (!lat || !lon) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing latitude or longitude in query parameters' }),
      };
    }
  
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=se&appid=${API_KEY}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OpenWeatherMap error: ${response.statusText}`);
      }
  
      const data = await response.json();
      const dailyForecasts = {};
  
      data.list.forEach(entry => {
        const date = new Date(entry.dt * 1000);
        const day = date.toLocaleDateString('sv-se', { weekday: 'short' });
        const dateLabel = date.toLocaleDateString('sv-se', { month: 'short', day: 'numeric' });
        const hour = date.getHours();
  
        // Pick forecast closest to 12:00 for each day
        if (
          !dailyForecasts[day] ||
          Math.abs(hour - 12) < Math.abs(dailyForecasts[day].hour - 12)
        ) {
          dailyForecasts[day] = {
            hour,
            forecast: {
              day,
              date: dateLabel,
              temp: Math.round(entry.main.temp),
              description: entry.weather[0].description,
              icon: entry.weather[0].icon,
              humidity: entry.main.humidity,
              windSpeed: entry.wind.speed,
            },
          };
        }
      });
  
      const forecastArray = Object.values(dailyForecasts)
        .map(item => item.forecast)
        .slice(0, 5); // Only return 5 days
  
      return {
        statusCode: 200,
        body: JSON.stringify({ list: forecastArray }),
      };
    } catch (error) {
      console.error('Forecast fetch error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch forecast data' }),
      };
    }
  }
  