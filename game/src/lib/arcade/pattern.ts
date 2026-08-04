import { randomOptions, shuffle } from '../engine/generator'

export interface PatternRound {
  /** 完整序列（含答案） */
  sequence: (number | string)[]
  /** 空缺位置 */
  blankIndex: number
  answer: number | string
  options: (number | string)[]
  kind: 'num' | 'emoji'
}

const EMOJI_SET: [string, string][] = [
  ['🍎', '🍊'],
  ['🐟', '🐸'],
  ['🌼', '🍃'],
  ['🚗', '🚲'],
]

/** 生成一局找规律 */
export function newPatternRound(round: number): PatternRound {
  const kind: PatternRound['kind'] = round % 2 === 1 ? 'num' : 'emoji'
  const len = 5
  if (kind === 'num') {
    const start = 1 + Math.floor(Math.random() * 3)
    const step = 1 + Math.floor(Math.random() * 2)
    const sequence: number[] = []
    for (let i = 0; i < len; i++) sequence.push(start + i * step)
    const blank = Math.floor(Math.random() * len)
    const pool: number[] = []
    for (let i = Math.max(0, start - 2); i <= start + len * step + 2; i++) pool.push(i)
    return {
      sequence,
      blankIndex: blank,
      answer: sequence[blank]!,
      options: randomOptions(sequence[blank]!, pool, 4),
      kind,
    }
  }
  const [a, b] = shuffle(EMOJI_SET)[0]!
  const sequence: string[] = []
  for (let i = 0; i < len; i++) sequence.push(i % 2 === 0 ? a : b)
  const blank = Math.floor(Math.random() * len)
  return {
    kind,
    sequence,
    blankIndex: blank,
    answer: sequence[blank]!,
    options: shuffle([...new Set([a, b])]),
  }
}