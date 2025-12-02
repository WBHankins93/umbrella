// OpenWeatherMap API response types
export interface Coordinates {
  lon: number
  lat: number
}

export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface MainWeatherData {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  humidity: number
  sea_level?: number
  grnd_level?: number
}

export interface Wind {
  speed: number
  deg: number
  gust?: number
}

export interface Clouds {
  all: number
}

export interface Rain {
  '1h'?: number
  '3h'?: number
}

export interface Snow {
  '1h'?: number
  '3h'?: number
}

export interface Sys {
  type?: number
  id?: number
  country: string
  sunrise: number
  sunset: number
}

export interface CurrentWeatherData {
  coord: Coordinates
  weather: WeatherCondition[]
  base: string
  main: MainWeatherData
  visibility: number
  wind: Wind
  clouds: Clouds
  rain?: Rain
  snow?: Snow
  dt: number
  sys: Sys
  timezone: number
  id: number
  name: string
  cod: number
}

// Forecast API types
export interface ForecastItem {
  dt: number
  main: MainWeatherData
  weather: WeatherCondition[]
  clouds: Clouds
  wind: Wind
  visibility: number
  pop: number // Probability of precipitation
  rain?: Rain
  snow?: Snow
  sys: {
    pod: string // Part of day (d/n)
  }
  dt_txt: string
}

export interface ForecastData {
  cod: string
  message: number
  cnt: number
  list: ForecastItem[]
  city: {
    id: number
    name: string
    coord: Coordinates
    country: string
    population: number
    timezone: number
    sunrise: number
    sunset: number
  }
}

// Temperature data for charts
export interface TemperatureDataPoint {
  name: string
  temp: number
}

// Forecast chart data
export interface ForecastChartData {
  time: string
  temp: number
  feels_like: number
  humidity: number
  pressure: number
  precipitation: number
  windSpeed: number
}

// API response wrapper
export interface WeatherApiResponse {
  weatherData: CurrentWeatherData
}

export interface ForecastApiResponse {
  forecastData: ForecastData
}
