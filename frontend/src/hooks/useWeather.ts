import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type {
  WeatherApiResponse,
  ForecastApiResponse,
  ForecastChartData,
} from '../types/weather.types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

// Fetch current weather
export const useCurrentWeather = (city: string, enabled = false) => {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: async () => {
      const { data } = await axios.get<WeatherApiResponse>(
        `${API_URL}/api/weather`,
        {
          params: { city },
        }
      )
      return data.weatherData
    },
    enabled: enabled && city.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

// Fetch 5-day forecast
export const useForecast = (city: string, enabled = false) => {
  return useQuery({
    queryKey: ['forecast', city],
    queryFn: async () => {
      const { data } = await axios.get<ForecastApiResponse>(
        `${API_URL}/api/forecast`,
        {
          params: { city },
        }
      )
      return data.forecastData
    },
    enabled: enabled && city.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Helper function to convert Celsius to Fahrenheit
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9) / 5 + 32
}

// Helper function to format forecast data for charts
export const formatForecastForChart = (
  forecastData: ForecastApiResponse['forecastData']
): ForecastChartData[] => {
  return forecastData.list.map((item) => ({
    time: item.dt_txt,
    temp: celsiusToFahrenheit(item.main.temp),
    feels_like: celsiusToFahrenheit(item.main.feels_like),
    humidity: item.main.humidity,
    pressure: item.main.pressure,
    precipitation: item.pop * 100,
    windSpeed: item.wind.speed * 2.237, // Convert m/s to mph
  }))
}

// Helper to check if it's daytime based on sunrise/sunset
export const isDay = (
  currentTime: number,
  sunrise: number,
  sunset: number
): boolean => {
  return currentTime >= sunrise && currentTime <= sunset
}
