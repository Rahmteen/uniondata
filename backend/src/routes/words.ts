import { Router, Request, Response } from 'express'
import { query } from '../db'

const router = Router()

/**
 * GET /api/words/cloud
 * Get word cloud data (top words with frequencies)
 * Supports date range filtering
 */
router.get('/cloud', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 200, 500)
    const minCount = parseInt(req.query.minCount as string) || 2
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    let queryText: string
    let params: unknown[]

    if (startDate && endDate) {
      // Filter by date range - aggregate from word_stats joined with speeches
      queryText = `
        SELECT 
          ws.word as text, 
          SUM(ws.frequency)::INTEGER as value,
          COUNT(DISTINCT ws.speech_id)::INTEGER as speech_count
        FROM word_stats ws
        JOIN speeches s ON ws.speech_id = s.id
        WHERE s.date >= $1 AND s.date <= $2
        GROUP BY ws.word
        HAVING SUM(ws.frequency) >= $3
        ORDER BY value DESC
        LIMIT $4
      `
      params = [startDate, endDate, minCount, limit]
    } else {
      // No date filter - use pre-computed totals
      queryText = `
        SELECT word as text, total_count as value, speech_count
        FROM word_totals
        WHERE total_count >= $1
        ORDER BY total_count DESC
        LIMIT $2
      `
      params = [minCount, limit]
    }

    const result = await query(queryText, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching word cloud:', error)
    res.status(500).json({ error: 'Failed to fetch word cloud data' })
  }
})

/**
 * GET /api/words/top
 * Get top N words overall
 */
router.get('/top', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500)

    const result = await query(
      `SELECT word, total_count, speech_count, avg_per_speech
       FROM word_totals
       ORDER BY total_count DESC
       LIMIT $1`,
      [limit]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching top words:', error)
    res.status(500).json({ error: 'Failed to fetch top words' })
  }
})

/**
 * GET /api/words/search
 * Search for a specific word
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const word = (req.query.word as string)?.toLowerCase()

    if (!word) {
      return res.status(400).json({ error: 'Word parameter required' })
    }

    // Get overall stats for this word
    const totalResult = await query(
      `SELECT * FROM word_totals WHERE word = $1`,
      [word]
    )

    // Get usage by speech
    const speechUsageResult = await query(
      `SELECT ws.frequency, s.id, s.title, s.date, s.speech_type
       FROM word_stats ws
       JOIN speeches s ON ws.speech_id = s.id
       WHERE ws.word = $1
       ORDER BY s.date DESC`,
      [word]
    )

    res.json({
      word,
      total: totalResult.rows[0] || null,
      usageBySpeeech: speechUsageResult.rows,
    })
  } catch (error) {
    console.error('Error searching word:', error)
    res.status(500).json({ error: 'Failed to search word' })
  }
})

/**
 * GET /api/words/timeline
 * Get word frequency over time for specific word(s)
 */
router.get('/timeline', async (req: Request, res: Response) => {
  try {
    const words = (req.query.words as string)?.split(',').map(w => w.toLowerCase().trim())
    
    if (!words || words.length === 0) {
      return res.status(400).json({ error: 'Words parameter required (comma-separated)' })
    }

    const result = await query(
      `SELECT 
        DATE_TRUNC('month', s.date) as month,
        ws.word,
        SUM(ws.frequency) as frequency
       FROM word_stats ws
       JOIN speeches s ON ws.speech_id = s.id
       WHERE ws.word = ANY($1) AND s.date IS NOT NULL
       GROUP BY DATE_TRUNC('month', s.date), ws.word
       ORDER BY month`,
      [words]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching timeline:', error)
    res.status(500).json({ error: 'Failed to fetch timeline data' })
  }
})

/**
 * GET /api/words/date-range
 * Get the min and max dates of available speeches
 */
router.get('/date-range', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        MIN(date) as min_date,
        MAX(date) as max_date,
        COUNT(*) as speech_count
      FROM speeches
      WHERE date IS NOT NULL
    `)
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching date range:', error)
    res.status(500).json({ error: 'Failed to fetch date range' })
  }
})

/**
 * GET /api/words/stats
 * Get overall word statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    let result

    if (startDate && endDate) {
      // Filter by date range
      result = await query(`
        SELECT 
          COUNT(DISTINCT ws.word) as unique_words,
          SUM(ws.frequency)::INTEGER as total_word_occurrences,
          ROUND(AVG(ws.frequency))::INTEGER as avg_frequency
        FROM word_stats ws
        JOIN speeches s ON ws.speech_id = s.id
        WHERE s.date >= $1 AND s.date <= $2
      `, [startDate, endDate])
    } else {
      result = await query(`
        SELECT 
          COUNT(DISTINCT word) as unique_words,
          SUM(total_count) as total_word_occurrences,
          AVG(total_count)::INTEGER as avg_frequency
        FROM word_totals
      `)
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching word stats:', error)
    res.status(500).json({ error: 'Failed to fetch word statistics' })
  }
})

export default router
