import { Pool } from 'pg'
import dns from 'dns'
import dotenv from 'dotenv'

dotenv.config()

// Force IPv4 to avoid Railway IPv6 connectivity issues
dns.setDefaultResultOrder('ipv4first')

// Also set at resolver level
const originalLookup = dns.lookup
dns.lookup = ((hostname: string, options: any, callback: any) => {
  if (typeof options === 'function') {
    callback = options
    options = { family: 4 }
  } else {
    options = { ...options, family: 4 }
  }
  return originalLookup(hostname, options, callback)
}) as typeof dns.lookup

// Check for required environment variables
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  console.warn(`
⚠️  Database configuration missing!

Create a .env file in the backend folder with your PostgreSQL credentials:

  DATABASE_URL=postgresql://username:password@host:5432/database

Then restart the server.
`)
}

// Parse DATABASE_URL to add connection options
const dbUrl = process.env.DATABASE_URL || ''
const isSupabase = dbUrl.includes('supabase') || dbUrl.includes('pooler')

// Create pool with SSL support for Supabase/cloud databases
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  // Connection settings for better reliability
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
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
