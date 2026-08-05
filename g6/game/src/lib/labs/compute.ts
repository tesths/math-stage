import type { LabKind, ParamValues } from '@data/schema/lab'
import { toBinary, toFixed2, simplifyRatio, roundTo } from '@/lib/engine/math'

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

const PI = 3.14

export function computeLab(kind: LabKind, p: ParamValues): LabResult {
  switch (kind) {
    /* ============ 一 小数乘法和除法（二） ============ */
    case 'mul-decimal': {
      const a = p.a ?? 0
      const b = p.b ?? 0
      const int = Math.round(a * 10) * Math.round(b * 10)
      const total = a * b
      return {
        value: total,
        text: `${fmt(a)} × ${fmt(b)} = ${fmt(total)}`,
        steps: [
          { expr: `0.6 × 0.4 两个因数各 ×10`, result: `${Math.round(a * 10)} × ${Math.round(b * 10)} = ${int}` },
          { expr: `积再 ÷100（两位小数）`, result: `${int} ÷ 100 = ${fmt(total)}` },
        ],
        conclusion: `先按整数乘法算 6×4=24，再看两个因数一共有两位小数，积就是两位小数 0.24。`,
      }
    }
    case 'mul-compare': {
      const base = p.base ?? 0
      const factor = p.factor ?? 0
      const prod = base * factor
      const cmp = factor > 1 ? '大于' : factor < 1 ? '小于' : '等于'
      return {
        value: prod,
        text: `${fmt(base)} × ${fmt(factor)} = ${fmt(prod)}`,
        steps: [
          { expr: `计算积`, result: `${fmt(prod)}` },
          { expr: `另一个乘数 ${fmt(factor)} 与 1 比较`, result: `${cmp} 1` },
          { expr: `积 ${cmp} 第一个乘数`, result: `${fmt(prod)} ${cmp} ${fmt(base)}` },
        ],
        conclusion: `另一个乘数大于 1 时积大于第一个乘数；等于 1 时积相等；小于 1 时积小于第一个乘数。`,
      }
    }
    case 'mul-approx': {
      const price = p.price ?? 0
      const count = p.count ?? 0
      const digits = Math.round(p.digits ?? 1)
      const exact = price * count
      const approx = roundTo(exact, digits)
      return {
        value: approx,
        text: `${fmt(price)} × ${fmt(count)} ≈ ${approx.toFixed(digits)}`,
        steps: [
          { expr: `总价 = 单价 × 数量`, result: `${fmt(price)} × ${fmt(count)} = ${fmt(exact)}` },
          { expr: `按"四舍五入"保留 ${digits} 位小数`, result: `${approx.toFixed(digits)}` },
        ],
        conclusion: `购买 ${fmt(count)} 千克苹果要付约 ${approx.toFixed(digits)} 元。`,
      }
    }
    case 'div-decimal': {
      const examples = [
        { d: 0.6, v: 0.3, i1: 6, i2: 3, q: 2, name: '红彩带剪小段', unit: '段' },
        { d: 1.2, v: 0.24, i1: 120, i2: 24, q: 5, name: '绿彩带剪小段', unit: '段' },
        { d: 0.34, v: 0.017, i1: 340, i2: 17, q: 20, name: '微型例题', unit: '' },
      ]
      const e = examples[Math.round(p.sel ?? 0) % 3]!
      return {
        value: e.q,
        text: `${e.name}：${fmt(e.d)} ÷ ${fmt(e.v)} = ${e.q} ${e.unit}`,
        steps: [
          { expr: `被除数和除数小数点同时向右移`, result: `${fmt(e.d)} ÷ ${fmt(e.v)} → ${e.i1} ÷ ${e.i2}` },
          { expr: `转化为整数除法`, result: `${e.i1} ÷ ${e.i2} = ${e.q}` },
        ],
        conclusion: `一个数除以小数，把被除数和除数的小数点同时向右移动相同的位数，转化成整数除法计算。`,
      }
    }
    case 'div-approx': {
      const speed = p.speed ?? 40
      const metersPerHour = speed * 1000
      const perSec = metersPerHour / 3600
      const approx = roundTo(perSec, 2)
      return {
        value: approx,
        text: `${speed} 千米/时 ≈ ${approx.toFixed(2)} 米/秒`,
        steps: [
          { expr: `${speed} 千米 = ${speed * 1000} 米`, result: `${metersPerHour} 米/时` },
          { expr: `1 时 = 3600 秒`, result: `${metersPerHour} ÷ 3600 = ${fmt(perSec)}` },
          { expr: `保留两位小数（四舍五入）`, result: `${approx.toFixed(2)} 米/秒` },
        ],
        conclusion: `求商的近似值，先算出比需要保留的位数多一位的商，再按"四舍五入"写出结果：${speed} 千米/时 ≈ ${approx.toFixed(2)} 米/秒。`,
      }
    }
    case 'round-life': {
      const method = Math.round(p.method ?? 0)
      const total = p.total ?? 0
      const price = 3.5
      const q = total / price
      const whole = Math.floor(q)
      const result = method === 0 ? whole : Math.ceil(q)
      const what = method === 0 ? '最多可以买' : '至少需要'
      return {
        value: result,
        text: `${total} 元，${what} ${result} 个`,
        steps: [
          { expr: `${total} ÷ ${fmt(price)} = ${fmt(q)}`, result: `商约 ${fmt(q)}` },
          { expr: method === 0 ? '去尾法（取整数部分）' : '进一法（整数部分 + 1）', result: `${result} 个` },
        ],
        conclusion:
          method === 0
            ? `求"最多可以买多少支"用去尾法，300 元最多买 ${result} 支自动铅笔。`
            : `求"至少需要几个"用进一法，${total} 元至少准备 ${result} 个油壶。`,
      }
    }

    /* ============ 二 混合运算与数量关系（三） ============ */
    case 'frac-mix': {
      const a = p.a ?? 0
      const b = p.b ?? 0
      const n = p.n ?? 0
      const m1 = (a / (a + b)) * n
      const m2 = (b / (a + b)) * n
      return {
        value: n,
        text: `一共用彩绳 ${fmt(n)} 米`,
        steps: [
          { expr: `解法一：分别算两种中国结`, result: `${fmt(m1)} + ${fmt(m2)} = ${fmt(n)} 米` },
          { expr: `解法二：先算各做一个共用彩绳`, result: `${fmt(a / (a + b) + b / (a + b))} × ${fmt(n)} = ${fmt(n)} 米` },
        ],
        conclusion: `分数四则混合运算的运算顺序与整数相同，整数的运算律（乘法分配律）对分数同样适用，两种解法结果一样。`,
      }
    }
    case 'estimate-shop': {
      const budget = p.budget ?? 0
      const minLeft = budget - 20 - 31 * 2
      const maxLeft = budget - 19 - 30 * 2
      const flourOk = minLeft > 16.8
      const riceNo = maxLeft < 21.6
      return {
        value: minLeft,
        text: `估大法最少剩 ${fmt(minLeft)} 元，估小法最多剩 ${fmt(maxLeft)} 元`,
        steps: [
          { expr: `估大法：19.6<20，30.4<31`, result: `${budget} - 20 - 31×2 = ${fmt(minLeft)} 元` },
          { expr: `估小法：19.6>19，30.4>30`, result: `${budget} - 19 - 30×2 = ${fmt(maxLeft)} 元` },
          { expr: `最少剩的钱与面粉 16.8 元比`, result: flourOk ? `${fmt(minLeft)} > 16.8，够买面粉` : `${fmt(minLeft)} ≤ 16.8，不一定够买面粉` },
          { expr: `最多剩的钱与大米 21.6 元比`, result: riceNo ? `${fmt(maxLeft)} < 21.6，不够买大米` : `${fmt(maxLeft)} ≥ 21.6，可能够买大米` },
        ],
        conclusion: `要判断"够不够"时把价钱估大（估大法）看最少剩多少，把价钱估小（估小法）看最多剩多少，这样结论才可靠。`,
      }
    }
    case 'segment': {
      const total = p.total ?? 0
      const fn = p.fn ?? 0
      const fd = p.fd ?? 0
      const boys = (total * fn) / fd
      const girls = total - boys
      return {
        value: girls,
        text: `${total} 人，女运动员 ${fmt(girls)} 人`,
        steps: [
          { expr: `男运动员 = 总人数 × ${fn}/${fd}`, result: `${total} × ${fn}/${fd} = ${fmt(boys)} 人` },
          { expr: `女运动员 = 总人数 - 男运动员`, result: `${total} - ${fmt(boys)} = ${fmt(girls)} 人` },
          { expr: `或：女占 1 - ${fn}/${fd} = ${fmt((fd - fn) / fd)}`, result: `${total} × ${fmt((fd - fn) / fd)} = ${fmt(girls)} 人` },
        ],
        conclusion: `已知总人数和男运动员占的几分之几，先求男运动员人数，再用总人数减去；或直接求女生所占的分率再乘总人数。`,
      }
    }
    case 'segment-more': {
      const base = p.base ?? 0
      const fn = p.fn ?? 0
      const fd = p.fd ?? 0
      const mode = Math.round(p.mode ?? 0)
      const delta = (base * fn) / fd
      const result = mode === 0 ? base + delta : base - delta
      return {
        value: result,
        text: `结果 = ${fmt(result)} 天`,
        steps: [
          { expr: mode === 0 ? `增加的部分 = 原来 × ${fn}/${fd}` : `减少的部分 = 原来 × ${fn}/${fd}`, result: `${base} × ${fn}/${fd} = ${fmt(delta)} 天` },
          { expr: mode === 0 ? `结果 = 原来 + 增加的部分` : `结果 = 原来 - 减少的部分`, result: `${fmt(result)} 天` },
          { expr: `或：结果 = 原来 × (1 ${mode === 0 ? '+' : '-'} ${fn}/${fd})`, result: `${base} × ${fmt(1 + (mode === 0 ? fn / fd : -fn / fd))} = ${fmt(result)} 天` },
        ],
        conclusion: mode === 0 ? `水仙花的花期比风信子长 ${fn}/${fd}：14 + 4 = 18 天。` : `结果比原来少 ${fn}/${fd}：${fmt(base - delta)} 天。`,
      }
    }
    case 'work-together': {
      const a = p.a ?? 0
      const b = p.b ?? 0
      const rate = 1 / a + 1 / b
      const hours = 1 / rate
      return {
        value: hours,
        text: `一起做约 ${fmt(hours)} 小时完成`,
        steps: [
          { expr: `志杰每小时完成 1/${a}`, result: `爸爸每小时完成 1/${b}` },
          { expr: `一起每小时完成 1/${a} + 1/${b}`, result: `${fmt(rate)}` },
          { expr: `合作时间 = 1 ÷ (1/${a} + 1/${b})`, result: `${fmt(hours)} 小时` },
        ],
        conclusion: `把总工作量看作 1：1/6 + 1/3 = 1/2，两人一起 2 小时完成。`,
      }
    }
    case 'piecewise': {
      const km = p.km ?? 0
      const within = km <= 3
      const extra = within ? 0 : Math.ceil(km - 3)
      const fee = within ? 10 : 10 + extra * 2.2
      return {
        value: fee,
        text: `${fmt(km)} 千米车费 ${fmt(fee)} 元`,
        steps: [
          { expr: `起步价（3 千米内）`, result: `10 元` },
          { expr: `超出 ${fmt(km - 3)} 千米（不足 1 千米按 1 千米计）`, result: `${extra} 千米` },
          { expr: `超出部分费用 = ${extra} × 2.2`, result: `${fmt(extra * 2.2)} 元` },
          { expr: `合计 = 10 + 超出部分`, result: `${fmt(fee)} 元` },
        ],
        conclusion: `分段计费：先收起步价 10 元，再按超出部分每千米 2.2 元计算，两段费用相加。`,
      }
    }

    /* ============ 三 数与运算的再认识 ============ */
    case 'place-value': {
      const nums: { v: number; parts: string[]; unit: string }[] = [
        { v: 231, parts: ['2 个百', '3 个十', '1 个一'], unit: '231 = 2×100 + 3×10 + 1×1' },
        { v: 2000, parts: ['2 个千'], unit: '2000 = 2×1000' },
        { v: 3.36, parts: ['3 个一', '3 个十分之一', '6 个百分之一'], unit: '3.36 = 3×1 + 3×0.1 + 6×0.01' },
        { v: 4.05, parts: ['4 个一', '5 个百分之一'], unit: '4.05 = 4×1 + 5×0.01' },
        { v: 0.24, parts: ['2 个十分之一', '4 个百分之一'], unit: '0.24 = 2×0.1 + 4×0.01' },
      ]
      const n = nums[Math.round(p.sel ?? 0) % nums.length]!
      return {
        value: n.v,
        text: `${fmt(n.v)} = ${n.parts.join(' + ')}`,
        steps: [{ expr: `数位与计数单位`, result: n.parts.join(' + ') }],
        conclusion: `整数、分数和小数都是用计数单位计数的，由若干个计数单位组成；相邻计数单位之间的进率都是 10。`,
      }
    }
    case 'compare-unit': {
      const pairs = [
        { a: '1000', b: '923', how: '1000 是 10 个百，923 不足 10 个百' },
        { a: '3.34', b: '3.4', how: '3.34 是 33.4 个 0.1，3.4 是 34 个 0.1' },
        { a: '4.7', b: '4.05', how: '47 个 0.1 > 40.5 个 0.1' },
        { a: '2/3', b: '3/5', how: '通分后 10/15 > 9/15（分数单位相同）' },
        { a: '0.78', b: '0.87', how: '78 个 0.01 < 87 个 0.01' },
      ]
      const pr = pairs[Math.round(p.sel ?? 0) % pairs.length]!
      const gt = Number(pr.a) > Number(pr.b) || pr.a === '2/3'
      return {
        value: gt ? 1 : 0,
        text: `${pr.a} ${gt ? '>' : '<'} ${pr.b}`,
        steps: [
          { expr: `比较相同计数单位的个数`, result: pr.how },
          { expr: `结论`, result: `${pr.a} ${gt ? '>' : '<'} ${pr.b}` },
        ],
        conclusion: `比较数的大小，就是比较相同计数单位的个数；分数、小数的大小比较都可以转化为整数的大小比较。`,
      }
    }
    case 'op-consistency': {
      const ops = [
        { expr: '20 × 3', how: '2 个十 × 3 = 6 个十 = 60', ans: 60 },
        { expr: '2/5 × 3', how: '(1/5 × 2) × 3 = 1/5 × 6 = 6/5', ans: 6 / 5 },
        { expr: '1200 ÷ 3', how: '12 个百 ÷ 3 = 4 个百 = 400', ans: 400 },
        { expr: '1200 ÷ 400', how: '12 个百 ÷ 4 个百 = 12 ÷ 4 = 3', ans: 3 },
        { expr: '135 + 24', how: '1 个百 + 3 个十 + 5 个一，与 2 个十 + 4 个一相加', ans: 159 },
        { expr: '3.4 + 1.25', how: '34 个 0.1 + 125 个 0.01（统一计数单位）', ans: 4.65 },
      ]
      const op = ops[Math.round(p.sel ?? 0) % ops.length]!
      return {
        value: op.ans,
        text: `${op.expr} = ${fmt(op.ans)}`,
        steps: [
          { expr: `计数单位 × 计数单位的个数`, result: op.how },
          { expr: `结果`, result: `${op.expr} = ${fmt(op.ans)}` },
        ],
        conclusion: `四则运算本质上都是把相同计数单位的个数相加（减、乘、除）；乘法中积的计数单位是两因数计数单位的乘积。`,
      }
    }
    case 'binary': {
      const dec = Math.round(p.dec ?? 0)
      const bin = toBinary(dec)
      const steps: LabStep[] = []
      let v = dec
      if (v === 0) {
        steps.push({ expr: '0 ÷ 2', result: '商 0 余 0' })
      }
      while (v > 0) {
        steps.push({ expr: `${v} ÷ 2`, result: `商 ${Math.floor(v / 2)} 余 ${v % 2}` })
        v = Math.floor(v / 2)
      }
      steps.push({ expr: '余数倒序排列', result: `${dec} = (${bin})₂` })
      return {
        value: dec,
        text: `十进制 ${dec} = 二进制（${bin}）₂`,
        steps,
        conclusion: `二进制按"满二进一"的规则计数，十进制数 ${dec} 用二进制表示是（${bin}）₂，读作"${bin.split('').join('')}"。`,
      }
    }

    /* ============ 四 比和比例 ============ */
    case 'ratio-intro': {
      const a = p.a ?? 0
      const b = p.b ?? 0
      return {
        value: a / b,
        text: `${fmt(a)} : ${fmt(b)}（比值 ${fmt(a / b)}）`,
        steps: [
          { expr: `前项 : 后项`, result: `${fmt(a)} : ${fmt(b)}` },
          { expr: `表示 ${fmt(a)} 是 ${fmt(b)} 的倍数`, result: `${fmt(a)} ÷ ${fmt(b)} = ${fmt(a / b)}` },
        ],
        conclusion: `比表示两个数量之间的倍数关系；前项 ${fmt(a)}，后项 ${fmt(b)}，后项不能为 0。`,
      }
    }
    case 'ratio-value': {
      const w = p.w ?? 0
      const h = p.h ?? 0
      const ratio = w / h
      return {
        value: ratio,
        text: `长宽比 ${fmt(w)}:${fmt(h)}，比值 ${fmt(ratio)}`,
        steps: [
          { expr: `长 : 宽 = ${fmt(w)} : ${fmt(h)}`, result: `前项 ÷ 后项` },
          { expr: `比值 = ${fmt(w)} ÷ ${fmt(h)}`, result: `${fmt(ratio)}` },
        ],
        conclusion: `比的前项除以后项所得的商叫作比值；长除以宽的商相等，长方形的形状就相同。`,
      }
    }
    case 'ratio-simplify': {
      const examples: { name: string; a: string; b: string; step: string; res: string }[] = [
        { name: '整数比', a: '12', b: '18', step: '12:18 = (12÷6):(18÷6)', res: '2:3' },
        { name: '分数比', a: '5/6', b: '3/4', step: '5/6:3/4 = (5/6×12):(3/4×12)', res: '10:9' },
        { name: '小数比', a: '1.8', b: '0.09', step: '1.8:0.09 = (1.8×100):(0.09×100)', res: '20:1' },
        { name: '小数比', a: '0.32', b: '0.8', step: '0.32:0.8 = (0.32×100):(0.8×100)', res: '2:5' },
      ]
      const e = examples[Math.round(p.sel ?? 0) % examples.length]!
      return {
        value: 0,
        text: `${e.a}:${e.b} → ${e.res}`,
        steps: [
          { expr: `应用比的基本性质`, result: e.step },
          { expr: `最简整数比`, result: e.res },
        ],
        conclusion: `比的前项和后项同时乘或除以相同的数（0 除外），比值不变；把比化成前项、后项只有公因数 1 的最简整数比。`,
      }
    }
    case 'ratio-distribute': {
      const a = p.a ?? 0
      const b = p.b ?? 0
      const total = p.total ?? 0
      const parts = a + b
      const per = total / parts
      const ra = per * a
      const rb = per * b
      return {
        value: ra,
        text: `需要糯米粉 ${fmt(ra)} 克、鼠曲草浆 ${fmt(rb)} 克`,
        steps: [
          { expr: `总份数 = ${fmt(a)} + ${fmt(b)}`, result: `${fmt(parts)} 份` },
          { expr: `每份 = ${fmt(total)} ÷ ${fmt(parts)}`, result: `${fmt(per)} 克` },
          { expr: `糯米粉 = 每份 × ${fmt(a)}`, result: `${fmt(ra)} 克` },
          { expr: `鼠曲草浆 = 每份 × ${fmt(b)}`, result: `${fmt(rb)} 克` },
        ],
        conclusion: `按 ${fmt(a)}:${fmt(b)} 分配 ${fmt(total)} 克，先算每份 ${fmt(per)} 克，再分别乘份数：${fmt(ra)} 克和 ${fmt(rb)} 克。`,
      }
    }
    case 'proportion-basic': {
      const a = p.a ?? 0
      const b = p.b ?? 0
      const k = p.k ?? 0
      const c = a * k
      const d = b * k
      const outer = a * d
      const inner = b * c
      return {
        value: outer,
        text: `${fmt(a)}:${fmt(b)} = ${fmt(c)}:${fmt(d)}，外项积 = 内项积 = ${fmt(outer)}`,
        steps: [
          { expr: `比例：${fmt(a)}:${fmt(b)} = ${fmt(c)}:${fmt(d)}`, result: `两个比比值都是 ${fmt(a / b)}` },
          { expr: `外项积 = ${fmt(a)} × ${fmt(d)}`, result: `${fmt(outer)}` },
          { expr: `内项积 = ${fmt(b)} × ${fmt(c)}`, result: `${fmt(inner)}` },
        ],
        conclusion: `在比例里，两个外项的积等于两个内项的积，这就是比例的基本性质。`,
      }
    }
    case 'solve-proportion': {
      const a = p.a ?? 0
      const b = p.b ?? 0
      const c = p.c ?? 0
      const x = (a * c) / b
      return {
        value: x,
        text: `应加入 ${fmt(x)} 克糖`,
        steps: [
          { expr: `列出比例 ${fmt(a)}:${fmt(b)} = x:${fmt(c)}`, result: `糖与水质量比相同` },
          { expr: `外项积 = 内项积：${fmt(b)}x = ${fmt(a)} × ${fmt(c)}`, result: `${fmt(b)}x = ${fmt(a * c)}` },
          { expr: `x = ${fmt(a)} × ${fmt(c)} ÷ ${fmt(b)}`, result: `${fmt(x)} 克` },
        ],
        conclusion: `根据比例的基本性质列出方程，解比例求出应加入 ${fmt(x)} 克糖。`,
      }
    }
    case 'golden-ratio': {
      const w = p.w ?? 0
      const len = w / 0.618
      return {
        value: len,
        text: `宽 ${fmt(w)} 毫米，黄金比长 ≈ ${fmt(len)} 毫米`,
        steps: [
          { expr: `黄金比：宽 : 长 ≈ 0.618 : 1`, result: `长 = 宽 ÷ 0.618` },
          { expr: `长 = ${fmt(w)} ÷ 0.618`, result: `≈ ${fmt(len)} 毫米` },
        ],
        conclusion: `宽与长的比约为 0.618 的长方形最协调；0.618 就是黄金比的近似值。`,
      }
    }

    /* ============ 五 圆 ============ */
    case 'circle-feature': {
      const r = p.r ?? 0
      return {
        value: 2 * r,
        text: `半径 ${fmt(r)} 厘米，直径 ${fmt(2 * r)} 厘米`,
        steps: [
          { expr: `半径 r = ${fmt(r)} 厘米`, result: `连接圆心和圆上任意一点` },
          { expr: `直径 d = 2r`, result: `${fmt(r)} × 2 = ${fmt(2 * r)} 厘米` },
        ],
        conclusion: `同一个圆的半径都相等，直径是半径的 2 倍：d = 2r，r = d ÷ 2。`,
      }
    }
    case 'sector': {
      const angle = p.angle ?? 0
      return {
        value: angle,
        text: `圆心角 ${fmt(angle)}°，占圆的 ${fmt(angle / 360)}`,
        steps: [
          { expr: `圆心角`, result: `${fmt(angle)}°` },
          { expr: `扇形占圆的比例 = 圆心角 ÷ 360°`, result: `${fmt(angle)} ÷ 360 = ${fmt(angle / 360)}` },
        ],
        conclusion: `在同一个圆中，圆心角越大，所对的弧越长，扇形越大。`,
      }
    }
    case 'circumference': {
      const r = p.r ?? 0
      const c = roundTo(2 * PI * r, 2)
      return {
        value: c,
        text: `周长 ≈ ${fmt(c)} 米`,
        steps: [
          { expr: `C = 2πr`, result: `2 × 3.14 × ${fmt(r)}` },
          { expr: `计算`, result: `${fmt(2 * PI * r)} ≈ ${fmt(c)} 米` },
        ],
        conclusion: `圆的周长是直径的 π 倍：C = πd = 2πr，半径 ${fmt(r)} 米的喷水池周长约 ${fmt(c)} 米。`,
      }
    }
    case 'circle-area': {
      const r = p.r ?? 0
      const s = roundTo(PI * r * r, 2)
      const perim = roundTo(2 * PI * r, 2)
      return {
        value: s,
        text: `面积 ≈ ${fmt(s)} 平方米`,
        steps: [
          { expr: `圆平均分成 ${Math.round(p.slices ?? 8)} 份拼成近似长方形`, result: `长 ≈ πr = ${fmt(perim / 2)}，宽 = r = ${fmt(r)}` },
          { expr: `S = πr × r = πr²`, result: `3.14 × ${fmt(r)} × ${fmt(r)}` },
          { expr: `计算`, result: `≈ ${fmt(s)} 平方米` },
        ],
        conclusion: `把圆剪拼成近似长方形：长相当于圆周长的一半 πr，宽相当于半径 r，所以 S = πr² ≈ ${fmt(s)}。`,
      }
    }
    case 'annulus': {
      const R = p.R ?? 0
      const r = Math.min(p.r ?? 0, R)
      const s = roundTo(PI * (R * R - r * r), 2)
      return {
        value: s,
        text: `环形面积 ≈ ${fmt(s)} 平方厘米`,
        steps: [
          { expr: `外圆面积 = π × ${fmt(R)}²`, result: `${fmt(PI * R * R)} 平方厘米` },
          { expr: `内圆面积 = π × ${fmt(r)}²`, result: `${fmt(PI * r * r)} 平方厘米` },
          { expr: `S = 外圆 - 内圆 = π(R² - r²)`, result: `≈ ${fmt(s)} 平方厘米` },
        ],
        conclusion: `圆环面积 = 外圆面积 - 内圆面积 ≈ ${fmt(s)} 平方厘米。`,
      }
    }
    case 'circle-composite': {
      const side = p.side ?? 0
      const r = side / 2
      const sq = side * side
      const semi = (PI * r * r) / 2
      const total = roundTo(sq + semi, 2)
      return {
        value: total,
        text: `窗户面积 ≈ ${fmt(total)} 平方米`,
        steps: [
          { expr: `正方形面积 = ${fmt(side)} × ${fmt(side)}`, result: `${fmt(sq)} 平方米` },
          { expr: `半圆半径 = ${fmt(side)} ÷ 2 = ${fmt(r)}`, result: `半圆面积 = π${fmt(r)}²÷2 ≈ ${fmt(semi)}` },
          { expr: `总面积 = 正方形 + 半圆`, result: `≈ ${fmt(total)} 平方米` },
        ],
        conclusion: `组合图形分割成正方形和半圆，分别求面积再相加：约 ${fmt(total)} 平方米。`,
      }
    }

    /* ============ 六 放大与缩小 ============ */
    case 'scale-shape': {
      const n = p.n ?? 0
      const d = p.d ?? 0
      const ratio = n / d
      const kind = ratio > 1 ? '放大' : ratio < 1 ? '缩小' : '不变'
      const shapes = ['长方形', '直角三角形', '梯形']
      return {
        value: ratio,
        text: `按 ${fmt(n)}:${fmt(d)} 的比${kind === '不变' ? '' : kind}`,
        steps: [
          { expr: `每条边都变为原来的 ${fmt(n)}/${fmt(d)} 倍`, result: `${kind}` },
          { expr: `放大或缩小前后`, result: `大小变了，形状不变（角的大小不变）` },
        ],
        conclusion: `把图形按 ${fmt(n)}:${fmt(d)} 的比${kind === '不变' ? '（大小不变）' : kind}：对应边的比是 ${fmt(n)}:${fmt(d)}，形状保持不变。`,
      }
    }
    case 'map-scale': {
      const scaleDen = p.scaleDen ?? 0
      const cm = p.cm ?? 0
      const actualCm = cm * scaleDen
      const actualM = actualCm / 100
      return {
        value: actualM,
        text: `实际距离 ${fmt(actualM)} 米`,
        steps: [
          { expr: `实际距离 = 图上距离 × 比例尺分母`, result: `${fmt(cm)} × ${fmt(scaleDen)} = ${fmt(actualCm)} 厘米` },
          { expr: `厘米 → 米`, result: `${fmt(actualCm)} ÷ 100 = ${fmt(actualM)} 米` },
        ],
        conclusion: `比例尺 ${fmt(scaleDen)} 分之一（1:${fmt(scaleDen)}）表示图上 1 厘米相当于实际 ${fmt(scaleDen / 100)} 米。`,
      }
    }

    /* ============ 七 确定位置 ============ */
    case 'coordinate': {
      const col = p.col ?? 0
      const row = p.row ?? 0
      return {
        value: col * 100 + row,
        text: `数对（${fmt(col)}，${fmt(row)}）`,
        steps: [
          { expr: `第几列从左往右数`, result: `第 ${fmt(col)} 列` },
          { expr: `第几行从前往后数`, result: `第 ${fmt(row)} 行` },
          { expr: `数对（列，行）`, result: `（${fmt(col)}，${fmt(row)}）` },
        ],
        conclusion: `用数对（列，行）可以确定平面上点的位置，顺序不能颠倒。`,
      }
    }
    case 'direction': {
      const angle = p.angle ?? 0
      const dist = p.dist ?? 0
      const dir = Math.round(p.dir ?? 0)
      const dirs = ['北偏东', '北偏西', '南偏东', '南偏西']
      const dname = dirs[dir % 4]!
      return {
        value: dist,
        text: `在舰艇的${dname} ${fmt(angle)}° 方向 ${fmt(dist)} 千米处`,
        steps: [
          { expr: `方向`, result: `${dname} ${fmt(angle)}°` },
          { expr: `距离`, result: `${fmt(dist)} 千米` },
          { expr: `位置 = 方向 + 角度 + 距离`, result: `${dname} ${fmt(angle)}° ${fmt(dist)} 千米` },
        ],
        conclusion: `只说方向无法确定位置，必须用"方向 + 角度 + 距离"才能准确描述物体的位置。`,
      }
    }
  }
}
