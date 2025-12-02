import axios, { AxiosError } from 'axios'
import { config } from '../config/env.js'
import type { CurrentWeatherData, ForecastData } from '../types/weather.types.js'

interface WeatherApiError {
  message: string
  statusCode: number
}

export class WeatherService {
  private baseUrl = config.openWeatherMapBaseUrl
  private apiKey = config.weatherApiKey

  /**
   * Fetch current weather data for a city
   */
  async getCurrentWeather(city: string): Promise<CurrentWeatherData> {
    try {
      const response = await axios.get<CurrentWeatherData>(
        `${this.baseUrl}/weather`,
        {
          params: {
            q: city,
            appid: this.apiKey,
            units: 'metric', // Using metric, frontend will convert to imperial
          },
        }
      )
      return response.data
    } catch (error) {
      throw this.handleWeatherApiError(error)
    }
  }

  /**
   * Fetch 5-day weather forecast for a city
   */
  async getForecast(city: string): Promise<ForecastData> {
    try {
      const response = await axios.get<ForecastData>(
        `${this.baseUrl}/forecast`,
        {
          params: {
            q: city,
            appid: this.apiKey,
            units: 'metric',
          },
        }
      )
      return response.data
    } catch (error) {
      throw this.handleWeatherApiError(error)
    }
  }

  /**
   * Handle errors from OpenWeatherMap API
   */
  private handleWeatherApiError(error: unknown): WeatherApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>

      if (axiosError.response) {
        const status = axiosError.response.status

        switch (status) {
          case 404:
            return {
              message: 'City not found. Please check the city name and try again.',
              statusCode: 404,
            }
          case 401:
            return {
              message: 'Invalid API key configuration.',
              statusCode: 500,
            }
          case 429:
            return {
              message: 'API rate limit exceeded. Please try again later.',
              statusCode: 429,
            }
          default:
            return {
              message: axiosError.response.data?.message || 'Failed to fetch weather data',
              statusCode: status,
            }
        }
      }

      if (axiosError.request) {
        return {
          message: 'Unable to reach weather service. Please check your internet connection.',
          statusCode: 503,
        }
      }
    }

    return {
      message: 'An unexpected error occurred while fetching weather data.',
      statusCode: 500,
    }
  }
}

export const weatherService = new WeatherService()
