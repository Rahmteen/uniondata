import natural from 'natural'

const tokenizer = new natural.WordTokenizer()
const stemmer = natural.PorterStemmer

// Minimal stop words - only filter the most basic ones
// Keep more interesting filler words for analysis
const STOP_WORDS = new Set([
  // Basic articles
  'a', 'an', 'the',
  // Basic pronouns (keep some for analysis)
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his',
  'she', 'her', 'it', 'its', 'they', 'them', 'their',
  // Basic verbs
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did',
  // Basic prepositions  
  'of', 'at', 'by', 'for', 'with', 'to', 'from', 'in', 'on',
  // Basic conjunctions
  'and', 'but', 'or', 'if', 'as',
  // Very common words
  'that', 'this', 'which', 'who', 'what',
  // Contractions without apostrophe
  've', 'll', 're', 'd', 's', 't',
])

export interface WordFrequency {
  word: string
  count: number
  stem?: string
}

export interface AnalysisResult {
  wordFrequencies: WordFrequency[]
  totalWords: number
  uniqueWords: number
  cleanedText: string
}

/**
 * Clean and normalize text for analysis
 */
export function cleanText(text: string): string {
  return text
    // Convert to lowercase
    .toLowerCase()
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove email addresses
    .replace(/\S+@\S+\.\S+/g, '')
    // Remove special characters but keep apostrophes in contractions
    .replace(/[^\w\s']/g, ' ')
    // Remove numbers
    .replace(/\d+/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tokenize text into words
 */
export function tokenize(text: string): string[] {
  const cleaned = cleanText(text)
  return tokenizer.tokenize(cleaned) || []
}

/**
 * Filter out stop words - minimal filtering to keep more words
 */
export function filterStopWords(words: string[]): string[] {
  return words.filter(word => {
    // Must be at least 2 characters
    if (word.length < 2) return false
    // Must not be a basic stop word
    if (STOP_WORDS.has(word)) return false
    // Must contain at least one letter
    if (!/[a-z]/.test(word)) return false
    return true
  })
}

/**
 * Get stem of a word (for grouping similar words)
 */
export function getStem(word: string): string {
  return stemmer.stem(word)
}

/**
 * Count word frequencies
 */
export function countFrequencies(words: string[]): Map<string, number> {
  const frequencies = new Map<string, number>()
  
  for (const word of words) {
    frequencies.set(word, (frequencies.get(word) || 0) + 1)
  }
  
  return frequencies
}

/**
 * Analyze text and return word frequencies
 */
export function analyzeText(text: string): AnalysisResult {
  const cleanedText = cleanText(text)
  const tokens = tokenize(text)
  const filteredWords = filterStopWords(tokens)
  const frequencies = countFrequencies(filteredWords)
  
  // Convert to array and sort by frequency
  const wordFrequencies: WordFrequency[] = Array.from(frequencies.entries())
    .map(([word, count]) => ({
      word,
      count,
      stem: getStem(word),
    }))
    .sort((a, b) => b.count - a.count)
  
  return {
    wordFrequencies,
    totalWords: tokens.length,
    uniqueWords: frequencies.size,
    cleanedText,
  }
}

/**
 * Get top N words from analysis result
 */
export function getTopWords(result: AnalysisResult, n: number = 100): WordFrequency[] {
  return result.wordFrequencies.slice(0, n)
}

/**
 * Merge word frequencies from multiple analyses
 */
export function mergeFrequencies(analyses: AnalysisResult[]): Map<string, number> {
  const merged = new Map<string, number>()
  
  for (const analysis of analyses) {
    for (const { word, count } of analysis.wordFrequencies) {
      merged.set(word, (merged.get(word) || 0) + count)
    }
  }
  
  return merged
}

export default {
  cleanText,
  tokenize,
  filterStopWords,
  getStem,
  countFrequencies,
  analyzeText,
  getTopWords,
  mergeFrequencies,
}
