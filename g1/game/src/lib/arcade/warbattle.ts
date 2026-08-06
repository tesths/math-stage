export interface BattleRound {
  player: number[]
  cpu: number[]
  playerSum: number
  cpuSum: number
}

/** 发一轮牌：玩家与电脑各两张 1~9 */
export function dealRound(): BattleRound {
  const cards = (): number[] => [1 + Math.floor(Math.random() * 9), 1 + Math.floor(Math.random() * 9)]
  const p = cards()
  const c = cards()
  return { player: p, cpu: c, playerSum: p[0]! + p[1]!, cpuSum: c[0]! + c[1]! }
}

export type BattleWinner = 'player' | 'cpu' | 'tie'

export function roundWinner(r: BattleRound): BattleWinner {
  if (r.playerSum > r.cpuSum) return 'player'
  if (r.cpuSum > r.playerSum) return 'cpu'
  return 'tie'
}