import type { LabKind, ParamValues } from '@data/schema/lab'

/** 单元内子主题标签（用于归类显示） */
export const KIND_LABELS: Record<LabKind, string> = {
  groups: '认识乘法 · 几个几',
  'mult-table': '乘法口诀',
  'divide-share': '平均分',
  'divide-group': '每几个一份',
  quotient: '用乘法口诀求商',
  'table-calc': '表内乘除混合计算',
  tangram: '七巧板拼图',
  direction: '辨认方向',
  'place-value': '三位数的组成',
  compare: '三位数比大小',
  abacus: '算盘拨珠',
  'twodigit-add': '两位数加法',
  'twodigit-sub': '两位数减法',
  money: '认识人民币',
  'money-calc': '购物找零',
  remainder: '有余数的除法',
  'remainder-rule': '余数比除数小',
}

/** 把数值格式化为字符串：整数省略小数部分，小数去尾零 */
export function toFixed2(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

/** 数字 1~9 → 中文数字 */
const CN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']

/** 根据两个因数生成乘法口诀（较小的因数在前） */
export function koujue(a: number, b: number): string {
  const x = Math.min(a, b)
  const y = Math.max(a, b)
  const prod = a * b
  if (prod < 10) return `${CN[x]}${CN[y]}得${CN[prod]}`
  if (prod === 10) return `${CN[x]}${CN[y]}一十`
  const tens = Math.floor(prod / 10)
  const ones = prod % 10
  const tensPart = tens === 1 ? '十' : `${CN[tens]}十`
  return `${CN[x]}${CN[y]}${tensPart}${ones > 0 ? CN[ones] : ''}`
}

/** 中文数字（1~9，供口诀/结果展示） */
export function numCn(n: number): string {
  return CN[n] ?? String(n)
}

/** 四个方向（0 东 1 南 2 西 3 北）与相对关系 */
export const DIRECTIONS = ['东', '南', '西', '北'] as const

/** 某方向的对面方向 */
export function oppositeOf(d: number): number {
  return (d + 2) % 4
}

/** 面向 d 时，左手边方向（面向东时左手边是北…按顺时针转向推） */
export function leftOf(d: number): number {
  // 东(0)→北(3)，南(1)→东(0)，西(2)→南(1)，北(3)→西(2) —— 逆时针
  return (d + 3) % 4
}

/** 面向 d 时，右手边方向（顺时针） */
export function rightOf(d: number): number {
  return (d + 1) % 4
}

/** 三位数分解：返回百位/十位/个位 */
export function splitDigits(n: number): [number, number, number] {
  const h = Math.floor(n / 100) % 10
  const t = Math.floor(n / 10) % 10
  const o = n % 10
  return [h, t, o]
}
