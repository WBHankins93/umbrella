import { useState } from 'react'
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
  IconButton,
  Tabs,
  Tab,
  Grid,
  Chip,
} from '@mui/material'
import {
  WbSunny,
  Opacity,
  Cloud,
  ThermostatAutoOutlined,
  Visibility,
  WbTwilight,
  DarkMode,
  LightMode,
  Refresh,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import D3TemperatureChart from './D3TemperatureChart'
import D3WindCompass from './D3WindCompass'
import D3ForecastChart from './D3ForecastChart'
import Weather3DScene from './Weather3DScene'
import {
  useCurrentWeather,
  useForecast,
  celsiusToFahrenheit,
  formatForecastForChart,
  isDay as checkIsDay,
} from '../hooks/useWeather'
import { useThemeMode } from '../context/ThemeContext'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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
      damping: 12,
    },
  },
}

function EnhancedWeatherDashboard() {
  const [city, setCity] = useState<string>('')
  const [searchCity, setSearchCity] = useState<string>('')
  const [tabValue, setTabValue] = useState(0)
  const { mode, toggleTheme } = useThemeMode()

  const {
    data: weather,
    isLoading: weatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useCurrentWeather(searchCity, searchCity.length > 0)

  const {
    data: forecast,
    isLoading: forecastLoading,
    error: forecastError,
  } = useForecast(searchCity, searchCity.length > 0)

  const handleSearch = () => {
    if (city.trim()) {
      setSearchCity(city.trim())
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const isLoading = weatherLoading || forecastLoading
  const error = weatherError || forecastError

  const isDaytime = weather
    ? checkIsDay(weather.dt, weather.sys.sunrise, weather.sys.sunset)
    : true

  const forecastChartData = forecast ? formatForecastForChart(forecast) : []

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #1976d2 30%, #ff5722 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🌤️ Weather Dashboard
          </Typography>
          <IconButton
            onClick={toggleTheme}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { transform: 'rotate(180deg)' },
              transition: 'all 0.5s ease',
            }}
          >
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Stack>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter city name (e.g., New York, London, Tokyo)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s ease',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={isLoading || !city.trim()}
                sx={{
                  px: 4,
                  py: 1.5,
                  minWidth: 120,
                }}
                startIcon={
                  isLoading ? <CircularProgress size={20} color="inherit" /> : null
                }
              >
                {isLoading ? 'Loading...' : 'Search'}
              </Button>
              {weather && (
                <IconButton
                  onClick={() => refetchWeather()}
                  disabled={isLoading}
                  color="primary"
                >
                  <Refresh />
                </IconButton>
              )}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert severity="error" sx={{ mb: 3 }}>
              {error instanceof Error ? error.message : 'Failed to fetch weather data'}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!weather && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <WbSunny sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Welcome to the Interactive Weather Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter a city name above to view real-time weather data with stunning 3D
              visualizations
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Weather Content */}
      <AnimatePresence>
        {weather && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            <Stack spacing={3}>
              {/* Main Weather Card with 3D Scene */}
              <motion.div variants={itemVariants}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                      <CardContent>
                        <Typography variant="h4" gutterBottom>
                          {weather.name}, {weather.sys.country}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <ThermostatAutoOutlined
                            color="primary"
                            sx={{ fontSize: 60 }}
                          />
                          <Box>
                            <Typography variant="h2" sx={{ fontWeight: 700 }}>
                              {celsiusToFahrenheit(weather.main.temp).toFixed(1)}°F
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ textTransform: 'capitalize', color: 'text.secondary' }}
                            >
                              {weather.weather[0]?.description}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          <Chip
                            label={`Feels like ${celsiusToFahrenheit(weather.main.feels_like).toFixed(1)}°F`}
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={isDaytime ? '☀️ Day' : '🌙 Night'}
                            color="secondary"
                            variant="outlined"
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Weather3DScene
                      weatherCondition={weather.weather[0]?.main || 'Clear'}
                      cloudiness={weather.clouds.all}
                      isDay={isDaytime}
                      temperature={celsiusToFahrenheit(weather.main.temp)}
                    />
                  </Grid>
                </Grid>
              </motion.div>

              {/* Tabs for different visualizations */}
              <motion.div variants={itemVariants}>
                <Card elevation={3}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                      value={tabValue}
                      onChange={(_, newValue) => setTabValue(newValue)}
                      variant="scrollable"
                      scrollButtons="auto"
                    >
                      <Tab label="📊 Current Conditions" />
                      <Tab label="📈 Forecast Charts" disabled={!forecast} />
                      <Tab label="💨 Wind Analysis" />
                    </Tabs>
                  </Box>

                  {/* Tab 1: Current Conditions */}
                  <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={2}
                          sx={{ p: 3, textAlign: 'center', height: '100%' }}
                        >
                          <Opacity color="primary" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Humidity
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {weather.main.humidity}%
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={2}
                          sx={{ p: 3, textAlign: 'center', height: '100%' }}
                        >
                          <Cloud color="primary" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Cloudiness
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {weather.clouds.all}%
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={2}
                          sx={{ p: 3, textAlign: 'center', height: '100%' }}
                        >
                          <Visibility color="primary" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Visibility
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {(weather.visibility / 1000).toFixed(1)}
                          </Typography>
                          <Typography variant="caption">km</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={2}
                          sx={{ p: 3, textAlign: 'center', height: '100%' }}
                        >
                          <ThermostatAutoOutlined
                            color="primary"
                            sx={{ fontSize: 40, mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Pressure
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {weather.main.pressure}
                          </Typography>
                          <Typography variant="caption">hPa</Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Sun Schedule */}
                    <Card elevation={2} sx={{ mt: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          ☀️ Sun Schedule
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={6}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <WbSunny sx={{ color: '#ffa726', fontSize: 48 }} />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Sunrise
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {new Date(
                                    weather.sys.sunrise * 1000
                                  ).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={6}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <WbTwilight sx={{ color: '#ff7043', fontSize: 48 }} />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Sunset
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {new Date(
                                    weather.sys.sunset * 1000
                                  ).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </TabPanel>

                  {/* Tab 2: Forecast Charts */}
                  <TabPanel value={tabValue} index={1}>
                    {forecast && (
                      <Stack spacing={4}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Temperature Timeline
                          </Typography>
                          <D3TemperatureChart data={forecastChartData} />
                        </Box>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Multi-Metric Forecast
                          </Typography>
                          <D3ForecastChart data={forecastChartData} />
                        </Box>
                      </Stack>
                    )}
                  </TabPanel>

                  {/* Tab 3: Wind Analysis */}
                  <TabPanel value={tabValue} index={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        py: 4,
                      }}
                    >
                      <D3WindCompass
                        windSpeed={weather.wind.speed}
                        windDeg={weather.wind.deg}
                        windGust={weather.wind.gust}
                        size={300}
                      />
                    </Box>
                  </TabPanel>
                </Card>
              </motion.div>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default EnhancedWeatherDashboard
