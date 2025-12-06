/**
 * Data Ingestion Script for Trump Speeches
 * 
 * This script reads speech data from JSON/CSV files and ingests them into PostgreSQL.
 * 
 * Usage:
 *   npm run ingest -- --file=./data/speeches.json
 *   npm run ingest -- --dir=./data/speeches/
 *   npm run ingest -- --sample
 */

import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import { analyzeText } from '../src/services/wordAnalyzer'

dotenv.config()

// Create pool with SSL support for Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : undefined,
})

interface SpeechInput {
  title: string
  date?: string
  location?: string
  speech_type?: string
  transcript: string
  source?: string
  source_url?: string
}

/**
 * Insert a single speech and its word statistics
 */
async function insertSpeech(speech: SpeechInput): Promise<number> {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Analyze the transcript
    const analysis = analyzeText(speech.transcript)
    
    // Insert speech
    const speechResult = await client.query(
      `INSERT INTO speeches (title, date, location, speech_type, transcript, word_count, unique_word_count, source, source_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        speech.title,
        speech.date || null,
        speech.location || null,
        speech.speech_type || null,
        speech.transcript,
        analysis.totalWords,
        analysis.uniqueWords,
        speech.source || null,
        speech.source_url || null,
      ]
    )
    
    const speechId = speechResult.rows[0].id
    
    // Insert word stats for this speech (batch insert)
    if (analysis.wordFrequencies.length > 0) {
      // Insert in batches of 100 to avoid query size limits
      const batchSize = 100
      for (let i = 0; i < analysis.wordFrequencies.length; i += batchSize) {
        const batch = analysis.wordFrequencies.slice(i, i + batchSize)
        const wordValues = batch
          .map((_, idx) => `($${idx * 3 + 1}, $${idx * 3 + 2}, $${idx * 3 + 3})`)
          .join(', ')
        
        const wordParams = batch.flatMap(wf => [wf.word, wf.count, speechId])
        
        await client.query(
          `INSERT INTO word_stats (word, frequency, speech_id) VALUES ${wordValues}
           ON CONFLICT (word, speech_id) DO UPDATE SET frequency = EXCLUDED.frequency`,
          wordParams
        )
      }
    }
    
    await client.query('COMMIT')
    return speechId
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Update global word totals after ingestion
 */
async function updateWordTotals(): Promise<void> {
  console.log('📊 Updating global word totals...')
  
  await pool.query(`
    INSERT INTO word_totals (word, total_count, speech_count, avg_per_speech, first_used, last_used)
    SELECT 
      ws.word,
      SUM(ws.frequency) as total_count,
      COUNT(DISTINCT ws.speech_id) as speech_count,
      ROUND(AVG(ws.frequency), 2) as avg_per_speech,
      MIN(s.date) as first_used,
      MAX(s.date) as last_used
    FROM word_stats ws
    JOIN speeches s ON ws.speech_id = s.id
    GROUP BY ws.word
    ON CONFLICT (word) DO UPDATE SET
      total_count = EXCLUDED.total_count,
      speech_count = EXCLUDED.speech_count,
      avg_per_speech = EXCLUDED.avg_per_speech,
      first_used = EXCLUDED.first_used,
      last_used = EXCLUDED.last_used,
      updated_at = NOW()
  `)
  
  console.log('✅ Word totals updated')
}

/**
 * Read and parse JSON file
 */
function readJsonFile(filePath: string): SpeechInput[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Read all JSON files from a directory
 */
function readJsonDirectory(dirPath: string): SpeechInput[] {
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'))
  const speeches: SpeechInput[] = []
  
  for (const file of files) {
    const filePath = path.join(dirPath, file)
    const data = readJsonFile(filePath)
    speeches.push(...(Array.isArray(data) ? data : [data]))
  }
  
  return speeches
}

/**
 * Main ingestion function
 */
async function ingest(speeches: SpeechInput[]): Promise<void> {
  console.log(`🚀 Starting ingestion of ${speeches.length} speeches...`)
  
  let success = 0
  let failed = 0
  
  for (let i = 0; i < speeches.length; i++) {
    const speech = speeches[i]
    
    try {
      await insertSpeech(speech)
      success++
      console.log(`   ✅ Inserted: "${speech.title}"`)
      
      if ((i + 1) % 10 === 0) {
        console.log(`   Progress: ${i + 1}/${speeches.length} speeches processed`)
      }
    } catch (error) {
      failed++
      console.error(`   ❌ Failed to insert "${speech.title}":`, error)
    }
  }
  
  console.log(`\n📈 Ingestion complete:`)
  console.log(`   ✅ Success: ${success}`)
  console.log(`   ❌ Failed: ${failed}`)
  
  // Update word totals
  if (success > 0) {
    await updateWordTotals()
  }
}

/**
 * Generate sample data for testing
 */
function generateSampleData(): SpeechInput[] {
  return [
    {
      title: 'Inaugural Address',
      date: '2017-01-20',
      location: 'Washington, D.C.',
      speech_type: 'address',
      transcript: `Chief Justice Roberts, President Carter, President Clinton, President Bush, President Obama, fellow Americans, and people of the world: Thank you. We, the citizens of America, are now joined in a great national effort to rebuild our country and restore its promise for all of our people. Together, we will determine the course of America and the world for many, many years to come. We will face challenges. We will confront hardships. But we will get the job done. Every four years, we gather on these steps to carry out the orderly and peaceful transfer of power, and we are grateful to President Obama and First Lady Michelle Obama for their gracious aid throughout this transition. They have been magnificent. Thank you. Today's ceremony, however, has very special meaning. Because today we are not merely transferring power from one Administration to another, or from one party to another, but we are transferring power from Washington, D.C. and giving it back to you, the people. For too long, a small group in our nation's Capital has reaped the rewards of government while the people have borne the cost. Washington flourished, but the people did not share in its wealth. Politicians prospered, but the jobs left, and the factories closed. The establishment protected itself, but not the citizens of our country. Their victories have not been your victories; their triumphs have not been your triumphs; and while they celebrated in our nation's capital, there was little to celebrate for struggling families all across our land. That all changes, starting right here, and right now, because this moment is your moment: it belongs to you.`,
      source: 'Miller Center',
      source_url: 'https://millercenter.org/the-presidency/presidential-speeches/january-20-2017-inaugural-address',
    },
    {
      title: 'State of the Union Address 2018',
      date: '2018-01-30',
      location: 'Washington, D.C.',
      speech_type: 'address',
      transcript: `Mr. Speaker, Mr. Vice President, Members of Congress, the First Lady of the United States, and my fellow Americans: Less than one year has passed since I first stood at this podium, in this majestic chamber, to speak on behalf of the American people and to address their concerns, their hopes, and their dreams. That night, our new administration had already taken very swift action. A new tide of optimism was already sweeping across our land. Each day since, we have gone forward with a clear vision and a righteous mission, to make America great again for all Americans. Over the last year, we have made incredible progress and achieved extraordinary success. We have faced challenges we expected, and others we could never have imagined. We have shared in the heights of victory and the pains of hardship. We endured floods and fires and storms. But through it all, we have seen the beauty of America's soul, and the steel in America's spine. Each test has forged new American heroes to remind us who we are, and show us what we can be. We saw the volunteers of the Cajun Navy, racing to the rescue with their fishing boats to save people in the aftermath of a devastating hurricane. We saw strangers shielding strangers from a hail of gunfire on the Las Vegas strip. We heard tales of Americans like combative Coast Guard Petty Officer Ashlee Leppert, who is here tonight in the gallery with Melania. Ashlee was aboard one of the first helicopters on the scene in Houston during Hurricane Harvey. Through eighteen hours of wind and rain, Ashlee braved live power lines and deep water to help save more than forty lives. Ashlee, we all thank you. Thank you very much.`,
      source: 'Miller Center',
      source_url: 'https://millercenter.org/the-presidency/presidential-speeches/january-30-2018-state-union-address',
    },
    {
      title: 'Rally Speech - Phoenix, Arizona',
      date: '2017-08-22',
      location: 'Phoenix, Arizona',
      speech_type: 'rally',
      transcript: `Thank you, everybody. What a crowd. What a crowd. I am thrilled to be back in Phoenix, in the great state of Arizona with so many of my wonderful friends and supporters. I love this state and I love the people of this state. You propelled me to victory in this state, and I will never, ever forget. We had a tremendous victory in Arizona. Tremendous. And tonight, I want to speak directly to the people of Arizona and to all Americans about our shared destiny, our shared future, and what we are doing together to make America great again. We are all part of this incredible movement. A movement like has actually never been seen before in our country. A movement to take back our country from the Washington establishment that has failed you. These are truly exciting times. Amazing things are happening. Something special is taking place in America right now. We see it in the crowds. We see it in these massive rallies that we have. Nobody has ever seen crowds like this. Not in the history of politics in this nation. And it is a movement built on love. It is love for fellow citizens. It is love for struggling Americans who have been left behind. And love for every American child who deserves a chance to have all of their dreams come true. From the inner cities to the rural areas, we are keeping our promises to the American people.`,
      source: 'White House Archives',
      source_url: 'https://trumpwhitehouse.archives.gov/',
    },
  ]
}

// CLI handling
async function main() {
  const args = process.argv.slice(2)
  let speeches: SpeechInput[] = []
  
  // Parse arguments
  const fileArg = args.find(a => a.startsWith('--file='))
  const dirArg = args.find(a => a.startsWith('--dir='))
  const sampleArg = args.includes('--sample')
  
  if (fileArg) {
    const filePath = fileArg.split('=')[1]
    console.log(`📁 Reading from file: ${filePath}`)
    speeches = readJsonFile(filePath)
  } else if (dirArg) {
    const dirPath = dirArg.split('=')[1]
    console.log(`📂 Reading from directory: ${dirPath}`)
    speeches = readJsonDirectory(dirPath)
  } else if (sampleArg) {
    console.log('📝 Using sample data for testing...')
    speeches = generateSampleData()
  } else {
    console.log(`
Usage:
  npm run ingest -- --file=./data/speeches.json    # Ingest from single JSON file
  npm run ingest -- --dir=./data/speeches/         # Ingest from directory of JSON files
  npm run ingest -- --sample                       # Ingest sample data for testing
    `)
    process.exit(0)
  }
  
  if (speeches.length === 0) {
    console.log('⚠️  No speeches found to ingest')
    process.exit(0)
  }
  
  await ingest(speeches)
  await pool.end()
}

main().catch(console.error)
