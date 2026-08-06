import { shuffle } from '../engine/generator'

/** 生成一局找朋友的牌（成对互补，共 8 张） */
export function buildFriendDeck(target: number): number[] {
  const halves = shuffle([1, 2, 3, 4, 5, 6, 7].filter((a) => a < target && target - a !== a))
  const chosen = halves.slice(0, 4)
  const deck: number[] = []
  for (const a of chosen) deck.push(a, target - a)
  return shuffle(deck)
}
