import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config/env.js'
import weatherRoutes from './routes/weatherRoutes.js'

const app: Express = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin:
      config.nodeEnv === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
)

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Weather Dashboard Backend API',
    version: '2.0.0',
    endpoints: {
      weather: '/api/weather?city={cityName}',
      forecast: '/api/forecast?city={cityName}',
    },
  })
})

// API routes
app.use('/api', weatherRoutes)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: ['/api/weather', '/api/forecast'],
  })
})

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  })
})

// Start server
const PORT = config.port

app.listen(PORT, () => {
  console.log(`
🌤️  Weather Dashboard Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on port ${PORT}
🌍 Environment: ${config.nodeEnv}
📡 Endpoints:
   - GET /api/weather?city={cityName}
   - GET /api/forecast?city={cityName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
})

export default app
