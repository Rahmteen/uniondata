// Type definitions for database models

export interface Speech {
  id: number
  title: string
  date: Date | null
  location: string | null
  speech_type: string | null
  transcript: string
  word_count: number
  unique_word_count: number
  source: string | null
  source_url: string | null
  created_at: Date
  updated_at: Date
}

export interface WordStat {
  id: number
  word: string
  frequency: number
  speech_id: number
  created_at: Date
}

export interface WordTotal {
  word: string
  total_count: number
  speech_count: number
  avg_per_speech: number
  first_used: Date | null
  last_used: Date | null
  updated_at: Date
}

export interface WordCloudItem {
  text: string
  value: number
  speechCount?: number
}

export interface SpeechSummary {
  id: number
  title: string
  date: Date | null
  location: string | null
  speech_type: string | null
  word_count: number
}

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface WordTimelinePoint {
  date: Date
  word: string
  frequency: number
  speech_title: string
}

