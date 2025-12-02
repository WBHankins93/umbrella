import { useState } from 'react'
import axios from 'axios'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  WbSunny,
  Opacity,
  Air,
  Cloud,
  ThermostatAutoOutlined,
  Visibility,
  WbTwilight,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import type {
  CurrentWeatherData,
  TemperatureDataPoint,
  WeatherApiResponse,
} from '../types/weather.types'

// Get API URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

// Framer Motion variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
}

function WeatherDashboard() {
  const [city, setCity] = useState<string>('')
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get<WeatherApiResponse>(
        `${API_URL}/api/weather`,
        {
          params: { city },
        }
      )
      setWeather(response.data.weatherData)
    } catch (err) {
      console.error('Error fetching weather:', err)
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            'Failed to fetch weather data. Please try again.'
        )
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      fetchWeather()
    }
  }

  const convertToFahrenheit = (celsius: number): string => {
    return ((celsius * 9) / 5 + 32).toFixed(1)
  }

  const tempData: TemperatureDataPoint[] = weather
    ? [
        {
          name: 'Current',
          temp: parseFloat(convertToFahrenheit(weather.main.temp)),
        },
        {
          name: 'Feels Like',
          temp: parseFloat(convertToFahrenheit(weather.main.feels_like)),
        },
        {
          name: 'Min',
          temp: parseFloat(convertToFahrenheit(weather.main.temp_min)),
        },
        {
          name: 'Max',
          temp: parseFloat(convertToFahrenheit(weather.main.temp_max)),
        },
      ]
    : []

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', padding: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h3"
          align="center"
          sx={{
            color: '#1976d2',
            fontWeight: 'bold',
            mb: 4,
          }}
        >
          Weather Dashboard
        </Typography>
      </motion.div>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
        <TextField
          variant="outlined"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          sx={{ bgcolor: 'white' }}
        />
        <Button
          variant="contained"
          onClick={fetchWeather}
          disabled={loading}
          sx={{ px: 4 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Get Weather'}
        </Button>
      </Stack>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            {error}
          </Alert>
        </motion.div>
      )}

      {!weather && !loading && (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Enter a city and click "Get Weather" to view the weather data.
        </Typography>
      )}

      {weather && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Stack spacing={3}>
            {/* Main Weather Card */}
            <motion.div variants={itemVariants}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h4" align="center" gutterBottom>
                    {weather.name}, {weather.sys?.country}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <ThermostatAutoOutlined color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h3">
                      {convertToFahrenheit(weather.main.temp)}°F
                    </Typography>
                  </Box>
                  {weather.weather && weather.weather[0] && (
                    <Typography
                      variant="h6"
                      align="center"
                      sx={{ mt: 1, textTransform: 'capitalize' }}
                    >
                      {weather.weather[0].description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Temperature Chart and Current Conditions */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <motion.div variants={itemVariants} style={{ flex: 2 }}>
                <Card elevation={3} sx={{ height: '400px', p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Temperature Overview
                  </Typography>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={tempData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis unit="°F" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#1976d2"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} style={{ flex: 1 }}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Current Conditions
                    </Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <Paper
                          elevation={1}
                          sx={{ p: 2, flex: 1, textAlign: 'center' }}
                        >
                          <Opacity color="primary" />
                          <Typography variant="body2">Humidity</Typography>
                          <Typography variant="h6">
                            {weather.main.humidity}%
                          </Typography>
                        </Paper>
                        <Paper
                          elevation={1}
                          sx={{ p: 2, flex: 1, textAlign: 'center' }}
                        >
                          <Air color="primary" />
                          <Typography variant="body2">Wind Speed</Typography>
                          <Typography variant="h6">
                            {weather.wind.speed} mph
                          </Typography>
                        </Paper>
                      </Stack>
                      <Stack direction="row" spacing={2}>
                        <Paper
                          elevation={1}
                          sx={{ p: 2, flex: 1, textAlign: 'center' }}
                        >
                          <Cloud color="primary" />
                          <Typography variant="body2">Cloudiness</Typography>
                          <Typography variant="h6">{weather.clouds.all}%</Typography>
                        </Paper>
                        <Paper
                          elevation={1}
                          sx={{ p: 2, flex: 1, textAlign: 'center' }}
                        >
                          <Visibility color="primary" />
                          <Typography variant="body2">Visibility</Typography>
                          <Typography variant="h6">
                            {(weather.visibility / 1000).toFixed(1)} km
                          </Typography>
                        </Paper>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Stack>

            {/* Sun Times */}
            <motion.div variants={itemVariants}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sun Schedule
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={4}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <WbSunny sx={{ color: '#ffa726', fontSize: 40 }} />
                      <Box>
                        <Typography variant="body2">Sunrise</Typography>
                        <Typography variant="h6">
                          {new Date(weather.sys.sunrise * 1000).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <WbTwilight sx={{ color: '#ff7043', fontSize: 40 }} />
                      <Box>
                        <Typography variant="body2">Sunset</Typography>
                        <Typography variant="h6">
                          {new Date(weather.sys.sunset * 1000).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Stack>
        </motion.div>
      )}
    </Box>
  )
}

export default WeatherDashboard
