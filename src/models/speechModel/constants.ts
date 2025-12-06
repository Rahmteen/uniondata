import type { SpeechState } from './types'

/**
 * @name SpeechConstants
 * @description Constants for speech model
 */

export const initialState: SpeechState = {
  // Word cloud data
  wordCloud: [],
  wordCloudLoading: false,
  wordCloudError: null,
  
  // Top words
  topWords: [],
  topWordsLoading: false,
  
  // Speeches list
  speeches: [],
  speechesLoading: false,
  speechesPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  
  // Statistics
  speechStats: null,
  wordStats: null,
  statsLoading: false,
  
  // Date filter
  dateFilter: {
    startDate: undefined,
    endDate: undefined,
  },
  availableDateRange: {
    minDate: null,
    maxDate: null,
  },
  
  // Selected word
  selectedWord: null,
  
  // API status
  apiConnected: false,
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
