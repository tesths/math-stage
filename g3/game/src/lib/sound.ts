import { createSound } from '@shared/runtime/sound'
import { loadJSON, saveJSON } from '@/lib/storage'

const sound = createSound({ loadJSON, saveJSON })

export const playClick = sound.playClick
export const playCorrect = sound.playCorrect
export const playWrong = sound.playWrong
export const playWin = sound.playWin
export const isMuted = sound.isMuted
export const setMuted = sound.setMuted
