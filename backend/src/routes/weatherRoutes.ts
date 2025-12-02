import { Router, Request, Response } from 'express'
import { query, validationResult } from 'express-validator'
import { weatherService } from '../services/weatherService.js'

const router = Router()

/**
 * GET /api/weather
 * Fetch current weather data for a city
 */
router.get(
  '/weather',
  [
    query('city')
      .trim()
      .notEmpty()
      .withMessage('City name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('City name must be between 2 and 100 characters'),
  ],
  async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
        details: errors.array(),
      })
    }

    const { city } = req.query

    try {
      const weatherData = await weatherService.getCurrentWeather(city as string)

      res.status(200).json({
        message: `Successfully gathered weather data for ${city}`,
        weatherData,
      })
    } catch (error: any) {
      console.error('Error fetching weather:', error.message)

      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to fetch weather data',
      })
    }
  }
)

/**
 * GET /api/forecast
 * Fetch 5-day weather forecast for a city
 */
router.get(
  '/forecast',
  [
    query('city')
      .trim()
      .notEmpty()
      .withMessage('City name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('City name must be between 2 and 100 characters'),
  ],
  async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
        details: errors.array(),
      })
    }

    const { city } = req.query

    try {
      const forecastData = await weatherService.getForecast(city as string)

      res.status(200).json({
        message: `Successfully gathered forecast data for ${city}`,
        forecastData,
      })
    } catch (error: any) {
      console.error('Error fetching forecast:', error.message)

      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to fetch forecast data',
      })
    }
  }
)

export default router
