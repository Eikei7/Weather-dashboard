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

  const { lat, lon } = event.queryStringParameters;

  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing latitude or longitude in query parameters' }),
    };
  }

  // ADD: Validate coordinates
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

  // CHANGE: lang=se to lang=sv
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=sv&appid=${API_KEY}`;

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
    
    // ADD: Check if data exists
    if (!data.list || data.list.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No forecast data available' }),
      };
    }

    const dailyForecasts = {};

    data.list.forEach(entry => {
      const date = new Date(entry.dt * 1000);
      const day = date.toLocaleDateString('sv-SE', { weekday: 'short' });
      const dateLabel = date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
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
      .slice(0, 5);

    return {
      statusCode: 200,
      headers: {
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
      },
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