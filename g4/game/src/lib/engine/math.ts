import type { LabKind } from '@data/schema/lab'

/** 单元内子主题标签（用于归类显示） */
export const KIND_LABELS: Record<LabKind, string> = {
  'div-oral': '整十数除法口算',
  'div-try': '竖式试商',
  'div-pen': '两、三位数除以两位数',
  'div-route': '两步连除',
  'peri-rect': '长方形的周长',
  'peri-square': '正方形的周长',
  'area-grid': '面积单位量面积',
  'area-rect': '长方形的面积',
  'area-square': '正方形的面积',
  'area-unit': '面积单位换算',
  'peri-area-change': '周长与面积的变化',
  'mul-meaning': '乘法的意义',
  'mul-total': '总价=单价×数量',
  'mul-distance': '路程=速度×时间',
  'mul-solve': '用乘法数量关系解决问题',
  'travel-plan': '旅游费用估算',
  'mix-three': '三步混合运算',
  'mix-bracket': '含括号的混合运算',
  'mix-segment': '线段图分析数量关系',
  'num-count': '计数单位',
  'num-place': '数位顺序表',
  'num-multidigit': '认识多位数',
  'num-approx': '四舍五入求近似数',
  'num-idcode': '数字编码',
  'measure-story': '度量衡',
  'big-mul': '三位数乘两位数',
  'big-calc': '计算器探索规律',
  'big-1yi': '1亿有多大',
}

/** 整数的所有因数（升序） */
export function factorsOf(n: number): number[] {
  const out: number[] = []
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      out.push(i)
      const j = n / i
      if (j !== i) out.push(j)
    }
  }
  return out.sort((x, y) => x - y)
}

/** 整数位数（含前导判断） */
export function digitCount(n: number): number {
  if (n === 0) return 1
  return String(Math.floor(Math.abs(n))).length
}

/** 把数值四舍五入保留到某一位（pos=4 表示万位） */
export function roundTo(value: number, keepPlaces: number): number {
  const unit = 10 ** keepPlaces
  return Math.round(value / unit) * unit
}

/** 把整数拆成位值数组，便于竖式/数位展示 */
export function digitsOf(n: number): number[] {
  return String(Math.floor(Math.abs(n))).split('').map(Number)
}

export function toFixed2(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

/** 格式化大数：加千分位（如 1,560,000） */
export function formatBig(n: number): string {
  return n.toLocaleString('en-US')
}

/** 十进制计数单位序列（个→千亿） */
export const COUNT_UNITS = ['个', '十', '百', '千', '万', '十万', '百万', '千万', '亿', '十亿', '百亿', '千亿'] as const
