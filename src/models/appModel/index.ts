import { createModel } from '@rematch/core'

import type { RootModel } from '@/models/index'
import { initialState } from './constants'
import type { AppState } from './types'

export const appModel = createModel<RootModel>()({
  state: initialState,
  reducers: {
    setLoading: (state: AppState, loading: boolean) => ({
      ...state,
      loading,
    }),
    setError: (state: AppState, error: string | null) => ({
      ...state,
      error,
      loading: false,
    }),
    setInitialized: (state: AppState, initialized: boolean) => ({
      ...state,
      initialized,
    }),
    reset: () => initialState,
  },
  selectors: (slice) => ({
    selectAppState: () => slice((state) => state),
    selectLoading: () => slice((state) => state.loading),
    selectError: () => slice((state) => state.error),
    selectInitialized: () => slice((state) => state.initialized),
  }),
  effects: (dispatch) => ({
    async initialize() {
      try {
        dispatch.appModel.setLoading(true)
        // Add initialization logic here
        dispatch.appModel.setInitialized(true)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Initialization failed'
        dispatch.appModel.setError(errorMessage)
      } finally {
        dispatch.appModel.setLoading(false)
      }
    },
  }),
})

