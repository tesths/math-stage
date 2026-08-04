import { shuffle } from '../engine/generator'

export interface MemoryCard {
  id: number
  /** 显示内容 */
  value: string
  /** 配对键（成对卡相同） */
  pair: string
  /** 正反面样式类别 */
  kind: 'num' | 'expr' | 'qty'
}

const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🥕', '🌻', '🐟', '🐸', '🚗', '🎈', '🐤']

/**
 * 生成一局记忆翻牌的牌组（成对出现，洗牌）
 * @param pairCount 对数（3~6）
 * @param max 数量上限（点数版 1~max）
 * @param withExpr 是否用算式↔得数模式
 */
export function buildMemoryDeck(pairCount: number, max = 10, withExpr = false): MemoryCard[] {
  const n = Math.min(6, Math.max(3, pairCount))
  const pool = shuffle([...Array(max).keys()].map((i) => i + 1))
  const deck: MemoryCard[] = []
  for (let i = 0; i < n; i++) {
    const num = pool[i]!
    if (withExpr) {
      const b = 1 + Math.floor(Math.random() * (num - 1))
      const a = num - b
      deck.push(
        { id: i * 2, value: `${a}+${b}`, pair: String(num), kind: 'expr' },
        { id: i * 2 + 1, value: String(num), pair: String(num), kind: 'num' },
      )
    } else {
      deck.push(
        { id: i * 2, value: String(num), pair: String(num), kind: 'num' },
        { id: i * 2 + 1, value: EMOJIS[i % EMOJIS.length]!.repeat(num), pair: String(num), kind: 'qty' },
      )
    }
  }
  return shuffle(deck)
}
