import { init, RematchDispatch, RematchRootState } from '@rematch/core'
import persistPlugin from '@rematch/persist'
import selectPlugin from '@rematch/select'
import storage from 'redux-persist/lib/storage'

import { models, RootModel } from '@/models'

const persistConfig = {
  key: 'root',
  storage,
  version: 2, // Bumped to clear old state
  blacklist: ['speechModel'], // Don't persist speechModel - fetch fresh data
  whitelist: ['appModel'],
}

export const store = init<RootModel>({
  models,
  plugins: [selectPlugin(), persistPlugin(persistConfig)],
  redux: {
    devtoolOptions: {
      disabled: import.meta.env.MODE !== 'development',
    },
  },
})

export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>

