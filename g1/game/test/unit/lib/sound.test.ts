import { describe, it, expect, beforeEach, vi } from 'vitest'

/** 每用例重置模块，避免模块级 AudioContext/muted 缓存跨用例串扰 */
async function freshSound() {
  vi.resetModules()
  vi.unmock('@/lib/sound')
  return await import('@/lib/sound')
}

/** 记录被调用的振荡器（WebAudio）参数 */
function captureAudio() {
  const calls: Array<{ type: string; freq: number; when: number }> = []
  const ctx = {
    currentTime: 0,
    destination: {},
    createOscillator: () => {
      const osc: any = {
        type: 'sine',
        frequency: { value: 0 },
        connect: vi.fn(),
        start: (when: number) => calls.push({ type: osc.type, freq: osc.frequency.value, when }),
        stop: vi.fn(),
      }
      return osc
    },
    createGain: () => ({
      gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    }),
  }
  const Ctor = class { constructor() { return ctx } } as unknown as typeof AudioContext
  vi.stubGlobal('AudioContext', Ctor)
  vi.stubGlobal('window', { AudioContext: Ctor })
  return calls
}

describe('lib/sound', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('window', undefined)
    globalThis.localStorage.clear()
  })

  it('默认未静音', async () => {
    const { isMuted } = await freshSound()
    expect(isMuted()).toBe(false)
  })

  it('setMuted(true) 后 isMuted 为 true 且播放不发声', async () => {
    const calls = captureAudio()
    const { setMuted, isMuted, playCorrect, playWrong, playClick, playWin } = await freshSound()
    setMuted(true)
    expect(isMuted()).toBe(true)
    playCorrect()
    playWrong()
    playClick()
    playWin()
    expect(calls.length).toBe(0)
  })

  it('静音状态持久化到 localStorage', async () => {
    const { setMuted, isMuted } = await freshSound()
    setMuted(true)
    expect(globalThis.localStorage.getItem('math-game:muted')).toBe('true')
    setMuted(false)
    expect(isMuted()).toBe(false)
  })

  it('playCorrect 播放两个上行音符', async () => {
    const calls = captureAudio()
    const { playCorrect } = await freshSound()
    playCorrect()
    expect(calls.length).toBe(2)
    expect(calls[0].freq).toBeLessThan(calls[1].freq)
  })

  it('playWrong 播放低音', async () => {
    const calls = captureAudio()
    const { playWrong } = await freshSound()
    playWrong()
    expect(calls.length).toBe(1)
    expect(calls[0].freq).toBeLessThan(300)
  })

  it('playWin 播放上行琶音（3+ 音符）', async () => {
    const calls = captureAudio()
    const { playWin } = await freshSound()
    playWin()
    expect(calls.length).toBeGreaterThanOrEqual(3)
    for (let i = 1; i < calls.length; i++) {
      expect(calls[i].freq).toBeGreaterThan(calls[i - 1].freq)
    }
  })

  it('无 AudioContext 环境静默降级', async () => {
    const { playCorrect, playWrong, playClick, playWin } = await freshSound()
    expect(() => {
      playCorrect()
      playWrong()
      playClick()
      playWin()
    }).not.toThrow()
  })

  it('window 存在但无 AudioContext 时静默降级', async () => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('window', {})
    const { playCorrect, playWrong, playClick, playWin } = await freshSound()
    expect(() => {
      playCorrect()
      playWrong()
      playClick()
      playWin()
    }).not.toThrow()
  })

  it('webkitAudioContext 回退可用', async () => {
    const calls = captureAudio()
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('window', {}) // 覆盖 captureAudio 设置的 window
    const { playClick } = await freshSound()
    vi.stubGlobal('window', {
      webkitAudioContext: class { constructor() { return { currentTime: 0, destination: {}, createOscillator: () => { const osc: any = { type: 'sine', frequency: { value: 0 }, connect: vi.fn(), start: (when: number) => calls.push({ type: osc.type, freq: osc.frequency.value, when }), stop: vi.fn() }; return osc }, createGain: () => ({ gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }) } } },
    })
    const { playClick: playClick2 } = await freshSound()
    playClick2()
    expect(calls.length).toBe(1)
  })

  it('AudioContext 构造抛错时静默降级', async () => {
    vi.stubGlobal('AudioContext', class { constructor() { throw new Error('no audio') } })
    vi.stubGlobal('window', { AudioContext: class { constructor() { throw new Error('no audio') } } })
    const { playClick, playCorrect } = await freshSound()
    expect(() => {
      playClick()
      playCorrect()
    }).not.toThrow()
  })

  it('振荡器 start 抛错时静默降级（音调函数内异常）', async () => {
    const calls = captureAudio()
    vi.spyOn(calls, 'push').mockImplementation((v) => {
      throw new Error('osc start failed')
    })
    const { playClick } = await freshSound()
    playClick()
    expect(() => playClick()).not.toThrow()
  })
})
