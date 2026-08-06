import { createStorage } from '@shared/runtime/storage'

const storage = createStorage('math-game-g2:')

export const loadJSON = storage.loadJSON
export const saveJSON = storage.saveJSON
export const removeKey = storage.removeKey
