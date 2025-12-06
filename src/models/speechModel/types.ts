/**
 * @name SpeechTypes
 * @description Type definitions for speech model
 */

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

export interface TopWord {
  word: string
  total_count: number
  speech_count: number
  avg_per_speech: number
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

export interface DateFilter {
  startDate?: string
  endDate?: string
}

export interface SpeechState {
  // Word cloud data
  wordCloud: WordCloudItem[]
  wordCloudLoading: boolean
  wordCloudError: string | null
  
  // Top words
  topWords: TopWord[]
  topWordsLoading: boolean
  
  // Speeches list
  speeches: SpeechSummary[]
  speechesLoading: boolean
  speechesPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  
  // Statistics
  speechStats: SpeechStats | null
  wordStats: WordStats | null
  statsLoading: boolean
  
  // Date filter
  dateFilter: DateFilter
  availableDateRange: {
    minDate: string | null
    maxDate: string | null
  }
  
  // Selected word for detail view
  selectedWord: string | null
  
  // API connection status
  apiConnected: boolean
}
