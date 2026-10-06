/**
 * 转盘 / 摸球的纯逻辑。
 *
 * 这里修掉一个真错误：指针角度是**累加**的（每次转过若干整圈），
 * 但早期实现把目标算成「360×圈数 + 扇区中心」这样的**绝对**角度，
 * 结果第二次转动时目标值可能小于当前角度（指针不动甚至倒转）。
 * 正确做法是维护一个累加基准，目标 = 基准 + 整圈 + 扇区中心。
 */

export interface Sector {
  key: string
  label: string
  /** 占整圆的份额（已归一化） */
  frac: number
}

/** 按累计份额把一个 [0,1) 随机数落到某个扇区，并给出该扇区中心份额 */
export function pickSector(r: number, sectors: Sector[]): { key: string; centerFrac: number } {
  let acc = 0
  for (const s of sectors) {
    const next = acc + s.frac
    if (r <= next) return { key: s.key, centerFrac: acc + s.frac / 2 }
    acc = next
  }
  const last = sectors[sectors.length - 1]
  return last ? { key: last.key, centerFrac: 1 - last.frac / 2 } : { key: '', centerFrac: 0 }
}

/** 份额位置（0~1，从 12 点方向顺时针）落在哪个扇区 */
export function sectorKeyAt(sectors: Sector[], frac: number): string {
  const f = ((frac % 1) + 1) % 1
  let acc = 0
  for (const s of sectors) {
    acc += s.frac
    if (f < acc) return s.key
  }
  return sectors[sectors.length - 1]?.key ?? ''
}

/** 下一次转动的目标角度：必然比当前角度大（指针只会向前转） */
export function spinTarget(base: number, centerFrac: number, turns: number): { base: number; target: number } {
  const nextBase = base + 360 * Math.max(1, Math.round(turns))
  return { base: nextBase, target: nextBase + 360 * centerFrac }
}

/** 归一化三个区域的份额（输入不必正好 100） */
export function normalizeFractions(values: number[]): number[] {
  const total = values.reduce((a, b) => a + b, 0)
  if (total <= 0) return values.map(() => 1 / Math.max(1, values.length))
  return values.map((v) => v / total)
}

/** 摸球理论概率 */
export function ballProbability(red: number, yellow: number): { red: number; yellow: number } {
  const total = red + yellow
  if (total <= 0) return { red: 0, yellow: 0 }
  return { red: red / total, yellow: yellow / total }
}

/** 正字计数：5 笔一个「正」 */
export function tallyChars(n: number): string {
  let out = ''
  for (let i = 0; i < Math.floor(n / 5); i++) out += '正'
  const rem = n % 5
  if (rem) out += ['一', '丅', '下', '正'][rem - 1]!
  return out || '—'
}
