/** 持久化存储（localStorage 安全封装，SSR/隐私模式静默降级） */
const PREFIX = 'math-game-g4:'

function hasStorage(): boolean {
  try {
    return typeof globalThis.localStorage !== 'undefined'
  } catch {
    return false
  }
}

export function loadJSON<T>(key: string): T | undefined {
  if (!hasStorage()) return undefined
  try {
    const raw = globalThis.localStorage.getItem(PREFIX + key)
    if (raw === null) return undefined
    const parsed = JSON.parse(raw)
    if (parsed === null) return undefined
    return parsed as T
  } catch {
    return undefined
  }
}

export function saveJSON(key: string, value: unknown): void {
  if (!hasStorage()) return
  try {
    globalThis.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // 隐私模式/配额满时静默降级
  }
}

export function removeKey(key: string): void {
  if (!hasStorage()) return
  try {
    globalThis.localStorage.removeItem(PREFIX + key)
  } catch {
    // 静默降级
  }
}