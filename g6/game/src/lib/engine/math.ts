import type { LabKind, ParamValues } from '@data/schema/lab'

/** 单元内子主题标签（用于归类显示） */
export const KIND_LABELS: Record<LabKind, string> = {
  'mul-decimal': '一个数乘小数',
  'mul-compare': '积与因数的大小',
  'mul-approx': '积的近似值',
  'div-decimal': '一个数除以小数',
  'div-approx': '商的近似值',
  'round-life': '进一法/去尾法',
  'frac-mix': '分数四则混合运算',
  'estimate-shop': '估算购物',
  segment: '求一个数的几分之几',
  'segment-more': '比一个数多/少几分之几',
  'work-together': '工程问题',
  piecewise: '分段计费',
  'place-value': '数位与计数单位',
  'compare-unit': '数的大小比较',
  'op-consistency': '运算意义的一致性',
  binary: '二进制的秘密',
  'ratio-intro': '比的认识',
  'ratio-value': '比值与形状',
  'ratio-simplify': '化简比',
  'ratio-distribute': '按比例分配',
  'proportion-basic': '比例的基本性质',
  'solve-proportion': '解比例',
  'golden-ratio': '神奇的黄金比',
  'circle-feature': '认识圆',
  sector: '扇形与圆心角',
  circumference: '圆的周长',
  'circle-area': '圆的面积',
  annulus: '环形面积',
  'circle-composite': '组合图形的面积',
  'scale-shape': '图形的放大与缩小',
  'map-scale': '比例尺',
  coordinate: '数对',
  direction: '方向与距离',
  // 练习题 Lab（练习一…练习十四）
  'ex-c1-div11-cycle': '除以 11 的循环小数',
  'ex-c1-pgram-area': '平行四边形面积估算',
  'ex-c2-overlap-club': '重叠问题（容斥）',
  'ex-c2-egg-crate': '连筐称重逆推',
  'ex-c3-div-to-mul': '除法转化成乘法',
  'ex-c3-frac-split': '分数单位拆分',
  'ex-c4-cube-ratio': '棱长比·面积比·体积比',
  'ex-c4-football-ratio': '按比分黑白皮',
  'ex-c5-wheel-roll': '车轮滚动的路程',
  'ex-c5-circle-packing': '长方形纸剪圆片',
  'ex-c6-scale-area': '放大缩小的面积倍数',
  'ex-c6-two-maps': '两种比例尺对比',
  'ex-c7-route-path': '数对画出行走路线',
  'ex-c7-observer-point': '两个观测点找家',
}

/** 把数值格式化为字符串：整数省略小数部分，小数去尾零 */
export function toFixed2(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

/** 保留指定位数小数的字符串（四舍五入） */
export function toFixedN(v: number, digits: number): string {
  const s = v.toFixed(digits)
  if (digits <= 0) return s
  return s
}

/** 最大公因数 */
export function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b]
  return a
}

/** 化简整数比，返回 [前项, 后项] */
export function simplifyRatio(a: number, b: number): [number, number] {
  const g = gcd(a, b)
  return [a / g, b / g]
}

/** 十进制 → 二进制（正整数），返回 0/1 字符串 */
export function toBinary(n: number): string {
  if (n <= 0) return '0'
  let out = ''
  let v = n
  while (v > 0) {
    out = (v % 2) + out
    v = Math.floor(v / 2)
  }
  return out
}

/** 二进制 → 十进制（校验/展示用） */
export function fromBinary(bin: string): number {
  return bin.split('').reduce((acc, ch) => acc * 2 + Number(ch), 0)
}

/** 保留 N 位小数的四舍五入近似值 */
export function roundTo(v: number, digits: number): number {
  const f = 10 ** digits
  return Math.round(v * f) / f
}

/** 判定一个数是否为有限小数（用于进制/近似值展示） */
export function isTerminatingDecimal(v: number): boolean {
  const s = String(v)
  return !/\.\d*9$|\.\d*0$/.test(s) && s.length < 14
}
