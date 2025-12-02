import { ThemeProvider } from './context/ThemeContext'
import EnhancedWeatherDashboard from './components/EnhancedWeatherDashboard'

function App() {
  return (
    <ThemeProvider>
      <EnhancedWeatherDashboard />
    </ThemeProvider>
  )
}

export default App
