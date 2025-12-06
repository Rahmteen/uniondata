/**
 * Miller Center Trump Speeches Scraper
 * 
 * Scrapes ALL Trump presidential speeches from the Miller Center website
 * Uses built-in Node.js modules for compatibility.
 * 
 * Usage:
 *   npm run scrape
 */

import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://millercenter.org'

interface Speech {
  title: string
  date: string
  location: string
  speech_type: string
  transcript: string
  source: string
  source_url: string
}

// Simple delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Fetch a URL using built-in https module
 */
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    }, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location
        if (redirectUrl) {
          fetchUrl(redirectUrl.startsWith('http') ? redirectUrl : `${BASE_URL}${redirectUrl}`)
            .then(resolve)
            .catch(reject)
          return
        }
      }

      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
      res.on('error', reject)
    })

    req.on('error', reject)
    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * ALL Trump speeches from Miller Center (First Term 2017-2021 + Second Term 2025+)
 */
const ALL_TRUMP_SPEECHES = [
  // ===== SECOND TERM (2025) =====
  { url: '/the-presidency/presidential-speeches/september-30-2025-remarks-military-leaders', title: 'Remarks to Military Leaders', date: '2025-09-30' },
  { url: '/the-presidency/presidential-speeches/september-23-2025-address-80th-united-nations-general-assembly', title: 'Address before the 80th United Nations General Assembly', date: '2025-09-23' },
  { url: '/the-presidency/presidential-speeches/june-21-2025-address-american-people', title: 'Address to the American People', date: '2025-06-21' },
  { url: '/the-presidency/presidential-speeches/march-4-2025-address-joint-session-congress', title: 'Address to a Joint Session of Congress', date: '2025-03-04' },
  { url: '/the-presidency/presidential-speeches/january-20-2025-inaugural-address', title: 'Inaugural Address (Second Term)', date: '2025-01-20' },
  
  // ===== FIRST TERM (2017-2021) =====
  // 2021
  { url: '/the-presidency/presidential-speeches/january-19-2021-farewell-address', title: 'Farewell Address', date: '2021-01-19' },
  { url: '/the-presidency/presidential-speeches/january-13-2021-statement-about-violence-capitol', title: 'Statement about the Violence at the Capitol', date: '2021-01-13' },
  { url: '/the-presidency/presidential-speeches/january-7-2021-message-after-pro-trump-mob-overruns-us-capitol', title: 'Message After Pro-Trump Mob Overruns US Capitol', date: '2021-01-07' },
  { url: '/the-presidency/presidential-speeches/january-6-2021-speech-urging-supporters-go-home', title: 'Speech Urging Supporters to Go Home', date: '2021-01-06' },
  
  // 2020
  { url: '/the-presidency/presidential-speeches/november-5-2020-remarks-2020-election', title: 'Remarks on the 2020 Election', date: '2020-11-05' },
  { url: '/the-presidency/presidential-speeches/october-26-2020-swearing-ceremony-amy-coney-barrett', title: 'Swearing-In Ceremony of Amy Coney Barrett', date: '2020-10-26' },
  { url: '/the-presidency/presidential-speeches/september-26-2020-announcing-nominee-supreme-court', title: 'Announcing His Nominee for the US Supreme Court', date: '2020-09-26' },
  { url: '/the-presidency/presidential-speeches/september-7-2020-labor-day-press-conference', title: 'Labor Day Press Conference', date: '2020-09-07' },
  { url: '/the-presidency/presidential-speeches/august-8-2020-press-conference-executive-orders', title: 'Press Conference on Executive Orders', date: '2020-08-08' },
  { url: '/the-presidency/presidential-speeches/july-4-2020-remarks-salute-america', title: 'Remarks at Salute to America', date: '2020-07-04' },
  { url: '/the-presidency/presidential-speeches/june-20-2020-campaign-rally-tulsa-oklahoma', title: 'Campaign Rally in Tulsa, Oklahoma', date: '2020-06-20' },
  { url: '/the-presidency/presidential-speeches/june-13-2020-address-west-point-graduation', title: 'Address at West Point Graduation', date: '2020-06-13' },
  { url: '/the-presidency/presidential-speeches/june-1-2020-statement-protests-police-brutality', title: 'Statement on Protests Against Police Brutality', date: '2020-06-01' },
  { url: '/the-presidency/presidential-speeches/april-23-2020-task-force-briefing-coronavirus', title: 'Task Force Briefing on the Coronavirus Pandemic', date: '2020-04-23' },
  { url: '/the-presidency/presidential-speeches/april-15-2020-press-briefing-coronavirus-task-force', title: 'Press Briefing with the Coronavirus Task Force', date: '2020-04-15' },
  { url: '/the-presidency/presidential-speeches/april-13-2020-coronavirus-task-force-briefing', title: 'Coronavirus Task Force Briefing', date: '2020-04-13' },
  { url: '/the-presidency/presidential-speeches/march-13-2020-press-conference-coronavirus', title: 'Press Conference about the Coronavirus', date: '2020-03-13' },
  { url: '/the-presidency/presidential-speeches/march-11-2020-statement-coronavirus', title: 'Statement on the Coronavirus', date: '2020-03-11' },
  { url: '/the-presidency/presidential-speeches/february-6-2020-remarks-after-acquittal', title: 'Remarks after His Acquittal', date: '2020-02-06' },
  { url: '/the-presidency/presidential-speeches/february-4-2020-state-union-address', title: 'State of the Union Address (2020)', date: '2020-02-04' },
  { url: '/the-presidency/presidential-speeches/january-24-2020-speech-march-life', title: 'Speech at March for Life', date: '2020-01-24' },
  { url: '/the-presidency/presidential-speeches/january-8-2020-statement-iran', title: 'Statement on Iran', date: '2020-01-08' },
  { url: '/the-presidency/presidential-speeches/january-3-2020-remarks-killing-qasem-soleimani', title: 'Remarks on the Killing of Qasem Soleimani', date: '2020-01-03' },
  
  // 2019
  { url: '/the-presidency/presidential-speeches/october-27-2019-statement-death-abu-bakr-al-baghdadi', title: 'Statement on the Death of Abu Bakr al-Baghdadi', date: '2019-10-27' },
  { url: '/the-presidency/presidential-speeches/september-25-2019-press-conference', title: 'Press Conference (September 2019)', date: '2019-09-25' },
  { url: '/the-presidency/presidential-speeches/september-24-2019-remarks-united-nations-general-assembly', title: 'Remarks at the United Nations General Assembly', date: '2019-09-24' },
  { url: '/the-presidency/presidential-speeches/february-15-2019-speech-declaring-national-emergency', title: 'Speech Declaring a National Emergency', date: '2019-02-15' },
  { url: '/the-presidency/presidential-speeches/february-5-2019-state-union-address', title: 'State of the Union Address (2019)', date: '2019-02-05' },
  { url: '/the-presidency/presidential-speeches/january-19-2019-remarks-about-us-southern-border', title: 'Remarks about the US Southern Border', date: '2019-01-19' },
  
  // 2018
  { url: '/the-presidency/presidential-speeches/september-25-2018-address-73rd-session-united-nations', title: 'Address at the 73rd Session of the United Nations', date: '2018-09-25' },
  { url: '/the-presidency/presidential-speeches/july-24-2018-speech-veterans-foreign-wars', title: 'Speech at the Veterans of Foreign Wars National Convention', date: '2018-07-24' },
  { url: '/the-presidency/presidential-speeches/march-19-2018-remarks-combating-opioid-crisis', title: 'Remarks on Combating the Opioid Crisis', date: '2018-03-19' },
  { url: '/the-presidency/presidential-speeches/february-23-2018-remarks-cpac', title: 'Remarks at the Conservative Political Action Conference', date: '2018-02-23' },
  { url: '/the-presidency/presidential-speeches/february-15-2018-statement-school-shooting-parkland', title: 'Statement on the School Shooting in Parkland, Florida', date: '2018-02-15' },
  { url: '/the-presidency/presidential-speeches/february-1-2018-remarks-republican-member-conference', title: 'Remarks at the House and Senate Republican Conference', date: '2018-02-01' },
  { url: '/the-presidency/presidential-speeches/january-30-2018-state-union-address', title: 'State of the Union Address (2018)', date: '2018-01-30' },
  { url: '/the-presidency/presidential-speeches/january-26-2018-address-world-economic-forum', title: 'Address at the World Economic Forum', date: '2018-01-26' },
  
  // 2017
  { url: '/the-presidency/presidential-speeches/december-18-2017-remarks-national-security-strategy', title: 'Remarks on National Security Strategy', date: '2017-12-18' },
  { url: '/the-presidency/presidential-speeches/september-19-2017-address-united-nations-general-assembly', title: 'Address to the United Nations General Assembly', date: '2017-09-19' },
  { url: '/the-presidency/presidential-speeches/july-24-2017-speech-boy-scout-jamboree', title: 'Speech at the Boy Scout Jamboree', date: '2017-07-24' },
  { url: '/the-presidency/presidential-speeches/june-29-2017-speech-unleashing-american-energy', title: 'Speech at the Unleashing American Energy Event', date: '2017-06-29' },
  { url: '/the-presidency/presidential-speeches/february-28-2017-address-joint-session-congress', title: 'Address to Joint Session of Congress', date: '2017-02-28' },
  { url: '/the-presidency/presidential-speeches/january-20-2017-inaugural-address', title: 'Inaugural Address (First Term)', date: '2017-01-20' },
]

/**
 * Scrape a single speech page
 */
async function scrapeSpeech(speechInfo: { url: string; title: string; date: string }): Promise<Speech | null> {
  const fullUrl = `${BASE_URL}${speechInfo.url}`
  
  try {
    const html = await fetchUrl(fullUrl)
    
    // Extract transcript - look for the main content area
    let transcript = ''
    
    // Try to find transcript content
    const contentMarkers = [
      { start: 'field--name-field-transcript', end: '</div></div></div>' },
      { start: 'class="transcript"', end: '</div>' },
      { start: 'presidential-speeches--transcript', end: '</div>' },
    ]

    for (const marker of contentMarkers) {
      const startIdx = html.toLowerCase().indexOf(marker.start.toLowerCase())
      if (startIdx !== -1) {
        const chunk = html.slice(startIdx, Math.min(startIdx + 100000, html.length))
        // Find closing divs
        let depth = 0
        let endIdx = 0
        for (let i = 0; i < chunk.length - 6; i++) {
          if (chunk.slice(i, i + 4).toLowerCase() === '<div') depth++
          if (chunk.slice(i, i + 6).toLowerCase() === '</div>') {
            depth--
            if (depth <= 0) {
              endIdx = i
              break
            }
          }
        }
        if (endIdx > 100) {
          transcript = stripHtml(chunk.slice(0, endIdx))
          if (transcript.length > 500) break
        }
      }
    }

    // Fallback: get all paragraph text after "Transcript"
    if (transcript.length < 500) {
      const transcriptIdx = html.toLowerCase().indexOf('transcript')
      if (transcriptIdx !== -1) {
        const afterTranscript = html.slice(transcriptIdx)
        const paragraphs: string[] = []
        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi
        let pMatch
        while ((pMatch = pRegex.exec(afterTranscript)) !== null) {
          const text = stripHtml(pMatch[1])
          if (text.length > 30) {
            paragraphs.push(text)
          }
        }
        if (paragraphs.length > 0) {
          transcript = paragraphs.join(' ')
        }
      }
    }

    // Clean transcript
    transcript = transcript
      .replace(/\s+/g, ' ')
      .replace(/Share on Facebook[\s\S]*?Print page/gi, '')
      .replace(/^Transcript\s*/i, '')
      .replace(/Miller Center.*$/i, '')
      .trim()

    if (!transcript || transcript.length < 200) {
      console.log(`   ⚠️ Transcript too short (${transcript.length} chars)`)
      return null
    }

    // Determine speech type from title
    let speechType = 'speech'
    const titleLower = speechInfo.title.toLowerCase()
    if (titleLower.includes('inaugural')) speechType = 'inaugural'
    else if (titleLower.includes('state of the union')) speechType = 'state_of_union'
    else if (titleLower.includes('address')) speechType = 'address'
    else if (titleLower.includes('press conference') || titleLower.includes('briefing')) speechType = 'press_conference'
    else if (titleLower.includes('remarks')) speechType = 'remarks'
    else if (titleLower.includes('statement')) speechType = 'statement'
    else if (titleLower.includes('rally')) speechType = 'rally'
    else if (titleLower.includes('speech')) speechType = 'speech'

    return {
      title: speechInfo.title,
      date: speechInfo.date,
      location: 'Washington, D.C.',
      speech_type: speechType,
      transcript,
      source: 'Miller Center',
      source_url: fullUrl,
    }
  } catch (error) {
    console.log(`   ❌ Error: ${(error as Error).message}`)
    return null
  }
}

/**
 * Main scraper function
 */
async function scrape() {
  console.log('🚀 Miller Center Trump Speeches Scraper')
  console.log('=' .repeat(50))
  console.log(`📋 Total speeches to scrape: ${ALL_TRUMP_SPEECHES.length}`)
  console.log(`   • Second Term (2025): 5 speeches`)
  console.log(`   • First Term (2017-2021): ${ALL_TRUMP_SPEECHES.length - 5} speeches`)
  console.log('=' .repeat(50) + '\n')

  const speeches: Speech[] = []
  let successCount = 0
  let failCount = 0
  
  for (let i = 0; i < ALL_TRUMP_SPEECHES.length; i++) {
    const speechInfo = ALL_TRUMP_SPEECHES[i]
    console.log(`[${i + 1}/${ALL_TRUMP_SPEECHES.length}] ${speechInfo.title}`)
    console.log(`   📅 ${speechInfo.date}`)
    
    const speech = await scrapeSpeech(speechInfo)
    if (speech) {
      speeches.push(speech)
      successCount++
      console.log(`   ✅ Success (${speech.transcript.length.toLocaleString()} chars)`)
    } else {
      failCount++
    }
    console.log('')
    
    // Rate limiting - be nice to the server
    await delay(2000)
  }

  // Save to file
  const outputDir = path.join(__dirname, '../data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputFile = path.join(outputDir, 'miller_center_speeches.json')
  fs.writeFileSync(outputFile, JSON.stringify(speeches, null, 2))

  console.log('=' .repeat(50))
  console.log('✅ SCRAPING COMPLETE')
  console.log('=' .repeat(50))
  console.log(`   📊 Success: ${successCount} speeches`)
  console.log(`   ❌ Failed: ${failCount} speeches`)
  console.log(`   📁 Output: ${outputFile}`)
  console.log('')
  console.log('📌 Next step - ingest into database:')
  console.log('   npm run ingest -- --file=./data/miller_center_speeches.json')
}

// Run
scrape().catch(console.error)
