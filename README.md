# Weather Dashboard

A modern, responsive weather dashboard application built with React and Vite. This app allows users to check current weather conditions and forecasts for multiple locations around the world.

## Features

- Current weather conditions display
- 5-day weather forecast
- Location search functionality
- Save favorite locations
- Weather map visualization
- Responsive design for all devices

## Technologies Used

- React 19
- Vite
- OpenWeatherMap API
- CSS3 with responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Eikei7/weather-dashboard.git
   cd weather-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

3. Create a `.env` file in the root directory and add your OpenWeatherMap API key:
   ```
   WEATHER_API_KEY=your_api_key_here
   ```
   
   You can get a free API key by signing up at [OpenWeatherMap](https://openweathermap.org/api).

4. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:8888`

## Project Structure

```
weather-dashboard/
├── netlify/
│   └── functions/
│       ├── getData.js
│       ├── getForecast.js
│       └── searchLocation.js
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── CurrentWeather.jsx
│   │   ├── DynamicBackground.jsx
│   │   ├── Forecast.jsx
│   │   ├── LastUpdated.jsx
│   │   ├── LocationSearch.jsx
│   │   ├── SavedLocations.jsx
│   │   ├── WeatherAnimation.jsx
│   │   ├── WeatherMap.jsx
│   │   └── WeatherCard.jsx
│   ├── services/
│   │   └── weatherAPI.js
│   ├── styles/
│   │   ├── animations.css
│   │   ├── App.css
│   │   ├── CurrentWeather.css
│   │   ├── DynamicBackground.css
│   │   ├── Forecast.css
│   │   ├── LastUpdated.css
│   │   ├── LocationSearch.css
│   │   ├── SavedLocations.css
│   │   ├── WeatherAnimation.css
│   │   ├── WeatherMap.css
│   │   ├── WeatherCard.css
│   │   └── index.css
│   ├── utils/
│   │   ├── transitions.js
│   │   └── helpers.js
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .gitignore
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Building for Production

To build the app for production, run:

```
npm run build
```
or
```
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

You can deploy this app to any static site hosting service like Netlify, Vercel, GitHub Pages, etc.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for providing the weather data API
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the development framework
- [OpenStreetMap](https://www.openstreetmap.org/) for providing the map embeddings