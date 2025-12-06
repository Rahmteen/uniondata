import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import speechesRouter from './routes/speeches'
import wordsRouter from './routes/words'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      return callback(null, true)
    }
    
    // In production, also allow any vercel.app domain
    if (origin.includes('.vercel.app')) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/speeches', speechesRouter)
app.use('/api/words', wordsRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app

