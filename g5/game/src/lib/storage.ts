import { createStorage } from '@shared/runtime/storage'

const storage = createStorage('math-game-g5:')

export const loadJSON = storage.loadJSON
export const saveJSON = storage.saveJSON
export const removeKey = storage.removeKey
