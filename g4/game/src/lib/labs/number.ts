/**
 * 多位数认识的纯函数：四舍五入到"万"、四位分级、身份证分段。
 * 抽出来的原因（本轮 L0）：旧组件用 `digitsOf(v)[3]` 取"千位"，
 * 实际取到的是百位 —— 384204 的千位被读成 2、385204 被读成 2，
 * 于是"满 5 进 1"的判定和结果对不上。这类判断必须能单测，不能埋在模板里。
 */

/** v 的千位数字（0–9） */
export function thousandsDigit(v: number): number {
  return Math.floor(Math.abs(Math.round(v)) / 1000) % 10
}

/** 四舍五入到万位 */
export function roundToWan(v: number): { wan: number; digit: number; up: boolean; text: string } {
  const digit = thousandsDigit(v)
  const up = digit >= 5
  const wan = up ? Math.floor(v / 10000) + 1 : Math.floor(v / 10000)
  return {
    wan,
    digit,
    up,
    text: `千位是 ${digit}，${up ? '满 5 向万位进 1' : '不满 5 舍去'} → 约 ${wan} 万`,
  }
}

/** 从右边起每四位一级：返回 [{ name, digits }] */
export function fourDigitGroups(v: number): { name: string; digits: string; start: number; end: number }[] {
  const s = String(Math.abs(Math.round(v)))
  const names = ['个级', '万级', '亿级', '万亿级']
  const out: { name: string; digits: string; start: number; end: number }[] = []
  let end = s.length
  let level = 0
  while (end > 0) {
    const start = Math.max(0, end - 4)
    out.push({ name: names[level] ?? `${level}级`, digits: s.slice(start, end), start, end })
    end = start
    level += 1
  }
  return out
}
