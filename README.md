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

- React 18
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
   git clone https://github.com/yourusername/weather-dashboard.git
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
   VITE_WEATHER_API_KEY=your_api_key_here
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

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
weather-dashboard/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── CurrentWeather.jsx
│   │   ├── Forecast.jsx
│   │   ├── LocationSearch.jsx
│   │   ├── SavedLocations.jsx
│   │   ├── WeatherMap.jsx
│   │   └── WeatherCard.jsx
│   ├── services/
│   │   └── weatherAPI.js
│   ├── styles/
│   │   ├── App.css
│   │   ├── CurrentWeather.css
│   │   ├── Forecast.css
│   │   ├── LocationSearch.css
│   │   ├── SavedLocations.css
│   │   ├── WeatherMap.css
│   │   └── index.css
│   ├── utils/
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

## Future Enhancements

- Add unit and integration tests
- Add dark mode support
- Implement weather alerts
- Add hourly forecast
- Add historical weather data
- Add more weather maps and visualizations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for providing the weather data API
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the development framework
- [OpenStreetMap](https://www.openstreetmap.org/) for providing the map embeddings