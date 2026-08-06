interface SoundStorage {
  loadJSON<T>(key: string): T | undefined
  saveJSON(key: string, value: unknown): void
}

interface Tone {
  freq: number
  start: number
  dur: number
  type?: OscillatorType
  gain?: number
}

export interface SoundPlayer {
  playClick(): void
  playCorrect(): void
  playWrong(): void
  playWin(): void
  isMuted(): boolean
  setMuted(v: boolean): void
}

const MUTE_KEY = 'muted'

export function createSound(storage: SoundStorage): SoundPlayer {
  let ctx: AudioContext | null = null
  let muted = storage.loadJSON<boolean>(MUTE_KEY) ?? false

  function getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    if (!ctx) {
      try {
        ctx = new Ctor()
      } catch {
        return null
      }
    }
    return ctx
  }

  function tone(c: AudioContext, t: Tone): void {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = t.type ?? 'sine'
    osc.frequency.value = t.freq
    g.gain.setValueAtTime(0, c.currentTime + t.start)
    g.gain.exponentialRampToValueAtTime(t.gain ?? 0.18, c.currentTime + t.start + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t.start + t.dur)
    osc.connect(g)
    g.connect(c.destination)
    osc.start(c.currentTime + t.start)
    osc.stop(c.currentTime + t.start + t.dur + 0.02)
  }

  function play(tones: Tone[]): void {
    if (muted) return
    const c = getCtx()
    if (!c) return
    try {
      for (const t of tones) tone(c, t)
    } catch {
      // WebAudio can fail under browser autoplay/device restrictions; ignore audio only.
    }
  }

  return {
    playClick(): void {
      play([{ freq: 660, start: 0, dur: 0.08, type: 'triangle', gain: 0.1 }])
    },

    playCorrect(): void {
      play([
        { freq: 523.25, start: 0, dur: 0.12 },
        { freq: 783.99, start: 0.11, dur: 0.18 },
      ])
    },

    playWrong(): void {
      play([{ freq: 196, start: 0, dur: 0.22, type: 'sawtooth', gain: 0.1 }])
    },

    playWin(): void {
      play([
        { freq: 523.25, start: 0, dur: 0.14 },
        { freq: 659.25, start: 0.12, dur: 0.14 },
        { freq: 783.99, start: 0.24, dur: 0.14 },
        { freq: 1046.5, start: 0.36, dur: 0.3 },
      ])
    },

    isMuted(): boolean {
      return muted
    },

    setMuted(v: boolean): void {
      muted = v
      storage.saveJSON(MUTE_KEY, v)
    },
  }
}
