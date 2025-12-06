import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Check for required environment variables
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  console.warn(`
⚠️  Database configuration missing!

Create a .env file in the backend folder with your PostgreSQL credentials:

  DATABASE_URL=postgresql://username:password@host:5432/database

Then restart the server.
`)
}

// Create pool with SSL support for Supabase/cloud databases
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false }
    : undefined,
})

// Test connection
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message)
})

export const query = async (text: string, params?: unknown[]) => {
  try {
    return await pool.query(text, params)
  } catch (error) {
    throw error
  }
}

export const testConnection = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}

export default pool
