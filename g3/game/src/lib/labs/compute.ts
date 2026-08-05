import type { LabKind, ParamValues } from '@data/schema/lab'
import {
  applyOp,
  LENGTH_MM,
  LENGTH_UNITS,
  OP_SYMBOL,
  splitDigits2,
  splitDigits3,
  time12Text,
  timesOf,
  toFixed2,
  type MixOp,
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

/** 一位数乘法竖式的进位过程（按位返回步骤） */
function mulSteps(
  digits: number[],
  multi: number,
): { steps: LabStep[]; product: number } {
  const n = digits.length
  const parts: { digit: number; value: number }[] = []
  let carry = 0
  for (let i = n - 1; i >= 0; i--) {
    const prod = digits[i]! * multi + carry
    const digit = prod % 10
    parts.push({ digit, value: digit * 10 ** (n - 1 - i) })
    carry = Math.floor(prod / 10)
  }
  if (carry > 0) parts.push({ digit: carry, value: carry * 10 ** n })
  const product = parts.reduce((acc, p) => acc + p.value, 0)
  const stepStrs = parts.map((p, i) => ({
    expr: `第 ${i + 1} 位相乘得 ${fmt(p.digit)}${p.value >= 10 ? `（${fmt(p.value)}）` : ''}`,
    result: `这一位写 ${fmt(p.digit)}`,
  }))
  return { steps: stepStrs, product }
}

/** 除法竖式过程（整除与有余数） */
function divSteps(total: number, div: number): { steps: LabStep[]; q: number; r: number } {
  const digits = String(total).split('').map(Number)
  const steps: LabStep[] = []
  let remainder = 0
  let q = 0
  let pos = 0
  for (const d of digits) {
    const cur = remainder * 10 + d
    const digitQ = Math.floor(cur / div)
    const rest = cur % div
    q = q * 10 + digitQ
    const place = digits.length - 1 - pos
    steps.push({
      expr: `除到${place === 0 ? '个位' : place === 1 ? '十位' : '百位'}：${cur} ÷ ${div}`,
      result: `商 ${fmt(digitQ)}，余 ${fmt(rest)}`,
    })
    remainder = rest
    pos++
  }
  return { steps, q, r: remainder }
}

export function computeLab(kind: LabKind, p: ParamValues): LabResult {
  switch (kind) {
    /* ============ 一 混合运算与数量关系（一） ============ */
    case 'mix-calc': {
      const isDivAdd = p.box !== undefined
      if (isDivAdd) {
        const box = p.box ?? 0
        const each = p.each ?? 1
        const stapler = p.stapler ?? 0
        const pen = box / each
        const total = pen + stapler
        return {
          value: total,
          text: `钢笔 ${fmt(pen)} 元 + 订书机 ${fmt(stapler)} 元 = ${fmt(total)} 元`,
          steps: [
            { expr: `先算除法：${fmt(box)} ÷ ${fmt(each)}`, result: `1 支钢笔 ${fmt(pen)} 元` },
            { expr: `再算加法：${fmt(pen)} + ${fmt(stapler)}`, result: `${fmt(total)} 元` },
            { expr: `综合算式：${fmt(box)} ÷ ${fmt(each)} + ${fmt(stapler)}`, result: `${fmt(total)} 元` },
          ],
          conclusion: `算式中有除法和加法，先算除法再算加法，应付 ${fmt(total)} 元。`,
        }
      }
      const price = p.price ?? 0
      const count = p.count ?? 1
      const bag = p.bag ?? 0
      const notes = price * count
      const total = notes + bag
      return {
        value: total,
        text: `笔记本 ${fmt(notes)} 元 + 书包 ${fmt(bag)} 元 = ${fmt(total)} 元`,
        steps: [
          { expr: `先算乘法：${fmt(price)} × ${fmt(count)}`, result: `3 本笔记本 ${fmt(notes)} 元` },
          { expr: `再算加法：${fmt(notes)} + ${fmt(bag)}`, result: `${fmt(total)} 元` },
          { expr: `综合算式：${fmt(price)} × ${fmt(count)} + ${fmt(bag)}`, result: `${fmt(total)} 元` },
        ],
        conclusion: `算式中有乘法和加法，先算乘法再算加法，一共要付 ${fmt(total)} 元。`,
      }
    }
    case 'bracket': {
      const isOrder = p.a !== undefined && p.b !== undefined
      if (isOrder) {
        const a = p.a ?? 0
        const b = p.b ?? 0
        const c = p.c ?? 0
        const noBracket = a + b * c
        const withBracket = (a + b) * c
        return {
          value: withBracket - noBracket,
          text: `a + b × c = ${fmt(noBracket)}，（a + b）× c = ${fmt(withBracket)}`,
          steps: [
            { expr: `不加括号：${fmt(a)} + ${fmt(b)} × ${fmt(c)}`, result: `先算乘法 = ${fmt(noBracket)}` },
            { expr: `加括号：（${fmt(a)} + ${fmt(b)}）× ${fmt(c)}`, result: `先算括号 = ${fmt(withBracket)}` },
            { expr: `两次结果相差`, result: `${fmt(Math.abs(withBracket - noBracket))}` },
          ],
          conclusion: `小括号能改变运算顺序，先算括号里面的，结果可能完全不同。`,
        }
      }
      const money = p.money ?? 0
      const bag = p.bag ?? 0
      const notebook = p.notebook ?? 1
      const left = money - bag
      const count = Math.floor(left / notebook)
      return {
        value: count,
        text: `（${fmt(money)} − ${fmt(bag)}）÷ ${fmt(notebook)} = ${fmt(count)} 本`,
        steps: [
          { expr: `先求买书包后剩的钱`, result: `${fmt(money)} − ${fmt(bag)} = ${fmt(left)} 元` },
          { expr: `再求能买几本`, result: `${fmt(left)} ÷ ${fmt(notebook)} = ${fmt(count)} 本` },
          { expr: `综合算式必须加括号`, result: `（${fmt(money)} − ${fmt(bag)}）÷ ${fmt(notebook)}` },
        ],
        conclusion: `要先算减法，综合算式要添上小括号：（${fmt(money)} − ${fmt(bag)}）÷ ${fmt(notebook)} = ${fmt(count)} 本。`,
      }
    }

    /* ============ 一天的时间 ============ */
    case 'time24': {
      const hour = Math.round(p.hour ?? 0)
      const min = Math.round(p.min ?? 0)
      const t = time12Text(hour)
      const mm = min === 0 ? '' : `${fmt(min)} 分`
      return {
        value: hour,
        text: `${fmt(hour)}:${String(min).padStart(2, '0')} = ${t.period}${fmt(t.display)} 时${mm}`,
        steps: [
          { expr: `时针在钟面转动 2 圈`, result: `一天有 24 小时` },
          { expr: `24 时制 ${fmt(hour)} 时`, result: `${t.period}${fmt(t.display)} 时${mm}` },
        ],
        conclusion: hour < 12 ? `0~12 时是上午时段，${fmt(hour)} 时就是${t.period}${fmt(t.display)} 时。` : `13~24 时是下午/晚上时段，${fmt(hour)} 时减去 12，就是${t.period}${fmt(t.display)} 时。`,
      }
    }
    case 'elapsed': {
      const start = Math.round(p.start ?? 9)
      const end = Math.round(p.end ?? 17)
      const elapsed = end - start
      return {
        value: elapsed,
        text: `${fmt(start)}:00 ~ ${fmt(end)}:00，经过 ${fmt(elapsed)} 时`,
        steps: [
          { expr: `在钟面上拨一拨、数一数`, result: `从 ${fmt(start)} 时到 ${fmt(end)} 时` },
          { expr: `结束 − 开始`, result: `${fmt(end)} − ${fmt(start)} = ${fmt(elapsed)} 时` },
        ],
        conclusion: `经过时间 = 结束时刻 − 开始时刻 = ${fmt(end)} − ${fmt(start)} = ${fmt(elapsed)} 时。`,
      }
    }

    /* ============ 二 两、三位数乘一位数 ============ */
    case 'mul-oral': {
      const base = p.base ?? 40
      const count = p.count ?? 3
      const product = base * count
      const isEstimate = p.money !== undefined
      if (isEstimate) {
        const price = p.price ?? p.base ?? 40
        const money = p.money ?? 0
        const rounded = Math.round(price / 10) * 10
        const est = rounded * count
        const enough = est <= money
        return {
          value: est,
          text: `${rounded} × ${count} = ${est}，${enough ? '够买' : '不够'}`,
          steps: [
            { expr: `把 ${fmt(price)} 看作整十数`, result: `${fmt(rounded)}` },
            { expr: `${fmt(rounded)} × ${fmt(count)} = ${fmt(est)}`, result: `${fmt(est)} 元` },
            { expr: `带的钱 ${fmt(money)} 元`, result: `${enough ? '够买' : '不够买'}（${fmt(price)} × ${fmt(count)} ${enough ? '≤' : '>'} ${fmt(money)}）` },
          ],
          conclusion: `估算时把单价看作接近的整十数：${fmt(price)} ≈ ${fmt(rounded)}，${fmt(rounded)} × ${fmt(count)} = ${fmt(est)}，所以${enough ? '够买' : '不够买'}。`,
        }
      }
      const places = base >= 100 ? '百' : base >= 10 ? '十' : '一'
      const digit = base >= 100 ? base / 100 : base >= 10 ? base / 10 : base
      return {
        value: product,
        text: `${fmt(base)} × ${fmt(count)} = ${fmt(product)}`,
        steps: [
          { expr: `${fmt(digit)} 个${places} × ${fmt(count)}`, result: `${fmt(digit * count)} 个${places}` },
          { expr: `${fmt(digit)} × ${fmt(count)}`, result: `${fmt(digit * count)}` },
          { expr: `末尾添上 0`, result: `${fmt(base)} × ${fmt(count)} = ${fmt(product)}` },
        ],
        conclusion: `${fmt(base)} 表示 ${fmt(digit)} 个${places}，${fmt(digit)} 个${places}乘 ${fmt(count)} 得 ${fmt(digit * count)} 个${places}，就是 ${fmt(product)}。`,
      }
    }
    case 'mul-pen': {
      const multi = Math.round(p.multi ?? 3)
      const hasTens = p.tens !== undefined
      const digits = hasTens ? [p.tens ?? 1, p.ones ?? 0] : [p.h ?? 1, p.t ?? 0, p.o ?? 0]
      const num = digits.reduce((acc, d) => acc * 10 + d, 0)
      const { steps, product } = mulSteps(digits, multi)
      return {
        value: product,
        text: `${fmt(num)} × ${fmt(multi)} = ${fmt(product)}`,
        steps: [
          { expr: `用一位数依次乘各数位`, result: digits.map((d) => `${fmt(d)} × ${fmt(multi)}`).join('，') },
          ...steps,
          { expr: `最后结果`, result: `${fmt(num)} × ${fmt(multi)} = ${fmt(product)}` },
        ],
        conclusion: `笔算 ${fmt(num)} × ${fmt(multi)}：从个位乘起，满几十向前一位进几，结果是 ${fmt(product)}。`,
      }
    }
    case 'mul-zero': {
      const multi = Math.round(p.multi ?? 4)
      const num = (p.h ?? 1) * 100 + (p.o ?? 2)
      const product = num * multi
      return {
        value: product,
        text: `${fmt(num)} × ${fmt(multi)} = ${fmt(product)}`,
        steps: [
          { expr: `十位是 0：0 × ${fmt(multi)}`, result: `= 0，积的十位写 0` },
          { expr: `先算 ${fmt(p.h ?? 1)} × ${fmt(multi)} = ${fmt((p.h ?? 1) * multi)}`, result: `再算个位 ${fmt(p.o ?? 0)} × ${fmt(multi)} = ${fmt((p.o ?? 0) * multi)}` },
          { expr: `${fmt(num)} × ${fmt(multi)}`, result: `${fmt(product)}` },
        ],
        conclusion: `中间有 0 的乘法：0 乘任何数都得 0，积的十位直接写 0，再继续乘其他数位，结果是 ${fmt(product)}。`,
      }
    }

    /* ============ 曹冲称象的故事 ============ */
    case 'weight': {
      const value = p.value ?? 3
      const unitIdx = Math.round(p.unit ?? 0)
      const grams = value * 1000
      const table: [string, string][] =
        unitIdx === 0
          ? [['千克', `${value} 千克 = ${fmt(grams)} 克`], ['吨', `${fmt(value / 1000)} 吨`]]
          : unitIdx === 1
            ? [['克', `${fmt(grams)} 克`], ['吨', `${fmt(value / 1000)} 吨`]]
            : [['克', `${fmt(grams)} 克`], ['千克', `${fmt(value)} 千克`]]
      return {
        value: grams,
        text: `${value} 千克 = ${fmt(grams)} 克`,
        steps: [
          { expr: `1 千克 = 1000 克`, result: `${fmt(value)} 千克 = ${fmt(grams)} 克` },
          { expr: `1 吨 = 1000 千克`, result: `${fmt(value)} 千克 = ${fmt(value / 1000)} 吨` },
          ...table.map(([k, v]) => ({ expr: k, result: v })),
        ],
        conclusion: `相邻质量单位的进率都是 1000：${value} 千克 = ${fmt(grams)} 克 = ${fmt(value / 1000)} 吨。`,
      }
    }
    case 'equivalent': {
      const stones = Math.round(p.stones ?? 5)
      const each = p.each ?? 40
      const total = stones * each
      return {
        value: total,
        text: `${fmt(stones)} 块 × ${fmt(each)} 千克 = ${fmt(total)} 千克`,
        steps: [
          { expr: `称出每块石头的质量`, result: `每块 ${fmt(each)} 千克` },
          { expr: `石头质量相加`, result: `${Array.from({ length: stones }, () => fmt(each)).join(' + ')} = ${fmt(total)} 千克` },
          { expr: `大象质量 = 石头总质量`, result: `大象约 ${fmt(total)} 千克` },
        ],
        conclusion: `小船下沉到相同位置，说明石头的总质量等于大象的质量：${fmt(stones)} × ${fmt(each)} = ${fmt(total)} 千克。`,
      }
    }

    /* ============ 三 数据的收集与整理 ============ */
    case 'tally': {
      const counts = [p.apple ?? 0, p.orange ?? 0, p.banana ?? 0, p.grape ?? 0]
      const names = ['苹果', '橘子', '香蕉', '葡萄']
      const total = counts.reduce((a, b) => a + b, 0)
      const maxIdx = counts.reduce((mi, v, i) => (v > counts[mi]! ? i : mi), 0)
      return {
        value: total,
        text: `一共调查 ${fmt(total)} 人，最喜欢${names[maxIdx]}的人最多`,
        steps: counts.map((c, i) => ({
          expr: `${names[i]}：${fmt(c)} 人`,
          result: `${'正'.repeat(Math.floor(c / 5))}${'一'.repeat(c % 5)}`,
        })),
        conclusion: `一个"正"字表示 5 人。最喜欢${names[maxIdx]}的人最多（${fmt(counts[maxIdx]!)} 人），一共 ${fmt(total)} 人。`,
      }
    }
    case 'stat': {
      const counts = [p.campus ?? 0, p.animal ?? 0, p.scifi ?? 0, p.detective ?? 0]
      const names = ['校园童话', '动物童话', '科幻童话', '侦探童话']
      const total = counts.reduce((a, b) => a + b, 0)
      const maxIdx = counts.reduce((mi, v, i) => (v > counts[mi]! ? i : mi), 0)
      const minIdx = counts.reduce((mi, v, i) => (v < counts[mi]! ? i : mi), 0)
      return {
        value: total,
        text: `合计 ${fmt(total)} 人，最多${names[maxIdx]}，最少${names[minIdx]}`,
        steps: counts.map((c, i) => ({
          expr: `${names[i]}`,
          result: `${fmt(c)} 人`,
        })),
        conclusion: `合计 ${fmt(total)} 人。最喜欢${names[maxIdx]}的最多（${fmt(counts[maxIdx]!)} 人），${names[minIdx]}最少（${fmt(counts[minIdx]!)} 人）。`,
      }
    }

    /* ============ 四 毫米、分米和千米 ============ */
    case 'length-convert': {
      // m-cm: m, cm, to(0=毫米 1=分米)
      if (p.m !== undefined && p.cm !== undefined) {
        const m = p.m ?? 1
        const cm = p.cm ?? 90
        const totalMm = (m * 100 + cm) * 10
        const to = Math.round(p.to ?? 1)
        const dm = Math.round(totalMm / 100)
        return {
          value: to === 1 ? dm : totalMm,
          text: `${fmt(m)} 米 ${fmt(cm)} 厘米 = ${fmt(to === 1 ? dm : totalMm)} ${to === 1 ? '分米' : '毫米'}`,
          steps: [
            { expr: `1 米 = 10 分米 = 100 厘米`, result: `${fmt(m)} 米 = ${fmt(m * 10)} 分米` },
            { expr: `${fmt(cm)} 厘米是几个分米`, result: `${fmt(cm)} 厘米 = ${fmt(Math.round(cm / 10))} 分米` },
            { expr: `合起来`, result: `${fmt(m * 10)} + ${fmt(Math.round(cm / 10))} = ${fmt(dm)} 分米` },
          ],
          conclusion: `${fmt(m)} 米 ${fmt(cm)} 厘米 = ${fmt(dm)} 分米 = ${fmt(totalMm)} 毫米。`,
        }
      }
      if (p.cm !== undefined && p.mm !== undefined && p.to !== undefined) {
        const cm = p.cm ?? 18
        const mm = p.mm ?? 6
        const to = Math.round(p.to ?? 0)
        const totalMm = cm * 10 + mm
        return {
          value: totalMm,
          text: `${fmt(cm)} 厘米 ${fmt(mm)} 毫米 = ${fmt(to === 0 ? totalMm : Math.round(totalMm / 10))} ${to === 0 ? '毫米' : '厘米'}`,
          steps: [
            { expr: `1 厘米 = 10 毫米`, result: `${fmt(cm)} 厘米 = ${fmt(cm * 10)} 毫米` },
            { expr: `加上 ${fmt(mm)} 毫米`, result: `${fmt(cm * 10)} + ${fmt(mm)} = ${fmt(totalMm)} 毫米` },
            { expr: `换算成厘米`, result: `${fmt(totalMm)} 毫米 = ${fmt(Math.round(totalMm / 10))} 厘米 ${fmt(totalMm % 10)} 毫米` },
          ],
          conclusion: `${fmt(cm)} 厘米 ${fmt(mm)} 毫米 = ${fmt(totalMm)} 毫米 = ${fmt(Math.floor(totalMm / 10))} 厘米 ${fmt(totalMm % 10)} 毫米。`,
        }
      }
      if (p.to !== undefined && p.value !== undefined && p.from === undefined) {
        // km-m: value, to(0=米 1=千米)
        const value = p.value ?? 3
        const to = Math.round(p.to ?? 0)
        const meters = value * 1000
        return {
          value: to === 1 ? value : meters,
          text: `${fmt(value)} 千米 = ${fmt(meters)} 米`,
          steps: [
            { expr: `1 千米 = 1000 米`, result: `10 个 100 米是 1000 米` },
            { expr: `${fmt(value)} 千米`, result: `${fmt(value)} × 1000 = ${fmt(meters)} 米` },
          ],
          conclusion: `${fmt(value)} 千米 = ${fmt(meters)} 米。计量较长的路程用千米作单位。`,
        }
      }
      // length-mix: value, from(0-4), to(0-4)
      const value = p.value ?? 45
      const from = Math.round(p.from ?? 0)
      const to = Math.round(p.to ?? 0)
      const fromUnit = LENGTH_UNITS[from]!
      const toUnit = LENGTH_UNITS[to]!
      const mmValue = value * LENGTH_MM[fromUnit]
      const result = mmValue / LENGTH_MM[toUnit]
      const ok = Number.isInteger(result)
      return {
        value: result,
        text: `${fmt(value)} ${fromUnit} = ${fmt(result)} ${toUnit}${ok ? '' : '（不是整数）'}`,
        steps: [
          { expr: `${fromUnit} → 毫米`, result: `${fmt(value)} ${fromUnit} = ${fmt(mmValue)} 毫米` },
          { expr: `毫米 → ${toUnit}`, result: `${fmt(mmValue)} 毫米 = ${fmt(result)} ${toUnit}` },
        ],
        conclusion: `长度单位进率：1 千米 = 1000 米，1 米 = 10 分米 = 100 厘米 = 1000 毫米。${fmt(value)} ${fromUnit} = ${fmt(result)} ${toUnit}。`,
      }
    }

    /* ============ 五 平移、旋转和轴对称 ============ */
    case 'translate': {
      const dirs = ['右', '左', '上', '下']
      const dir = Math.round(p.dir ?? 0) % 4
      const steps = Math.round(p.steps ?? 4)
      return {
        value: steps,
        text: `向${dirs[dir]}平移 ${fmt(steps)} 格`,
        steps: [
          { expr: `运动方向`, result: `向${dirs[dir]}（直线运动）` },
          { expr: `对应点移动距离`, result: `${fmt(steps)} 格` },
        ],
        conclusion: `平移时物体沿直线运动，形状和大小不变，只改变位置。向${dirs[dir]}平移 ${fmt(steps)} 格。`,
      }
    }
    case 'rotate': {
      const dir = Math.round(p.dir ?? 0) === 0 ? '顺时针' : '逆时针'
      const angle = Math.round(p.angle ?? 90)
      return {
        value: angle,
        text: `${dir}旋转 ${fmt(angle)}°`,
        steps: [
          { expr: `旋转方向`, result: `${dir}（与时针转动的方向${dir === '顺时针' ? '相同' : '相反'}）` },
          { expr: `旋转角度`, result: `${fmt(angle)}°` },
        ],
        conclusion: `${dir}旋转 ${fmt(angle)}°，旋转时图形形状和大小不变，只是方向（位置）变了。`,
      }
    }
    case 'axis': {
      const shapes = [
        { name: '松树', line: '竖直方向对称', shape: 0 },
        { name: '心形', line: '竖直方向对称', shape: 1 },
        { name: '蝴蝶', line: '竖直方向对称', shape: 2 },
        { name: '五角星', line: '多条对称轴', shape: 3 },
        { name: '汉字"日"', line: '横竖两条对称轴', shape: 4 },
      ]
      const sel = Math.round(p.shape ?? 0) % shapes.length
      const d = shapes[sel]!
      return {
        value: sel,
        text: `${d.name}：沿${d.line}对折能完全重合`,
        steps: [
          { expr: `沿折痕对折`, result: `${d.line}` },
          { expr: `折痕两边`, result: `能完全重合` },
        ],
        conclusion: `${d.name}是轴对称图形，沿${d.line}对折，两边能完全重合。`,
      }
    }

    /* ============ 六 两、三位数除以一位数 ============ */
    case 'div-oral': {
      const base = p.base ?? 600
      const div = Math.round(p.div ?? 2)
      const quotient = base / div
      const places = base >= 100 ? '百' : base >= 10 ? '十' : '一'
      const digit = base >= 100 ? base / 100 : base >= 10 ? base / 10 : base
      return {
        value: quotient,
        text: `${fmt(base)} ÷ ${fmt(div)} = ${fmt(quotient)}`,
        steps: [
          { expr: `${fmt(digit)} 个${places}平均分成 ${fmt(div)} 份`, result: `每份 ${fmt(digit / div)} 个${places}` },
          { expr: `${fmt(digit)} ÷ ${fmt(div)}`, result: `${fmt(digit / div)}` },
          { expr: `末尾添上 0`, result: `${fmt(base)} ÷ ${fmt(div)} = ${fmt(quotient)}` },
        ],
        conclusion: `${fmt(base)} 表示 ${fmt(digit)} 个${places}，${fmt(digit)} 个${places}除以 ${fmt(div)} 得 ${fmt(digit / div)} 个${places}，就是 ${fmt(quotient)}。`,
      }
    }
    case 'div-pen': {
      const div = Math.round(p.div ?? 3)
      const num = p.tens !== undefined ? (p.tens ?? 4) * 10 + (p.ones ?? 2) : (p.h ?? 5) * 100 + (p.t ?? 3) * 10 + (p.o ?? 2)
      const { steps, q, r } = divSteps(num, div)
      return {
        value: q,
        text: r === 0 ? `${fmt(num)} ÷ ${fmt(div)} = ${fmt(q)}` : `${fmt(num)} ÷ ${fmt(div)} = ${fmt(q)} …… ${fmt(r)}`,
        steps,
        conclusion: `从被除数的最高位除起，一位不够看两位。${fmt(num)} ÷ ${fmt(div)}${r === 0 ? ` = ${fmt(q)}` : ` = ${fmt(q)} 余 ${fmt(r)}`}。`,
      }
    }
    case 'remainder': {
      const total = Math.round(p.total ?? 90)
      const div = Math.round(p.div ?? 4)
      const q = Math.floor(total / div)
      const r = total % div
      return {
        value: q,
        text: `${fmt(total)} ÷ ${fmt(div)} = ${fmt(q)} …… ${fmt(r)}`,
        steps: [
          { expr: `${fmt(total)} 里最多有几个 ${fmt(div)}`, result: `${fmt(q)} 个` },
          { expr: `剩下`, result: `${fmt(total)} − ${fmt(q * div)} = ${fmt(r)}` },
          { expr: `验算：商 × 除数 + 余数`, result: `${fmt(q)} × ${fmt(div)} + ${fmt(r)} = ${fmt(q * div + r)}` },
        ],
        conclusion: `${fmt(total)} ÷ ${fmt(div)} = ${fmt(q)} …… ${fmt(r)}，余数 ${fmt(r)} 比除数 ${fmt(div)} 小。`,
      }
    }
    case 'div-zero': {
      const div = Math.round(p.div ?? 3)
      const num = (p.h ?? 3) * 100 + (p.o ?? 6)
      const q = num / div
      const mid = Math.floor(((num / div) % 100) / 10)
      return {
        value: q,
        text: `${fmt(num)} ÷ ${fmt(div)} = ${fmt(q)}`,
        steps: [
          { expr: `百位：${fmt(p.h ?? 3)} ÷ ${fmt(div)}`, result: `商 ${fmt((p.h ?? 3) / div)}` },
          { expr: `十位是 0：0 ÷ ${fmt(div)}`, result: `= 0，商中间写 0` },
          { expr: `个位：${fmt(p.o ?? 6)} ÷ ${fmt(div)}`, result: `${fmt(q)}` },
        ],
        conclusion: `商的十位是 ${fmt(mid)}：十位上的 0 除以 ${fmt(div)} 得 0，商中间要写 0 占位。${fmt(num)} ÷ ${fmt(div)} = ${fmt(q)}。`,
      }
    }

    /* ============ 间隔排列 ============ */
    case 'interval': {
      const count = Math.round(p.count ?? 6)
      const end = Math.round(p.end ?? 0)
      // end: 0=两端都是□ 1=两端都是○ 2=两端不同
      const other = end === 2 ? count : count - 1
      const endText = ['两端都是□', '两端都是○', '两端各一个'][end]
      return {
        value: other,
        text: `${endText}时：□ ${fmt(count)} 个，○ ${fmt(other)} 个`,
        steps: [
          { expr: `一组一组圈一圈`, result: `□○ | □○ | …` },
          { expr: `两端相同`, result: `□比○多 1 个（${fmt(count)} − ${fmt(other)} = 1）` },
          { expr: `两端不同`, result: `两种物体数量相等` },
        ],
        conclusion: `间隔排列的两种物体：两端相同时差 1 个，两端不同时数量相等。`,
      }
    }

    /* ============ 七 数量关系的分析（一） ============ */
    case 'segment': {
      const isTotal = p.total !== undefined && p.part1 !== undefined && p.part2 !== undefined
      if (isTotal) {
        const total = p.total ?? 300
        const part1 = p.part1 ?? 120
        const part2 = p.part2 ?? 160
        const sum = part1 + part2
        const left = total - sum
        return {
          value: left,
          text: `${fmt(total)} − ${fmt(part1)} − ${fmt(part2)} = ${fmt(left)} 箱`,
          steps: [
            { expr: `先求运走的总箱数`, result: `${fmt(part1)} + ${fmt(part2)} = ${fmt(sum)} 箱` },
            { expr: `剩下的 = 总数 − 运走的和`, result: `${fmt(total)} − ${fmt(sum)} = ${fmt(left)} 箱` },
          ],
          conclusion: `从条件想起：先求运走的和 ${fmt(sum)} 箱，再求剩下 ${fmt(left)} 箱。`,
        }
      }
      const isRows = p.per !== undefined && p.more !== undefined && p.total !== undefined
      if (isRows) {
        const total = p.total ?? 144
        const per = p.per ?? 6
        const more = p.more ?? 2
        const later = per + more
        const rows = Math.ceil(total / later)
        return {
          value: rows,
          text: `${fmt(total)} ÷ (${fmt(per)} + ${fmt(more)}) = ${fmt(rows)} 行`,
          steps: [
            { expr: `后来每行人数`, result: `${fmt(per)} + ${fmt(more)} = ${fmt(later)} 人` },
            { expr: `从问题想起：总人数 ÷ 后来每行`, result: `${fmt(total)} ÷ ${fmt(later)} = ${fmt(rows)} 行` },
          ],
          conclusion: `变换队形后总人数不变。后来每行 ${fmt(later)} 人，一共排 ${fmt(rows)} 行。`,
        }
      }
      const isTimesWord = p.times !== undefined && p.less !== undefined
      if (isTimesWord) {
        const base = p.base ?? 39
        const times = Math.round(p.times ?? 2)
        const less = p.less ?? 13
        const four = base * times
        const five = four - less
        return {
          value: five,
          text: `${fmt(base)} × ${fmt(times)} − ${fmt(less)} = ${fmt(five)} 幅`,
          steps: [
            { expr: `先求四年级作品`, result: `${fmt(base)} × ${fmt(times)} = ${fmt(four)} 幅` },
            { expr: `再求五年级作品`, result: `${fmt(four)} − ${fmt(less)} = ${fmt(five)} 幅` },
          ],
          conclusion: `从条件想起：先求四年级作品 ${fmt(four)} 幅，五年级比四年级少 ${fmt(less)} 幅，是 ${fmt(five)} 幅。`,
        }
      }
      const base = p.base ?? 25
      const more1 = p.more1 ?? 15
      const more2 = p.more2 ?? 20
      const pv = base + more1
      const fv = pv + more2
      return {
        value: fv,
        text: `排球 ${fmt(pv)} 个，足球 ${fmt(fv)} 个`,
        steps: [
          { expr: `排球 = 篮球 + 多`, result: `${fmt(base)} + ${fmt(more1)} = ${fmt(pv)} 个` },
          { expr: `足球 = 排球 + 多`, result: `${fmt(pv)} + ${fmt(more2)} = ${fmt(fv)} 个` },
        ],
        conclusion: `求比一个数多几的数用加法：排球 ${fmt(pv)} 个，足球 ${fmt(fv)} 个。`,
      }
    }

    /* ============ 八 观察物体（二） ============ */
    case 'views': {
      const shapes = [
        { name: '6 个摆成长方体（1 行 6 个）', front: '6 个方格一排', right: '1 个方格', top: '6 个方格一排' },
        { name: '6 个摆成长方体（2 行 3 个）', front: '3 个方格', right: '2 个方格', top: '3 × 2 方格' },
        { name: '4 个摆成"L"形', front: '2 个方格', right: '3 个方格', top: '2 × 2 缺 1 格' },
        { name: '4 个摆成"田"形', front: '2 个方格', right: '2 个方格', top: '2 × 2 方格' },
      ]
      const sel = Math.round(p.shape ?? 0) % shapes.length
      const d = shapes[sel]!
      return {
        value: sel,
        text: `${d.name}：前面 ${d.front}，右面 ${d.right}，上面 ${d.top}`,
        steps: [
          { expr: `从前面看`, result: `${d.front}` },
          { expr: `从右面看`, result: `${d.right}` },
          { expr: `从上面看`, result: `${d.top}` },
        ],
        conclusion: `从不同方向观察同一个物体，看到的图形可能不同。${d.name}：前面是${d.front}，右面是${d.right}，上面是${d.top}。`,
      }
    }
    case 'views3d': {
      const views = ['前面', '右面', '上面']
      const view = Math.round(p.view ?? 0)
      const texts = [
        '投票箱正面：看到长方形（正面）',
        '投票箱右侧：看到较窄的长方形（侧面）',
        '投票箱顶部：看到顶面形状',
      ]
      return {
        value: view,
        text: `从${views[view]}看：${texts[view]!}`,
        steps: [
          { expr: `观察方向`, result: `${views[view]}` },
          { expr: `看到的图形`, result: `${texts[view]!}` },
        ],
        conclusion: `从${views[view]}观察，看到的图形由物体在${views[view]}方向的投影决定。`,
      }
    }

    /* ============ 附录 倍的认识 ============ */
    case 'times': {
      const each = p.each ?? 2
      const groups = Math.round(p.groups ?? 3)
      const total = each * groups
      return {
        value: total,
        text: `${fmt(groups)} 个 ${fmt(each)} = ${fmt(each)} × ${fmt(groups)} = ${fmt(total)}`,
        steps: [
          { expr: `一组有 ${fmt(each)} 个`, result: `有这样的 ${fmt(groups)} 组` },
          { expr: `是 ${fmt(each)} 的 ${fmt(groups)} 倍`, result: `${fmt(each)} × ${fmt(groups)} = ${fmt(total)}` },
        ],
        conclusion: `${fmt(groups)} 个 ${fmt(each)} 相加，是 ${fmt(each)} 的 ${fmt(groups)} 倍，用乘法：${fmt(each)} × ${fmt(groups)} = ${fmt(total)}。`,
      }
    }
    case 'times-mul': {
      const base = p.base ?? 4
      const times = Math.round(p.times ?? 2)
      const total = base * times
      return {
        value: total,
        text: `${fmt(base)} 的 ${fmt(times)} 倍 = ${fmt(base)} × ${fmt(times)} = ${fmt(total)}`,
        steps: [
          { expr: `画 ${fmt(times)} 段一样长的线段`, result: `每段 ${fmt(base)}` },
          { expr: `求 ${fmt(times)} 个 ${fmt(base)} 是多少`, result: `${fmt(base)} × ${fmt(times)} = ${fmt(total)}` },
        ],
        conclusion: `求一个数的几倍是多少，就是求几个几是多少，用乘法：${fmt(base)} × ${fmt(times)} = ${fmt(total)}。`,
      }
    }
    case 'times-div': {
      const isMix = p.dad !== undefined && p.less !== undefined
      if (isMix) {
        const dad = p.dad ?? 32
        const less = p.less ?? 3
        const son = p.son ?? 7
        const mom = dad - less
        const { times, exact } = timesOf(dad, son)
        return {
          value: Math.round(times),
          text: `妈妈 ${fmt(mom)} 岁，爸爸年龄是小阳的约 ${fmt(times)} 倍`,
          steps: [
            { expr: `先求妈妈年龄`, result: `${fmt(dad)} − ${fmt(less)} = ${fmt(mom)} 岁` },
            { expr: `爸爸是小阳的几倍`, result: `${fmt(dad)} ÷ ${fmt(son)} = ${fmt(times)}（倍）` },
          ],
          conclusion: `妈妈 ${fmt(mom)} 岁。爸爸 ${fmt(dad)} 岁是小阳 ${fmt(son)} 岁的 ${fmt(times)} 倍${exact ? '' : '（约）'}。`,
        }
      }
      const total = p.total ?? 6
      const base = p.base ?? 3
      const { times, exact } = timesOf(total, base)
      return {
        value: Math.round(times),
        text: `${fmt(total)} ÷ ${fmt(base)} = ${fmt(times)}（倍）`,
        steps: [
          { expr: `把 ${fmt(base)} 看作 1 份`, result: `${fmt(total)} 里有 ${fmt(times)} 个 ${fmt(base)}` },
          { expr: `用除法`, result: `${fmt(total)} ÷ ${fmt(base)} = ${fmt(times)}` },
        ],
        conclusion: `求一个数是另一个数的几倍，用除法：${fmt(total)} ÷ ${fmt(base)} = ${fmt(times)}（倍）${exact ? '' : '，不是整倍'}`,
      }
    }
  }
}
