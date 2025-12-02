# 🌤️ Umbrella - Interactive 3D Weather Dashboard

A modern, fully interactive weather dashboard featuring stunning 3D visualizations, advanced D3.js charts, and real-time weather data. Built with TypeScript, React 18, and industry-standard best practices.

![Tech Stack](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge&logo=d3.js&logoColor=white)

## ✨ Features

### 🎨 Interactive Visualizations
- **3D Weather Scene** - Immersive 3D environment with:
  - Animated clouds based on real-time cloudiness data
  - Rain and snow particle systems
  - Dynamic day/night sky transitions
  - Interactive orbit controls (drag to rotate, scroll to zoom)
  - Temperature-responsive sun coloring

- **D3.js Charts** - Professional data visualizations:
  - **Temperature Timeline** - Interactive chart with zoom/pan capabilities
  - **Wind Compass** - Animated 360° wind direction indicator with Beaufort scale
  - **Multi-Metric Forecast** - Toggle between temperature, precipitation, humidity, and pressure
  - Smooth animations and transitions
  - Interactive tooltips with detailed information

### 🌓 Modern UI/UX
- **Dark Mode** - Seamless light/dark theme toggle with localStorage persistence
- **Framer Motion Animations** - Smooth, spring-based animations throughout
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Tabbed Interface** - Organized content with three main views:
  1. Current Conditions - Real-time weather metrics
  2. Forecast Charts - 5-day weather predictions
  3. Wind Analysis - Detailed wind data visualization

### 📊 Data Management
- **TanStack Query** - Advanced data fetching with:
  - Automatic caching (5-minute stale time)
  - Smart retry logic
  - Loading and error states
  - Real-time refresh capability
- **5-Day Forecast** - Extended weather predictions
- **Real-time Updates** - Manual refresh button for latest data

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - Latest stable React with modern hooks
- **TypeScript 5.6** - Full type safety across the application
- **Vite 5.4** - Lightning-fast build tool and dev server
- **Material-UI v6** - Modern component library
- **D3.js v7** - Data visualization library
- **Three.js** + **React Three Fiber** - 3D graphics
- **Framer Motion** - Animation library
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client

### Backend
- **Node.js** + **Express 4.21** - RESTful API server
- **TypeScript** - Type-safe backend
- **Helmet** - Security headers
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenWeatherMap API key ([Get one free](https://openweathermap.org/api))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/WBHankins93/umbrella.git
cd umbrella
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Add your OpenWeatherMap API key to .env
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env.development
```

4. **Start Development Servers**

In one terminal (backend):
```bash
cd backend
npm run dev
```

In another terminal (frontend):
```bash
cd frontend
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 📁 Project Structure

```
umbrella/
├── backend/                 # Express TypeScript backend
│   ├── src/
│   │   ├── config/         # Environment configuration
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic (WeatherService)
│   │   ├── types/          # TypeScript type definitions
│   │   └── index.ts        # Server entry point
│   ├── .env.example        # Environment variables template
│   ├── package.json
│   └── tsconfig.json       # TypeScript configuration
│
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── D3TemperatureChart.tsx
│   │   │   ├── D3WindCompass.tsx
│   │   │   ├── D3ForecastChart.tsx
│   │   │   ├── Weather3DScene.tsx
│   │   │   └── EnhancedWeatherDashboard.tsx
│   │   ├── context/        # React Context (Theme)
│   │   ├── hooks/          # Custom hooks (useWeather)
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Application entry point
│   ├── public/             # Static assets
│   ├── index.html          # HTML template
│   ├── vite.config.ts      # Vite configuration
│   └── tsconfig.json       # TypeScript configuration
│
└── README.md               # This file
```

## 🌐 API Endpoints

### Current Weather
```
GET /api/weather?city={cityName}
```
Returns current weather conditions for the specified city.

### 5-Day Forecast
```
GET /api/forecast?city={cityName}
```
Returns 5-day weather forecast with 3-hour intervals.

## 🎯 Key Features Breakdown

### D3.js Visualizations
All charts feature:
- Smooth SVG animations
- Interactive tooltips
- Responsive sizing
- Accessibility support

### 3D Weather Scene
Built with React Three Fiber and includes:
- Physics-based particle systems for rain/snow
- Procedural cloud generation
- Realistic lighting and shadows
- Performance-optimized rendering

### Dark Mode
- Seamless theme switching
- Persisted user preference
- All components fully themed
- Smooth color transitions

## 🔧 Development

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Linting & Formatting
```bash
npm run lint     # Run ESLint
npm run format   # Run Prettier
```

## 📝 Environment Variables

### Backend (.env)
```env
WEATHER_API_KEY=your_openweathermap_api_key
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.development)
```env
VITE_API_URL=http://localhost:5001
```

## 🎨 Design Decisions

### Why TypeScript?
- Type safety prevents runtime errors
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring

### Why Vite over Create React App?
- 10-100x faster build times
- Instant HMR (Hot Module Replacement)
- Native ESM support
- Modern tooling (CRA is deprecated)

### Why TanStack Query?
- Automatic caching and deduplication
- Background refetching
- Optimistic updates
- Better than manual useState/useEffect

### Why D3.js AND Three.js?
- D3.js for 2D data visualization (charts, graphs)
- Three.js for 3D immersive experiences
- Best tools for their respective domains

## 🐛 Known Issues & Future Enhancements

### Potential Future Features
- [ ] Historical weather data visualization
- [ ] Weather alerts and notifications
- [ ] Multiple location comparison
- [ ] Weather maps with overlays
- [ ] User location detection
- [ ] Favorite cities
- [ ] Unit system toggle (imperial/metric)
- [ ] PWA support for offline access

## 📄 License

ISC

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

**WBHankins93**
- GitHub: [@WBHankins93](https://github.com/WBHankins93)

## 🙏 Acknowledgments

- OpenWeatherMap API for weather data
- Material-UI for component library
- React Three Fiber community
- D3.js community

---

**Built with ❤️ using modern web technologies**
