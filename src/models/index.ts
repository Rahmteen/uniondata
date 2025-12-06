import { Models } from '@rematch/core'

import { appModel } from './appModel'
import { speechModel } from './speechModel'

export interface RootModel extends Models<RootModel> {
  appModel: typeof appModel
  speechModel: typeof speechModel
}

export const models: RootModel = {
  appModel,
  speechModel,
}
