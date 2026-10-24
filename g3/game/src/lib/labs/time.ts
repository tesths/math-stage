/**
 * 三年级「一天的时间」的纯函数内核：钟面角度与 24 时 / 12 时读数映射。
 *
 * 抽出来的理由：24 时记时法的关键不是"减去 12"这句话，而是**同一根指针**
 * 在内圈读 8 时、在外圈读 20 时——两个读数必须由同一角度推出来，
 * 才能在图上画出"20 时就是晚上 8 时"的对应关系。角度、映射、读法都可断言。
 */

export interface HandAngles {
  /** 时针角度（12 点方向为 0°，顺时针） */
  hour: number
  /** 分针角度 */
  minute: number
}

/**
 * 指针角度：分针 1 分钟走 6°；时针 1 小时走 30°，
 * 而且**随分钟连续移动**（8 时 30 分时短针在 8 与 9 之间），
 * 这样"时针在钟面转两圈 = 一天"才成立。
 */
export function handAngles(hour24: number, minute: number): HandAngles {
  const h = ((hour24 % 24) + 24) % 24
  const m = Math.max(0, Math.min(59, Math.round(minute)))
  return { hour: ((h % 12) + m / 60) * 30, minute: m * 6 }
}

/** 12 时记时法的读数（1~12） */
export function hour12Of(hour24: number): number {
  const h = ((hour24 % 24) + 24) % 24
  return h % 12 === 0 ? 12 : h % 12
}

/** 24 时记时法的读数（0~23），同时把越界的数字规整回一天之内 */
export function hour24Of(hour24: number): number {
  return ((Math.round(hour24) % 24) + 24) % 24
}

/**
 * 12 时记时法 → 24 时记时法：下午/晚上要 +12，上午保持不变。
 * （20 时 = 晚上 8 时，反过来 8 时(下午) + 12 = 20 时）
 */
export function hour24From12(hour12: number, afternoon: boolean): number {
  const h = ((Math.round(hour12) % 12) + 12) % 12
  return afternoon ? (h === 0 ? 12 : h + 12) : h
}

/** 24 时制读数是否落在"下午/晚上"这半圈（13~23 时） */
export function isAfternoon(hour24: number): boolean {
  const h = hour24Of(hour24)
  return h >= 13
}

/**
 * 内外两圈刻度：内圈 1~12，外圈 13~24，同一角度上的一对就是同一时刻的两种读法。
 * 12 点方向的一对是"12 时 / 24 时（也就是 0 时）"。
 */
export interface DialPair {
  index: number
  inner: number
  outer: number
  angle: number
}

export function dialPairs(): DialPair[] {
  return Array.from({ length: 12 }, (_, i) => ({
    index: i,
    inner: i + 1,
    outer: i + 13,
    // 12 点方向（内圈 12 / 外圈 24）的角度是 0°，不是 360°
    angle: ((i + 1) % 12) * 30,
  }))
}

/** 当前时刻在刻度环上的小序号（0 = 12 点方向） */
export function dialIndex(hour24: number): number {
  return hour24Of(hour24) % 12
}

/**
 * 「时针走一圈」：再走 12 小时回到同一个 12 时读数，24 时读数却前进 12。
 * 返回新的 24 时读数，便于组件做一步过程态。
 */
export function walkOneTurn(hour24: number): number {
  return (hour24Of(hour24) + 12) % 24
}

/** 12 时记时法的时段词（课本：凌晨 / 上午 / 中午 / 下午 / 晚上） */
export function periodOf(hour24: number): string {
  const h = hour24Of(hour24)
  if (h === 0 || h === 24) return '晚上'
  if (h < 6) return '凌晨'
  if (h < 12) return '上午'
  if (h === 12) return '中午'
  return h < 18 ? '下午' : '晚上'
}
