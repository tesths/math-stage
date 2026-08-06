import type { GameQuestion } from '@data/schema/example'
import { countUnits } from './count'

/** Fisher-Yates 洗牌 */
export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return out
}

/**
 * 生成包含答案的 N 个唯一选项
 */
export function randomOptions(
  answer: number,
  pool: number[],
  count = 4,
): number[] {
  const rest = shuffle(pool.filter((v) => v !== answer)).slice(0, count - 1)
  return shuffle([answer, ...rest])
}

export function isAddSubQuestion(q: GameQuestion): q is GameQuestion & { config: { type: 'addsub' } & Record<string, unknown> } {
  return q.type === 'addsub'
}

function addSubOptions(answer: number, max: number): number[] {
  const lo = Math.max(0, answer - 3)
  const hi = Math.min(max + 2, answer + 3)
  const pool: number[] = []
  for (let i = lo; i <= hi; i++) pool.push(i)
  return randomOptions(answer, pool, 4)
}

/**
 * 随机生成一道 10 以内（或指定范围内）加减法题
 * 加法保证和不超 max；减法保证差非负
 */
export function randomAddSub(max = 9, forcedOp?: '+' | '-'): GameQuestion {
  const op = forcedOp ?? (Math.random() < 0.5 ? '+' : '-')
  let a: number
  let b: number
  let answer: number
  if (op === '+') {
    a = 1 + Math.floor(Math.random() * (max - 1))
    b = 1 + Math.floor(Math.random() * (max - a))
    answer = a + b
  } else {
    a = 2 + Math.floor(Math.random() * (max - 1))
    b = 1 + Math.floor(Math.random() * (a - 1))
    answer = a - b
  }
  return {
    id: `random-addsub-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    chapter: 'c2',
    source: '例题',
    page: 25,
    title: '随机练习',
    prompt: `${a}${op === '+' ? '加' : '减'}${b}等于几？`,
    type: 'addsub',
    config: {
      type: 'addsub',
      a,
      b,
      op,
      answer,
      emoji: '🍎',
      options: addSubOptions(answer, max),
    },
  }
}

/**
 * 随机生成一道计数题
 */
export function randomCount(max = 10, emoji = '🍎'): GameQuestion {
  const answer = 1 + Math.floor(Math.random() * max)
  const pool: number[] = []
  for (let i = 0; i <= max; i++) pool.push(i)
  return {
    id: `random-count-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    chapter: 'c1',
    source: '例题',
    page: 3,
    title: '随机练习',
    prompt: `数一数，一共有几个${emoji}？`,
    type: 'count',
    config: {
      type: 'count',
      emoji: emoji.repeat(answer),
      answer,
      options: randomOptions(answer, pool, 4),
    },
  }
}

/** 供校验器使用的计数（避免数据层依赖引擎） */
export { countUnits }
