import type { LabKind, ParamValues } from '@data/schema/lab'
import {
  areaOf,
  factorsOf,
  gcd,
  isPrime,
  lcm,
  primesUpTo,
  toFixed2,
  type AreaShape,
} from '@/lib/engine/math'

export interface LabStep {
  expr: string
  result: string
}

export interface LabResult {
  /** 主结果（数字） */
  value: number
  /** 结果文本（带单位） */
  text: string
  /** 分步计算过程 */
  steps: LabStep[]
  /** 结论语 */
  conclusion: string
}

function fmt(v: number): string {
  return toFixed2(Math.round(v * 100000) / 100000)
}

/** 把小数按位拆分展示（如 6.25 → 整数6 + 十分位2 + 百分位5） */
function mulSteps(price: number, count: number): LabStep[] {
  const total = price * count
  return [
    { expr: `${fmt(price)} × ${count}`, result: `表示 ${count} 个 ${fmt(price)} 相加` },
    { expr: `${fmt(price * 100)} × ${count}`, result: `先把小数 ×100 变成整数` },
    { expr: `${fmt(price * 100 * count)} ÷ 100`, result: `积再 ÷100，得到 ${fmt(total)}` },
    { expr: `${fmt(price)} × ${count} = ${fmt(total)}`, result: `总价 ${fmt(total)} 元` },
  ]
}

function divSteps(total: number, count: number): LabStep[] {
  const unit = total / count
  return [
    { expr: `${fmt(total)} ÷ ${count}`, result: `把总价平均分成 ${count} 份` },
    { expr: `商的小数点与被除数对齐`, result: `每位 ${fmt(unit)} 元` },
    { expr: `${fmt(total)} ÷ ${count} = ${fmt(unit)}`, result: `单价 ${fmt(unit)} 元` },
  ]
}

export function computeLab(kind: LabKind, p: ParamValues): LabResult {
  switch (kind) {
    case 'translate': {
      const dirs = ['右', '下', '左', '上']
      const g = p.grid ?? 0
      const d = dirs[Math.round(p.dir ?? 0) % 4]!
      return {
        value: g,
        text: `向${d}平移 ${g} 格`,
        steps: [
          { expr: `方向：${d}`, result: `${d === '右' || d === '左' ? '水平' : '竖直'}方向平移` },
          { expr: `对应点 A → A′ 的距离`, result: `${g} 格` },
        ],
        conclusion: `平移前后，图形的形状和大小不变，对应点之间的距离都是 ${g} 格。`,
      }
    }
    case 'rotate': {
      const a = p.angle ?? 0
      const d = Math.round(p.dir ?? 0) === 0 ? '顺时针' : '逆时针'
      return {
        value: a,
        text: `${d}旋转 ${a}°`,
        steps: [
          { expr: `旋转中心`, result: `绕点 O（或 A）` },
          { expr: `旋转方向：${d}`, result: `${d}旋转 ${a}°` },
        ],
        conclusion: `旋转前后，图形的形状和大小不变，只是位置（方向）变了。`,
      }
    }
    case 'axis': {
      const s = Math.round(p.sym ?? 1)
      const pos = ['左', '中间', '右'][s]!
      return {
        value: s,
        text: `对称轴在${pos}`,
        steps: [
          { expr: `沿对称轴对折`, result: `左右两边完全重合` },
          { expr: `对应点到对称轴的距离`, result: `相等` },
        ],
        conclusion: `轴对称图形沿对称轴对折，两边完全重合；对应点到对称轴的距离相等。`,
      }
    }
    case 'area': {
      const shape = (p.shape as AreaShape) ?? 'parallelogram'
      const a = p.a ?? 0
      const b = p.b ?? 0
      const h = p.h ?? 0
      const s = areaOf(shape, { a, b, h })
      const name = shape === 'parallelogram' ? '平行四边形' : shape === 'triangle' ? '三角形' : '梯形'
      const steps: LabStep[] =
        shape === 'parallelogram'
          ? [
              { expr: `转化成长方形`, result: `长 = 底 ${fmt(a)}，宽 = 高 ${fmt(h)}` },
              { expr: `S = 底 × 高 = ${fmt(a)} × ${fmt(h)}`, result: `${fmt(s)}` },
            ]
          : shape === 'triangle'
            ? [
                { expr: `两个完全一样的三角形拼成平行四边形`, result: `底 ${fmt(a)}，高 ${fmt(h)}` },
                { expr: `S = 底 × 高 ÷ 2 = ${fmt(a)} × ${fmt(h)} ÷ 2`, result: `${fmt(s)}` },
              ]
            : [
                { expr: `两个完全一样的梯形拼成平行四边形`, result: `底 = 上底 + 下底 = ${fmt(a + b)}` },
                { expr: `S = (上底 + 下底) × 高 ÷ 2 = (${fmt(a)} + ${fmt(b)}) × ${fmt(h)} ÷ 2`, result: `${fmt(s)}` },
              ]
      return { value: s, text: `${fmt(s)} 平方${p.unit ? '米' : '格'}`, steps, conclusion: `${name}的面积 = ${fmt(s)}` }
    }
    case 'hectare': {
      const side = p.side ?? 0
      const m2 = side * side
      const ha = m2 / 10000
      const km2 = m2 / 1_000_000
      return {
        value: m2,
        text: `${fmt(m2)} 平方米`,
        steps: [
          { expr: `边长 ${fmt(side)} 米的正方形面积`, result: `${fmt(side)} × ${fmt(side)} = ${fmt(m2)} 平方米` },
          { expr: `1 公顷 = 10000 平方米`, result: `${fmt(m2)} 平方米 = ${fmt(ha)} 公顷` },
          { expr: `1 平方千米 = 1000000 平方米`, result: `${fmt(m2)} 平方米 = ${fmt(km2)} 平方千米` },
        ],
        conclusion: side === 100 ? '边长 100 米的正方形土地面积正好是 1 公顷。' : `面积是 ${fmt(m2)} 平方米 = ${fmt(ha)} 公顷。`,
      }
    }
    case 'composite': {
      const w = p.w ?? 0
      const h1 = p.h1 ?? 0
      const h2 = p.h2 ?? 0
      const sRect = w * h1
      const sTrap = ((w + w / 2) * h2) / 2
      const total = sRect + sTrap
      return {
        value: total,
        text: `${fmt(total)} 平方米`,
        steps: [
          { expr: `S长方形 = 长 × 宽 = ${fmt(w)} × ${fmt(h1)}`, result: `${fmt(sRect)} 平方米` },
          { expr: `S梯形 = (上底 + 下底) × 高 ÷ 2`, result: `${fmt(sTrap)} 平方米` },
          { expr: `S组合 = S长方形 + S梯形`, result: `${fmt(total)} 平方米` },
        ],
        conclusion: `分割成简单图形，分别求面积再相加：${fmt(total)} 平方米。`,
      }
    }
    case 'decimal-mul': {
      const price = p.price ?? 0
      const count = p.count ?? 0
      const total = price * count
      return { value: total, text: `${fmt(total)} 元`, steps: mulSteps(price, count), conclusion: `买 ${count} 支（个）共 ${fmt(total)} 元。` }
    }
    case 'decimal-div': {
      const total = p.total ?? 0
      const count = p.count ?? 0
      const unit = total / count
      return { value: unit, text: `${fmt(unit)} 元`, steps: divSteps(total, count), conclusion: `平均每个 ${fmt(unit)} 元。` }
    }
    case 'decimal-point': {
      const power = Math.round(p.power ?? 0)
      const base = p.base ?? 0.001
      const divide = (p.divide ?? 0) === 1
      const factor = 10 ** power
      const result = divide ? base / factor : base * factor
      const dirWord = divide ? '向左' : '向右'
      return {
        value: result,
        text: fmt(result),
        steps: [
          { expr: `${fmt(base)} ${divide ? '÷' : '×'} ${factor}`, result: `小数点${dirWord}移动 ${power} 位` },
          { expr: `= ${fmt(result)}`, result: `（位数不够用 0 补足）` },
        ],
        conclusion: `${fmt(base)} ${divide ? '除以' : '乘'} ${factor}，小数点${dirWord}移动 ${power} 位，结果是 ${fmt(result)}。`,
      }
    }
    case 'spinner': {
      const red = p.red ?? 0
      const blue = p.blue ?? 0
      const yellow = p.yellow ?? 0
      const biggest = Math.max(red, blue, yellow)
      const names = red === biggest ? '红' : blue === biggest ? '蓝' : '黄'
      return {
        value: biggest,
        text: `${names}色区域最大`,
        steps: [
          { expr: `红色 ${fmt(red)}%`, result: `蓝色 ${fmt(blue)}%` },
          { expr: `黄色 ${fmt(yellow)}%`, result: `合计 ${fmt(red + blue + yellow)}%` },
        ],
        conclusion: `${names}色区域占的面积最大，指针停在${names}色区域的可能性最大。`,
      }
    }
    case 'marble': {
      const red = p.red ?? 0
      const yellow = p.yellow ?? 0
      const total = red + yellow
      const pr = (red / total) * 100
      return {
        value: pr,
        text: `红球可能性 ${fmt(pr)}%`,
        steps: [
          { expr: `球的总数`, result: `${fmt(total)} 个（红 ${fmt(red)} + 黄 ${fmt(yellow)}）` },
          { expr: `摸到红球的可能性`, result: `${fmt(red)} ÷ ${fmt(total)} = ${fmt(pr)}%` },
        ],
        conclusion: red > yellow ? '红球多，摸到红球的可能性大。' : red < yellow ? '黄球多，摸到黄球的可能性大。' : '两种球一样多，摸到它们的可能性相等。',
      }
    }
    case 'factors': {
      const n = p.n ?? 0
      const fs = factorsOf(n)
      return {
        value: fs.length,
        text: `${fs.length} 个因数`,
        steps: [{ expr: `${fmt(n)} 的因数`, result: fs.join('、') }],
        conclusion: `${fmt(n)} 的因数有 ${fs.length} 个：${fs.join('、')}。`,
      }
    }
    case 'multiples': {
      const n = p.n ?? 0
      const k = p.k ?? 0
      const ms = Array.from({ length: k }, (_, i) => n * (i + 1))
      return {
        value: ms[ms.length - 1]!,
        text: `前 ${k} 个倍数是 ${ms[0]}…${ms[ms.length - 1]}`,
        steps: [{ expr: `${fmt(n)} 的倍数`, result: ms.join('、') }],
        conclusion: `${fmt(n)} 的倍数有无数个，最小的是 ${fmt(n)} 本身。`,
      }
    }
    case 'prime': {
      const n = p.n ?? 0
      const ps = primesUpTo(n)
      return {
        value: ps.length,
        text: `2~${fmt(n)} 内有 ${ps.length} 个质数`,
        steps: [{ expr: `2~${fmt(n)} 的质数`, result: ps.join('、') }],
        conclusion: `最小的质数是 2；1 既不是质数也不是合数。`,
      }
    }
    case 'gcdlcm': {
      const a = p.a ?? 0
      const b = p.b ?? 0
      const g = gcd(a, b)
      const l = lcm(a, b)
      return {
        value: g,
        text: `最大公因数 ${g}，最小公倍数 ${l}`,
        steps: [
          { expr: `${fmt(a)} 和 ${fmt(b)} 的公因数`, result: factorsOf(a).filter((x) => factorsOf(b).includes(x)).join('、') },
          { expr: `最大公因数`, result: fmt(g) },
          { expr: `最小公倍数 = a × b ÷ 最大公因数`, result: `${fmt(a)} × ${fmt(b)} ÷ ${fmt(g)} = ${fmt(l)}` },
        ],
        conclusion: `${fmt(a)} 和 ${fmt(b)} 的最大公因数是 ${fmt(g)}，最小公倍数是 ${fmt(l)}。`,
      }
    }
    case 'frog': {
      const n = p.n ?? 0
      return {
        value: n * 4,
        text: `${n} 只青蛙：${n} 张嘴，${2 * n} 只眼睛，${4 * n} 条腿`,
        steps: [
          { expr: `嘴`, result: `${fmt(n)}` },
          { expr: `眼睛 = 2 × n`, result: `${fmt(2 * n)}` },
          { expr: `腿 = 4 × n`, result: `${fmt(4 * n)}` },
        ],
        conclusion: `用字母 n 表示只数：嘴 n 张、眼睛 2n 只、腿 4n 条。`,
      }
    }
    case 'square': {
      const a = p.a ?? 0
      return {
        value: a * a,
        text: `周长 ${4 * a} 厘米，面积 ${a * a} 平方厘米`,
        steps: [
          { expr: `周长 C = 4a = 4 × ${fmt(a)}`, result: `${fmt(4 * a)} 厘米` },
          { expr: `面积 S = a × a = ${fmt(a)} × ${fmt(a)}`, result: `${fmt(a * a)} 平方厘米` },
        ],
        conclusion: `边长 ${fmt(a)} 厘米的正方形，周长 ${4 * a} 厘米，面积 ${a * a} 平方厘米。`,
      }
    }
    case 'speed': {
      const v = p.v ?? 0
      const t = p.t ?? 0
      const s = v * t
      return {
        value: s,
        text: `${fmt(s)} ${p.unit ?? '米'}`,
        steps: [
          { expr: `路程 = 速度 × 时间`, result: `${fmt(v)} × ${fmt(t)}` },
          { expr: `s = v × t`, result: `${fmt(s)} ${p.unit ?? '米'}` },
        ],
        conclusion: `速度 ${fmt(v)}，时间 ${fmt(t)}，路程是 ${fmt(s)} ${p.unit ?? '米'}。`,
      }
    }
    case 'pinboard': {
      const shape = Math.round(p.shape ?? 0)
      const defs: { n: number; b: number; name: string }[] = [
        { n: 10, b: 4, name: '矩形' },
        { n: 8, b: 3, name: '三角形' },
        { n: 12, b: 4, name: 'L 形' },
        { n: 12, b: 5, name: '五边形' },
        { n: 10, b: 2, name: '凹四边形' },
      ]
      const d = defs[shape]!
      const s = d.n / 2 + d.b - 1
      return {
        value: s,
        text: `${d.name}面积 = ${fmt(s)}（格）`,
        steps: [
          { expr: `边上钉子数 n = ${d.n}`, result: `内部钉子数 b = ${d.b}` },
          { expr: `S = n ÷ 2 + b - 1`, result: `${d.n} ÷ 2 + ${d.b} - 1 = ${fmt(s)}` },
        ],
        conclusion: `${d.name}：边上有 ${d.n} 枚钉子、内部有 ${d.b} 枚，面积 ${fmt(s)} 格（皮克定理）。`,
      }
    }
    case 'views3d': {
      const view = Math.round(p.view ?? 0)
      const views = ['前面', '右面', '上面']
      return {
        value: view,
        text: `从${views[view]}看`,
        steps: [
          { expr: `观察方向`, result: `${views[view]}` },
          { expr: `看到的图形`, result: `由正方体在${views[view]}方向的投影轮廓决定` },
        ],
        conclusion: `从不同方向看同一个物体，看到的图形可能不同；从${views[view]}看到的是该方向的投影。`,
      }
    }
  }
}

/** 是否有质数判断（prime kind 专用展示） */
export function isPrimeNum(n: number): boolean {
  return isPrime(n)
}
