import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadJSON, saveJSON, removeKey } from '@/lib/storage'

describe('lib/storage', () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.clear()
    }
  })

  it('saveJSON 写入后 loadJSON 可读回同一结构', () => {
    saveJSON('k1', { a: 1, list: [1, 2] })
    expect(loadJSON<{ a: number; list: number[] }>('k1')).toEqual({ a: 1, list: [1, 2] })
  })

  it('loadJSON 读取不存在的 key 返回 undefined', () => {
    expect(loadJSON('no-such-key')).toBeUndefined()
  })

  it('loadJSON 读取损坏 JSON 返回 undefined 且不抛错', () => {
    globalThis.localStorage.setItem('math-game-g4:bad', 'not-json{{{')
    expect(loadJSON('bad')).toBeUndefined()
  })

  it('loadJSON 读取 null 字符串返回 undefined', () => {
    globalThis.localStorage.setItem('math-game-g4:null', 'null')
    expect(loadJSON('null')).toBeUndefined()
  })

  it('removeKey 删除后不可读', () => {
    saveJSON('k2', 1)
    removeKey('k2')
    expect(loadJSON('k2')).toBeUndefined()
  })

  it('无 localStorage 环境下静默降级（不抛错）', () => {
    const original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', { value: undefined, configurable: true })
    expect(() => {
      saveJSON('k3', 1)
      expect(loadJSON('k3')).toBeUndefined()
    }).not.toThrow()
    Object.defineProperty(globalThis, 'localStorage', { value: original, configurable: true })
  })

  it('localStorage 写入抛错时静默降级（如隐私模式）', () => {
    const original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(() => { throw new Error('QuotaExceededError') }),
        removeItem: vi.fn(),
      },
    })
    expect(() => saveJSON('k4', 1)).not.toThrow()
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: original })
  })

  it('读取抛错时静默降级', () => {
    const original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn(() => { throw new Error('boom') }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
    })
    expect(loadJSON('k5')).toBeUndefined()
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: original })
  })

  it('removeKey 抛错时静默降级', () => {
    const original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(() => { throw new Error('boom') }),
      },
    })
    expect(() => removeKey('k6')).not.toThrow()
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: original })
  })

  it('无 localStorage 时 removeKey 静默返回', () => {
    const original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', { value: undefined, configurable: true })
    expect(() => removeKey('k7')).not.toThrow()
    Object.defineProperty(globalThis, 'localStorage', { value: original, configurable: true })
  })

  it('访问 localStorage 本身抛错（getter 抛异常）时全部静默降级', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('denied')
      },
    })
    expect(() => {
      saveJSON('k8', 1)
      expect(loadJSON('k8')).toBeUndefined()
      removeKey('k8')
    }).not.toThrow()
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete (globalThis as Record<string, unknown>).localStorage
  })
})
