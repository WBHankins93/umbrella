import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: process.env.PORT || 5001,
  weatherApiKey: process.env.WEATHER_API_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
  openWeatherMapBaseUrl: 'https://api.openweathermap.org/data/2.5',
} as const

// Validate required environment variables
if (!config.weatherApiKey) {
  throw new Error('WEATHER_API_KEY is not defined in environment variables')
}
