/** localStorage JSON adapter with SSR/privacy-mode safe fallback. */
export interface JsonStorage {
  loadJSON<T>(key: string): T | undefined
  saveJSON(key: string, value: unknown): void
  removeKey(key: string): void
}

function getLocalStorage(): Storage | undefined {
  try {
    return typeof globalThis.localStorage === 'undefined' ? undefined : globalThis.localStorage
  } catch {
    return undefined
  }
}

export function createStorage(prefix: string): JsonStorage {
  return {
    loadJSON<T>(key: string): T | undefined {
      const storage = getLocalStorage()
      if (!storage) return undefined
      try {
        const raw = storage.getItem(prefix + key)
        if (raw === null) return undefined
        const parsed = JSON.parse(raw)
        if (parsed === null) return undefined
        return parsed as T
      } catch {
        return undefined
      }
    },

    saveJSON(key: string, value: unknown): void {
      const storage = getLocalStorage()
      if (!storage) return
      try {
        storage.setItem(prefix + key, JSON.stringify(value))
      } catch {
        // Privacy mode or quota errors degrade silently.
      }
    },

    removeKey(key: string): void {
      const storage = getLocalStorage()
      if (!storage) return
      try {
        storage.removeItem(prefix + key)
      } catch {
        // Degrade silently.
      }
    },
  }
}
