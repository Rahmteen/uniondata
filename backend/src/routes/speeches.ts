import { Router, Request, Response } from 'express'
import { query } from '../db'

const router = Router()

/**
 * GET /api/speeches
 * Get paginated list of speeches
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const offset = (page - 1) * limit
    const speechType = req.query.type as string
    const search = req.query.search as string
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    let whereClause = ''
    const params: unknown[] = []
    let paramIndex = 1

    if (startDate && endDate) {
      whereClause += `WHERE date >= $${paramIndex} AND date <= $${paramIndex + 1}`
      params.push(startDate, endDate)
      paramIndex += 2
    }

    if (speechType) {
      whereClause += whereClause ? ' AND ' : 'WHERE '
      whereClause += `speech_type = $${paramIndex}`
      params.push(speechType)
      paramIndex++
    }

    if (search) {
      whereClause += whereClause ? ' AND ' : 'WHERE '
      whereClause += `(title ILIKE $${paramIndex} OR transcript ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM speeches ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].count)

    // Get speeches
    const speechesResult = await query(
      `SELECT id, title, date, location, speech_type, word_count, unique_word_count
       FROM speeches
       ${whereClause}
       ORDER BY date DESC NULLS LAST
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    )

    res.json({
      speeches: speechesResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching speeches:', error)
    res.status(500).json({ error: 'Failed to fetch speeches' })
  }
})

/**
 * GET /api/speeches/types
 * Get available speech types
 */
router.get('/types', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT DISTINCT speech_type, COUNT(*) as count
       FROM speeches
       WHERE speech_type IS NOT NULL
       GROUP BY speech_type
       ORDER BY count DESC`
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching speech types:', error)
    res.status(500).json({ error: 'Failed to fetch speech types' })
  }
})

/**
 * GET /api/speeches/stats
 * Get overall speech statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    let queryText: string
    let params: unknown[] = []

    if (startDate && endDate) {
      queryText = `
        SELECT 
          COUNT(*) as total_speeches,
          SUM(word_count) as total_words,
          AVG(word_count)::INTEGER as avg_words_per_speech,
          MIN(date) as earliest_speech,
          MAX(date) as latest_speech
        FROM speeches
        WHERE date >= $1 AND date <= $2
      `
      params = [startDate, endDate]
    } else {
      queryText = `
        SELECT 
          COUNT(*) as total_speeches,
          SUM(word_count) as total_words,
          AVG(word_count)::INTEGER as avg_words_per_speech,
          MIN(date) as earliest_speech,
          MAX(date) as latest_speech
        FROM speeches
      `
    }

    const result = await query(queryText, params)
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

/**
 * GET /api/speeches/:id
 * Get single speech with word stats
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Get speech
    const speechResult = await query(
      'SELECT * FROM speeches WHERE id = $1',
      [id]
    )

    if (speechResult.rows.length === 0) {
      return res.status(404).json({ error: 'Speech not found' })
    }

    // Get top words for this speech
    const wordsResult = await query(
      `SELECT word, frequency
       FROM word_stats
       WHERE speech_id = $1
       ORDER BY frequency DESC
       LIMIT 50`,
      [id]
    )

    res.json({
      speech: speechResult.rows[0],
      topWords: wordsResult.rows,
    })
  } catch (error) {
    console.error('Error fetching speech:', error)
    res.status(500).json({ error: 'Failed to fetch speech' })
  }
})

export default router
