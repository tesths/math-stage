/**
 * 因数与倍数、用字母表示数的纯逻辑（供组件与单元测试共用）。
 *
 * 这里放三件必须可被断言的事：
 * 1. 「拼长方形」的每种拼法都要真的用 n 个小正方形铺满（长 × 宽 = n），不能截断成示意块；
 * 2. 埃拉托色尼筛：依次划掉质数 2、3、5、7 的倍数后，剩下的数必须**恰好**是质数；
 * 3. 路程 = 速度 × 时间 要能拆成「t 个 v 相加」，单位要从 速度单位（米/分）里取出路程单位（米）。
 */

export type Pair = [number, number]

/** n 的全部因数对（长 ≤ 宽），按长从小到大 */
export function factorPairs(n: number): Pair[] {
  const v = Math.max(1, Math.round(n))
  const out: Pair[] = []
  for (let i = 1; i * i <= v; i++) {
    if (v % i === 0) out.push([i, v / i])
  }
  return out
}

/** 筛法用到的质数（2、3、5、7 足以筛出 ≤120 的全部质数） */
export const SIEVE_PRIMES = [2, 3, 5, 7] as const

/**
 * 每个合数是被哪个质数划掉的（取最小的那个质因数）。
 * 返回 Map：数 → 划掉它的质数。
 */
export function sieveRemovedBy(n: number): Map<number, number> {
  const removed = new Map<number, number>()
  for (let v = 4; v <= n; v++) {
    for (const p of SIEVE_PRIMES) {
      if (v % p === 0 && v !== p) {
        removed.set(v, p)
        break
      }
    }
  }
  return removed
}

/** 划掉 SIEVE_PRIMES 中前 step 个质数的倍数后，还剩下的数（从 2 开始） */
export function sieveRemaining(n: number, step: number): number[] {
  const removed = new Set<number>()
  for (let i = 0; i < Math.min(step, SIEVE_PRIMES.length); i++) {
    const p = SIEVE_PRIMES[i]!
    for (let m = p * 2; m <= n; m += p) removed.add(m)
  }
  const out: number[] = []
  for (let v = 2; v <= n; v++) if (!removed.has(v)) out.push(v)
  return out
}

/** 该数被哪几轮筛掉的理由标签，例如 12 → ['2 的倍数', '3 的倍数'] */
export function sieveReasons(v: number): number[] {
  return SIEVE_PRIMES.filter((p) => v % p === 0 && v !== p)
}

/* ---------------- 倍数数轴 ---------------- */
/** 数轴刻度：0 到 max 之间每 step 一个（含 max） */
export function axisTicks(max: number, step: number): number[] {
  const out: number[] = []
  for (let v = 0; v <= max; v += step) out.push(v)
  return out
}

/** n 的前 k 个倍数 */
export function multiples(n: number, k: number): number[] {
  return Array.from({ length: Math.max(0, k) }, (_, i) => n * (i + 1))
}

/* ---------------- 路程 ---------------- */
/** 从速度单位里取出路程单位：米/分 → 米，千米/时 → 千米 */
export function distanceUnit(speedUnit: string | undefined): string {
  if (!speedUnit) return '米'
  const [d] = speedUnit.split('/')
  return d && d.length > 0 ? d : '米'
}

/** 从速度单位里取出时间单位：米/分 → 分 */
export function timeUnit(speedUnit: string | undefined, fallback = '分'): string {
  const parts = (speedUnit ?? '').split('/')
  return parts[1] && parts[1].length > 0 ? parts[1] : fallback
}

/**
 * 把「速度 × 时间」展开成 t 段、每段 v 的累加过程。
 * 返回每段的终点点位（v, 2v, 3v…）与总路程，用于画分段轨迹。
 */
export function speedSegments(v: number, t: number, maxSegments = 24): { ends: number[]; total: number; shownSegments: number } {
  const count = Math.max(0, Math.round(t))
  const total = v * count
  const shown = Math.min(count, maxSegments)
  const ends = Array.from({ length: shown }, (_, i) => v * (i + 1))
  return { ends, total, shownSegments: shown }
}

/** 若 t 段太长，按每段长度画到第几段会溢出，返回实际可画段数与每段的像素长度 */
export function segmentLayout(v: number, t: number, trackPx: number): { segPx: number; shownSegments: number; restSegments: number } {
  const count = Math.max(1, Math.round(t))
  const segPx = trackPx / count
  const shown = segPx >= 26 ? count : Math.max(1, Math.floor(trackPx / 26))
  return { segPx: shown === count ? segPx : 26, shownSegments: shown, restSegments: Math.max(0, count - shown) }
}

/* ---------------- 正方形 ---------------- */
/** 固定画框下的格子边长：按「最大边长」定比例，保证图形随 a 单调变化且不溢出 */
export function squareCell(a: number, maxA: number, box: number): number {
  return box / Math.max(1, Math.max(a, maxA))
}

/* ---------------- 青蛙歌 ---------------- */
export function frogCounts(n: number): { mouths: number; eyes: number; legs: number } {
  const v = Math.max(0, Math.round(n))
  return { mouths: v, eyes: 2 * v, legs: 4 * v }
}

/** 青蛙歌的前若干行，用于展示规律表 */
export function frogRows(upTo: number): { n: number; mouths: number; eyes: number; legs: number }[] {
  return Array.from({ length: Math.max(0, upTo) }, (_, i) => ({ n: i + 1, ...frogCounts(i + 1) }))
}
