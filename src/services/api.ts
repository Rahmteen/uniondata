/**
 * API Client for Trump Word Map Backend
 */

// In production, set VITE_API_URL to your backend (e.g., https://your-app.railway.app/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

/**
 * Base fetch wrapper with error handling
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options
  
  let url = `${API_BASE_URL}${endpoint}`
  
  // Add query params if provided
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  
  return response.json()
}

// Types
export interface WordCloudItem {
  text: string
  value: number
  speechCount?: number
}

export interface SpeechSummary {
  id: number
  title: string
  date: string | null
  location: string | null
  speech_type: string | null
  word_count: number
}

export interface Speech extends SpeechSummary {
  transcript: string
  unique_word_count: number
  source: string | null
  source_url: string | null
}

export interface SpeechesResponse {
  speeches: SpeechSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SpeechDetailResponse {
  speech: Speech
  topWords: { word: string; frequency: number }[]
}

export interface SpeechStats {
  total_speeches: number
  total_words: number
  avg_words_per_speech: number
  earliest_speech: string | null
  latest_speech: string | null
}

export interface WordStats {
  unique_words: number
  total_word_occurrences: number
  avg_frequency: number
}

export interface TopWord {
  word: string
  total_count: number
  speech_count: number
  avg_per_speech: number
}

export interface DateRange {
  min_date: string | null
  max_date: string | null
  speech_count: number
}

export interface DateFilter {
  startDate?: string
  endDate?: string
}

// API Methods

/**
 * Get word cloud data with optional date filtering
 */
export async function getWordCloud(
  limit = 200, 
  minCount = 2,
  dateFilter?: DateFilter
): Promise<WordCloudItem[]> {
  return request<WordCloudItem[]>('/words/cloud', {
    params: { 
      limit, 
      minCount,
      startDate: dateFilter?.startDate,
      endDate: dateFilter?.endDate,
    },
  })
}

/**
 * Get available date range from speeches
 */
export async function getDateRange(): Promise<DateRange> {
  return request<DateRange>('/words/date-range')
}

/**
 * Get top words
 */
export async function getTopWords(limit = 100): Promise<TopWord[]> {
  return request<TopWord[]>('/words/top', { params: { limit } })
}

/**
 * Get word statistics with optional date filtering
 */
export async function getWordStats(dateFilter?: DateFilter): Promise<WordStats> {
  return request<WordStats>('/words/stats', {
    params: {
      startDate: dateFilter?.startDate,
      endDate: dateFilter?.endDate,
    },
  })
}

/**
 * Get speech statistics with optional date filtering
 */
export async function getSpeechStats(dateFilter?: DateFilter): Promise<SpeechStats> {
  return request<SpeechStats>('/speeches/stats', {
    params: {
      startDate: dateFilter?.startDate,
      endDate: dateFilter?.endDate,
    },
  })
}

/**
 * Get speeches list
 */
export async function getSpeeches(
  page = 1,
  limit = 20,
  type?: string,
  search?: string,
  dateFilter?: DateFilter
): Promise<SpeechesResponse> {
  return request<SpeechesResponse>('/speeches', {
    params: { 
      page, 
      limit, 
      ...(type && { type }), 
      ...(search && { search }),
      startDate: dateFilter?.startDate,
      endDate: dateFilter?.endDate,
    },
  })
}

/**
 * Get single speech with word stats
 */
export async function getSpeech(id: number): Promise<SpeechDetailResponse> {
  return request<SpeechDetailResponse>(`/speeches/${id}`)
}

/**
 * Get speech types
 */
export async function getSpeechTypes(): Promise<{ speech_type: string; count: number }[]> {
  return request<{ speech_type: string; count: number }[]>('/speeches/types')
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  return request<{ status: string; timestamp: string }>('/health')
}

export default {
  getWordCloud,
  getDateRange,
  getTopWords,
  getWordStats,
  getSpeechStats,
  getSpeeches,
  getSpeech,
  getSpeechTypes,
  healthCheck,
}
