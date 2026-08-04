/** 新一局猜数字的谜底 */
export function newSecret(min = 0, max = 19): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

/** 猜测判定：大了 / 小了 / 猜中 */
export type GuessResult = 'low' | 'high' | 'hit'

export function checkGuess(secret: number, guess: number): GuessResult {
  if (guess < secret) return 'low'
  if (guess > secret) return 'high'
  return 'hit'
}

/** 在只差 1 时给出最接近的提示文案 */
export function guessHint(secret: number, guess: number): string {
  const diff = Math.abs(secret - guess)
  if (diff === 1) return '差一点点啦！'
  if (diff <= 3) return '很接近了！'
  if (diff <= 7) return '再近一点！'
  return ''
}
