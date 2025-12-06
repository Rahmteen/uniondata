import { createModel } from '@rematch/core'

import type { RootModel } from '@/models/index'
import { initialState } from './constants'
import type {
  SpeechState,
  WordCloudItem,
  TopWord,
  SpeechSummary,
  SpeechStats,
  WordStats,
  DateFilter,
} from './types'
import api from '@/services/api'

export const speechModel = createModel<RootModel>()({
  state: initialState,
  
  reducers: {
    // Word Cloud
    setWordCloud: (state: SpeechState, wordCloud: WordCloudItem[]) => ({
      ...state,
      wordCloud,
      wordCloudLoading: false,
      wordCloudError: null,
    }),
    setWordCloudLoading: (state: SpeechState, loading: boolean) => ({
      ...state,
      wordCloudLoading: loading,
      wordCloudError: loading ? null : state.wordCloudError,
    }),
    setWordCloudError: (state: SpeechState, error: string | null) => ({
      ...state,
      wordCloudError: error,
      wordCloudLoading: false,
    }),
    
    // Top Words
    setTopWords: (state: SpeechState, topWords: TopWord[]) => ({
      ...state,
      topWords,
      topWordsLoading: false,
    }),
    setTopWordsLoading: (state: SpeechState, loading: boolean) => ({
      ...state,
      topWordsLoading: loading,
    }),
    
    // Speeches
    setSpeeches: (
      state: SpeechState,
      payload: {
        speeches: SpeechSummary[]
        pagination: SpeechState['speechesPagination']
      }
    ) => ({
      ...state,
      speeches: payload.speeches,
      speechesPagination: payload.pagination,
      speechesLoading: false,
    }),
    setSpeechesLoading: (state: SpeechState, loading: boolean) => ({
      ...state,
      speechesLoading: loading,
    }),
    
    // Stats
    setSpeechStats: (state: SpeechState, stats: SpeechStats | null) => ({
      ...state,
      speechStats: stats,
    }),
    setWordStats: (state: SpeechState, stats: WordStats | null) => ({
      ...state,
      wordStats: stats,
    }),
    setStatsLoading: (state: SpeechState, loading: boolean) => ({
      ...state,
      statsLoading: loading,
    }),
    
    // Date filter
    setDateFilter: (state: SpeechState, filter: DateFilter) => ({
      ...state,
      dateFilter: filter,
    }),
    setAvailableDateRange: (state: SpeechState, range: { minDate: string | null; maxDate: string | null }) => ({
      ...state,
      availableDateRange: range,
    }),
    clearDateFilter: (state: SpeechState) => ({
      ...state,
      dateFilter: { startDate: undefined, endDate: undefined },
    }),
    
    // Selected word
    setSelectedWord: (state: SpeechState, word: string | null) => ({
      ...state,
      selectedWord: word,
    }),
    
    // API status
    setApiConnected: (state: SpeechState, connected: boolean) => ({
      ...state,
      apiConnected: connected,
    }),
    
    // Reset
    reset: () => initialState,
  },
  
  selectors: (slice) => ({
    selectWordCloud: () => slice((state) => state.wordCloud),
    selectWordCloudLoading: () => slice((state) => state.wordCloudLoading),
    selectWordCloudError: () => slice((state) => state.wordCloudError),
    selectTopWords: () => slice((state) => state.topWords),
    selectSpeeches: () => slice((state) => state.speeches),
    selectSpeechStats: () => slice((state) => state.speechStats),
    selectWordStats: () => slice((state) => state.wordStats),
    selectSelectedWord: () => slice((state) => state.selectedWord),
    selectApiConnected: () => slice((state) => state.apiConnected),
    selectDateFilter: () => slice((state) => state.dateFilter),
    selectAvailableDateRange: () => slice((state) => state.availableDateRange),
    selectIsLoading: () =>
      slice(
        (state) =>
          state.wordCloudLoading || state.topWordsLoading || state.speechesLoading
      ),
  }),
  
  effects: (dispatch) => ({
    /**
     * Check API connection
     */
    async checkApiConnection() {
      try {
        await api.healthCheck()
        dispatch.speechModel.setApiConnected(true)
      } catch {
        dispatch.speechModel.setApiConnected(false)
      }
    },
    
    /**
     * Fetch available date range
     */
    async fetchDateRange() {
      try {
        const data = await api.getDateRange()
        dispatch.speechModel.setAvailableDateRange({
          minDate: data.min_date,
          maxDate: data.max_date,
        })
      } catch (error) {
        console.error('Failed to fetch date range:', error)
      }
    },
    
    /**
     * Fetch word cloud data with date filter
     */
    async fetchWordCloud(payload?: { limit?: number; minCount?: number; dateFilter?: DateFilter }) {
      try {
        dispatch.speechModel.setWordCloudLoading(true)
        const data = await api.getWordCloud(
          payload?.limit, 
          payload?.minCount,
          payload?.dateFilter
        )
        dispatch.speechModel.setWordCloud(data)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch word cloud'
        dispatch.speechModel.setWordCloudError(message)
        console.error('Failed to fetch word cloud:', error)
      }
    },
    
    /**
     * Fetch top words
     */
    async fetchTopWords(limit?: number) {
      try {
        dispatch.speechModel.setTopWordsLoading(true)
        const data = await api.getTopWords(limit)
        dispatch.speechModel.setTopWords(data)
      } catch (error) {
        console.error('Failed to fetch top words:', error)
        dispatch.speechModel.setTopWordsLoading(false)
      }
    },
    
    /**
     * Fetch speeches list
     */
    async fetchSpeeches(payload?: {
      page?: number
      limit?: number
      type?: string
      search?: string
      dateFilter?: DateFilter
    }) {
      try {
        dispatch.speechModel.setSpeechesLoading(true)
        const data = await api.getSpeeches(
          payload?.page,
          payload?.limit,
          payload?.type,
          payload?.search,
          payload?.dateFilter
        )
        dispatch.speechModel.setSpeeches({
          speeches: data.speeches,
          pagination: data.pagination,
        })
      } catch (error) {
        console.error('Failed to fetch speeches:', error)
        dispatch.speechModel.setSpeechesLoading(false)
      }
    },
    
    /**
     * Fetch all statistics with date filter
     */
    async fetchStats(dateFilter?: DateFilter) {
      try {
        dispatch.speechModel.setStatsLoading(true)
        const [speechStats, wordStats] = await Promise.all([
          api.getSpeechStats(dateFilter),
          api.getWordStats(dateFilter),
        ])
        dispatch.speechModel.setSpeechStats(speechStats)
        dispatch.speechModel.setWordStats(wordStats)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        dispatch.speechModel.setStatsLoading(false)
      }
    },
    
    /**
     * Apply date filter and refresh data
     */
    async applyDateFilter(dateFilter: DateFilter, rootState) {
      dispatch.speechModel.setDateFilter(dateFilter)
      
      // Refresh word cloud and stats with new filter
      await Promise.all([
        dispatch.speechModel.fetchWordCloud({ limit: 500, minCount: 1, dateFilter }),
        dispatch.speechModel.fetchStats(dateFilter),
      ])
    },
    
    /**
     * Initialize all data
     */
    async initializeData() {
      await dispatch.speechModel.checkApiConnection()
      await dispatch.speechModel.fetchDateRange()
      await Promise.all([
        dispatch.speechModel.fetchWordCloud({ limit: 500, minCount: 1 }),
        dispatch.speechModel.fetchStats(),
      ])
    },
  }),
})

export type { SpeechState, WordCloudItem, TopWord, SpeechSummary, DateFilter }
