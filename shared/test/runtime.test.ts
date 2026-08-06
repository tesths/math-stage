import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSound } from '../runtime/sound'
import { createStorage } from '../runtime/storage'

function restoreLocalStorage(original: PropertyDescriptor | undefined) {
  if (original) Object.defineProperty(globalThis, 'localStorage', original)
  else delete (globalThis as Record<string, unknown>).localStorage
}

function installLocalStorage() {
  const data = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      clear: () => data.clear(),
      getItem: (key: string) => data.get(key) ?? null,
      removeItem: (key: string) => { data.delete(key) },
      setItem: (key: string, value: string) => { data.set(key, value) },
    },
  })
}

function captureAudio() {
  const calls: Array<{ type: string; freq: number; when: number }> = []
  const ctx = {
    currentTime: 0,
    destination: {},
    createOscillator: () => {
      const osc = {
        type: 'sine' as OscillatorType,
        frequency: { value: 0 },
        connect: vi.fn(),
        start: (when: number) => calls.push({ type: osc.type, freq: osc.frequency.value, when }),
        stop: vi.fn(),
      }
      return osc
    },
    createGain: () => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    }),
  }
  const Ctor = class { constructor() { return ctx } } as unknown as typeof AudioContext
  vi.stubGlobal('AudioContext', Ctor)
  vi.stubGlobal('window', { AudioContext: Ctor })
  return calls
}

describe('runtime/storage', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    installLocalStorage()
  })

  it('uses the configured prefix for JSON reads, writes, and removals', () => {
    const storage = createStorage('math-test:')
    storage.saveJSON('answer', { value: 42 })
    expect(globalThis.localStorage.getItem('math-test:answer')).toBe('{"value":42}')
    expect(storage.loadJSON<{ value: number }>('answer')).toEqual({ value: 42 })
    storage.removeKey('answer')
    expect(storage.loadJSON('answer')).toBeUndefined()
  })

  it('returns undefined for missing, null, corrupt, or unavailable storage values', () => {
    const storage = createStorage('math-test:')
    expect(storage.loadJSON('missing')).toBeUndefined()
    globalThis.localStorage.setItem('math-test:null', 'null')
    globalThis.localStorage.setItem('math-test:bad', 'not-json{{{')
    expect(storage.loadJSON('null')).toBeUndefined()
    expect(storage.loadJSON('bad')).toBeUndefined()

    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get: () => { throw new Error('denied') } })
    expect(storage.loadJSON('bad')).toBeUndefined()
    expect(() => storage.saveJSON('x', 1)).not.toThrow()
    expect(() => storage.removeKey('x')).not.toThrow()
    restoreLocalStorage(original)

    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: undefined })
    expect(storage.loadJSON('missing')).toBeUndefined()
    restoreLocalStorage(original)
  })

  it('silently ignores storage write and remove failures', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => { throw new Error('quota') }),
        removeItem: vi.fn(() => { throw new Error('denied') }),
      },
    })
    const storage = createStorage('math-test:')
    expect(() => storage.saveJSON('x', 1)).not.toThrow()
    expect(() => storage.removeKey('x')).not.toThrow()
    restoreLocalStorage(original)
  })
})

describe('runtime/sound', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('window', undefined)
  })

  it('loads and persists mute state through the provided storage adapter', () => {
    const saveJSON = vi.fn()
    const sound = createSound({ loadJSON: () => true, saveJSON })
    expect(sound.isMuted()).toBe(true)
    sound.setMuted(false)
    expect(sound.isMuted()).toBe(false)
    expect(saveJSON).toHaveBeenCalledWith('muted', false)
  })

  it('plays click, correct, wrong, and win tones through AudioContext', () => {
    const calls = captureAudio()
    const sound = createSound({ loadJSON: () => false, saveJSON: vi.fn() })
    sound.playClick()
    sound.playCorrect()
    sound.playWrong()
    sound.playWin()
    expect(calls.map((c) => c.freq)).toEqual([660, 523.25, 783.99, 196, 523.25, 659.25, 783.99, 1046.5])
    expect(calls[0].type).toBe('triangle')
    expect(calls[3].type).toBe('sawtooth')
  })

  it('does not play while muted and degrades without AudioContext', () => {
    const calls = captureAudio()
    const muted = createSound({ loadJSON: () => true, saveJSON: vi.fn() })
    muted.playWin()
    expect(calls).toHaveLength(0)

    vi.stubGlobal('window', undefined)
    const noWindow = createSound({ loadJSON: () => undefined, saveJSON: vi.fn() })
    expect(noWindow.isMuted()).toBe(false)
    expect(() => noWindow.playCorrect()).not.toThrow()

    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('window', {})
    const noAudio = createSound({ loadJSON: () => false, saveJSON: vi.fn() })
    expect(() => noAudio.playCorrect()).not.toThrow()
  })

  it('supports webkitAudioContext and ignores WebAudio runtime failures', () => {
    const calls: Array<{ type: string; freq: number; when: number }> = []
    vi.stubGlobal('window', {
      webkitAudioContext: class {
        currentTime = 0
        destination = {}
        createOscillator() {
          const osc = {
            type: 'sine' as OscillatorType,
            frequency: { value: 0 },
            connect: vi.fn(),
            start: (when: number) => calls.push({ type: osc.type, freq: osc.frequency.value, when }),
            stop: vi.fn(),
          }
          return osc
        }
        createGain() {
          return { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }
        }
      },
    })
    const sound = createSound({ loadJSON: () => false, saveJSON: vi.fn() })
    sound.playClick()
    expect(calls).toHaveLength(1)

    vi.stubGlobal('window', { AudioContext: class { constructor() { throw new Error('no audio') } } })
    expect(() => createSound({ loadJSON: () => false, saveJSON: vi.fn() }).playClick()).not.toThrow()

    const failingCalls = captureAudio()
    vi.spyOn(failingCalls, 'push').mockImplementation(() => { throw new Error('osc start failed') })
    expect(() => createSound({ loadJSON: () => false, saveJSON: vi.fn() }).playClick()).not.toThrow()
  })
})
