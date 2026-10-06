import type { LabDef, LabKind, ParamValues } from '@data/schema/lab'
import {
  areaOf,
  factorsOf,
  gcd,
  isPrime,
  lcm,
  primesUpTo,
  shapeFromCode,
  toFixed2,
  type AreaShape,
} from '@/lib/engine/math'
import { compositeMethods, toHectare } from '@/lib/labs/area'
import { PINBOARD_SHAPES, pickCheck } from '@/lib/labs/pinboard'

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

function fmtDecimalPoint(v: number): string {
  if (Number.isInteger(v)) return String(v)
  return v.toFixed(10).replace(/0+$/, '').replace(/\.$/, '')
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

/**
 * 计算各 Lab 的结果与分步过程。
 *
 * `lab` 为可选参数：Lab 数据里的 `units`（真实长度单位 / 每格代表的长度）只有数据层知道，
 * 传入后结果文案才能给出正确单位（例如梯形麦田是「1800 平方米」而不是「1800 格」，
 * 动车组路程是「750 千米」而不是「750 米」）。
 */
export function computeLab(kind: LabKind, p: ParamValues, lab?: LabDef): LabResult {
  switch (kind) {
    case 'stats-table': {
      const boys = [p.a1 ?? 0, p.a2 ?? 0, p.a3 ?? 0, p.a4 ?? 0]
      const girls = [p.b1 ?? 0, p.b2 ?? 0, p.b3 ?? 0, p.b4 ?? 0]
      const totals = boys.map((b, i) => b + girls[i]!)
      const sum = (arr: number[]) => arr.reduce((acc, x) => acc + x, 0)
      const grand = sum(totals)
      return {
        value: grand,
        text: `总计 ${grand} 人（男生 ${sum(boys)}，女生 ${sum(girls)}）`,
        steps: [
          { expr: `一班合计 = ${boys[0]} + ${girls[0]}`, result: `${totals[0]} 人` },
          { expr: `二班合计 = ${boys[1]} + ${girls[1]}`, result: `${totals[1]} 人` },
          { expr: `三班合计 = ${boys[2]} + ${girls[2]}`, result: `${totals[2]} 人` },
          { expr: `四班合计 = ${boys[3]} + ${girls[3]}`, result: `${totals[3]} 人` },
          { expr: `总计 = 各班合计之和`, result: `${grand} 人` },
        ],
        conclusion: `男生一共 ${sum(boys)} 人，女生一共 ${sum(girls)} 人，总计 ${grand} 人。`,
      }
    }
    case 'stats-chart': {
      const names = ['做家务', '做作业', '体育锻炼', '课外阅读', '看电视']
      const self = [p.s1 ?? 0, p.s2 ?? 0, p.s3 ?? 0, p.s4 ?? 0, p.s5 ?? 0]
      const desk = [p.d1 ?? 0, p.d2 ?? 0, p.d3 ?? 0, p.d4 ?? 0, p.d5 ?? 0]
      const maxIdx = self.reduce((mi, v, i) => (v > self[mi]! ? i : mi), 0)
      const maxDIdx = desk.reduce((mi, v, i) => (v > desk[mi]! ? i : mi), 0)
      const selfTotal = self.reduce((a, b) => a + b, 0)
      const deskTotal = desk.reduce((a, b) => a + b, 0)
      return {
        value: Math.max(selfTotal, deskTotal),
        text: `自己 ${fmt(selfTotal)} 时 / 同桌 ${fmt(deskTotal)} 时`,
        steps: [
          { expr: `自己共花时间`, result: `${fmt(selfTotal)} 时` },
          { expr: `同桌共花时间`, result: `${fmt(deskTotal)} 时` },
          { expr: `自己花时间最多的活动`, result: `${names[maxIdx]}（${fmt(self[maxIdx]!)} 时）` },
          { expr: `同桌花时间最多的活动`, result: `${names[maxDIdx]}（${fmt(desk[maxDIdx]!)} 时）` },
        ],
        conclusion: `比较复式条形统计图中两组直条的长短，可以直观看出自己和同桌的时间安排差异。`,
      }
    }
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
      const shape = shapeFromCode(p.shape)
      const a = p.a ?? 0
      const b = p.b ?? 0
      const h = p.h ?? 0
      const s = areaOf(shape, { a, b, h })
      const name = shape === 'parallelogram' ? '平行四边形' : shape === 'triangle' ? '三角形' : '梯形'
      const lengthUnit = lab?.units?.length ?? '格'
      const cellSize = lab?.units?.cellSize
      const realArea = cellSize ? s * cellSize * cellSize : undefined
      /** 每格就是 1 个单位面积时不必再重复「格」 */
      const sameAsCell = cellSize === 1
      const areaText =
        realArea !== undefined && !sameAsCell
          ? `${fmt(s)} 格 = ${fmt(realArea)} 平方${lengthUnit}`
          : `${fmt(s)} 平方${lengthUnit}`
      const sizeStep =
        cellSize === 1
          ? `每格 1 平方${lengthUnit}`
          : `每格 ${fmt(cellSize ?? 0)} ${lengthUnit}`
      const scaleStep: LabStep[] =
        realArea !== undefined && !sameAsCell
          ? [
              {
                expr: `${sizeStep}，${fmt(s)} × ${fmt((cellSize ?? 0) * (cellSize ?? 0))}`,
                result: `${fmt(realArea)} 平方${lengthUnit}`,
              },
            ]
          : []
      const steps: LabStep[] =
        shape === 'parallelogram'
          ? [
              { expr: `数方格（或剪拼）转化成长方形`, result: `长 = 底 ${fmt(a)}，宽 = 高 ${fmt(h)}` },
              { expr: `S = 底 × 高 = ${fmt(a)} × ${fmt(h)}`, result: sameAsCell ? `${fmt(s)} 平方${lengthUnit}` : `${fmt(s)} 格` },
              ...scaleStep,
            ]
          : shape === 'triangle'
            ? [
                { expr: `两个完全一样的三角形拼成平行四边形`, result: `底 ${fmt(a)}，高 ${fmt(h)}` },
                { expr: `S = 底 × 高 ÷ 2 = ${fmt(a)} × ${fmt(h)} ÷ 2`, result: `${fmt(s)} 平方${lengthUnit}` },
              ]
            : [
                { expr: `两个完全一样的梯形拼成平行四边形`, result: `底 = 上底 + 下底 = ${fmt(a + b)}` },
                { expr: `S = (上底 + 下底) × 高 ÷ 2 = (${fmt(a)} + ${fmt(b)}) × ${fmt(h)} ÷ 2`, result: `${fmt(s)} 平方${lengthUnit}` },
              ]
      return {
        value: s,
        text: areaText,
        steps,
        conclusion: `${name}的面积 = ${areaText}`,
      }
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
      const spec = { top: p.top ?? 0, left: p.left ?? 0, right: p.right ?? 0, bottom: p.bottom ?? 0 }
      const methods = compositeMethods(spec)
      const total = methods[0]!.total
      const ha = toHectare(total)
      const steps: LabStep[] = methods.map((m) => ({
        expr:
          m.op === 'add'
            ? `${m.label}：${m.parts.map((part) => fmt(part.area)).join(' + ')}`
            : `${m.label}：${fmt(m.parts[0]!.area)} − ${fmt(m.parts[1]!.area)}`,
        result: `${fmt(m.total)} 平方米`,
      }))
      steps.push({ expr: `换算成公顷（10000 平方米 = 1 公顷）`, result: `${fmt(total)} ÷ 10000 = ${fmt(ha)} 公顷` })
      return {
        value: total,
        text: `${fmt(total)} 平方米 = ${fmt(ha)} 公顷`,
        steps,
        conclusion: `三种割补方法算出的结果相同：${fmt(total)} 平方米 = ${fmt(ha)} 公顷。`,
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
      const baseText = fmtDecimalPoint(base)
      const resultText = fmtDecimalPoint(result)
      return {
        value: result,
        text: resultText,
        steps: [
          { expr: `${baseText} ${divide ? '÷' : '×'} ${factor}`, result: `小数点${dirWord}移动 ${power} 位` },
          { expr: `= ${resultText}`, result: `（位数不够用 0 补足）` },
        ],
        conclusion: `${baseText} ${divide ? '除以' : '乘'} ${factor}，小数点${dirWord}移动 ${power} 位，结果是 ${resultText}。`,
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
      const unit = lab?.units?.length ?? '米'
      const timeUnit = lab?.params.find((x) => x.key === 't')?.unit ?? '分'
      return {
        value: s,
        text: `${fmt(s)} ${unit}`,
        steps: [
          { expr: `路程 = 速度 × 时间`, result: `${fmt(v)} ${unit}/${timeUnit} × ${fmt(t)} ${timeUnit}` },
          { expr: `s = v × t`, result: `${fmt(s)} ${unit}` },
        ],
        conclusion: `速度 ${fmt(v)} ${unit}/${timeUnit}，时间 ${fmt(t)} ${timeUnit}，路程是 ${fmt(s)} ${unit}。`,
      }
    }
    case 'pinboard': {
      // 与组件共用同一份图形与"逐个数钉子"的判定：
      // 原来 compute 里手写了一套 n/b（矩形 n=10、b=4 → 面积 8），
      // 与右边图上数出来的（矩形 5×3：n=16、b=8 → 面积 15）互相矛盾。
      const idx = Math.round(p.shape ?? 0) % PINBOARD_SHAPES.length
      const def = PINBOARD_SHAPES[idx]!
      const r = pickCheck(def.pts)
      return {
        value: r.area,
        text: `${def.name}面积 = ${fmt(r.area)}（格）`,
        steps: [
          {
            expr: `数钉子：边上 n = ${r.n}，内部 b = ${r.b}`,
            result: `边上每段 gcd 求和得 ${r.n}；内部用射线法逐个判定得 ${r.b}`,
          },
          { expr: `S = n ÷ 2 + b − 1`, result: `${r.n} ÷ 2 + ${r.b} − 1 = ${fmt(r.pickArea)}` },
          {
            expr: `再用鞋带公式独立算一次面积`,
            result: `${fmt(r.area)} 格${r.ok ? '，两种算法一致，皮克定理成立' : '，两种算法不一致！'}`,
          },
        ],
        conclusion: `${def.name}：边上有 ${r.n} 枚钉子、内部有 ${r.b} 枚，S = ${r.n} ÷ 2 + ${r.b} − 1 = ${fmt(r.pickArea)}；用鞋带公式算面积也是 ${fmt(r.area)}，两者一致。`,
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
