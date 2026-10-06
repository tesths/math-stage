import type { LabKind, ParamValues } from '@data/schema/lab'
import type { LabResult, LabStep } from './types'
import { toBinary, toFixed2, simplifyRatio, roundTo, fixedN } from '@/lib/engine/math'
import { computeExerciseLab, isExerciseKind } from './exercises'
import { fractionCount, fractionDecimal, fractionText, snapUpToMultiple, unitFractionSum } from './fractions'
import {
  FLOUR_PRICE,
  roundLife,
  segmentMore,
  RICE_PRICE,
  SHOP_GOODS,
  VERDICT_TEXT,
  affordableVerdict,
  estimateShop,
  fracMix,
  piecewiseFee,
} from './quantity'
import {
  binaryDivisionSteps,
  binaryReading,
  carryBoundary,
  comparePair,
  opExample,
  placeExample,
} from './numberSys'

export type { LabStep, LabResult } from './types'

function fmt(v: number): string {
  return toFixed2(Math.round(v * 100000) / 100000)
}

/** 供练习题计算模块复用（保持一致的数字格式化） */
export { fmt }

const PI = 3.14

/** 三值结论的理由说明（避免"一定不够"后面还跟着"就一定够"） */
function verdictWhy(v: 'definitely' | 'never' | 'maybe'): string {
  if (v === 'definitely') return '（最少剩的都比它多，就一定够）'
  if (v === 'never') return '（最多剩的都比它少，就一定不够）'
  return '（剩下的钱在它上下，无法确定）'
}

export function computeLab(kind: LabKind, p: ParamValues): LabResult {
  // 练习题 Lab（练习一…练习十四）由独立模块分派；其余为 33 种例题 kind
  if (isExerciseKind(kind)) return computeExerciseLab(kind, p)
  switch (kind) {
    /* ============ 一 小数乘法和除法（二） ============ */
    case 'mul-decimal': {
      const a = p.a ?? 0
      const b = p.b ?? 0
      const ia = Math.round(a * 10)
      const ib = Math.round(b * 10)
      const cells = ia * ib
      const total = roundTo((ia * ib) / 100, 2)
      return {
        value: total,
        text: `${fmt(a)} × ${fmt(b)} = ${fmt(total)}`,
        steps: [
          {
            expr: `${fmt(a)} 和 ${fmt(b)} 各 ×10 变成整数`,
            result: `${ia} × ${ib} = ${cells}（也就是 ${cells} 个小格）`,
          },
          { expr: `积再 ÷100（两个因数一共两位小数）`, result: `${cells} ÷ 100 = ${fmt(total)}` },
        ],
        conclusion: `先按整数乘法算 ${ia}×${ib}=${cells}，两个因数一共有两位小数，所以积是两位小数 ${fmt(total)}；图上阴影部分就是 ${cells} 个 0.01。`,
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
      const exact = roundTo(price * count, 6)
      const approx = roundTo(exact, digits)
      const shown = fixedN(approx, digits)
      const nextDigit = Number(fixedN(exact, digits + 1).slice(-1))
      return {
        value: approx,
        text: `${fmt(price)} × ${fmt(count)} ≈ ${shown}`,
        steps: [
          { expr: `总价 = 单价 × 数量`, result: `${fmt(price)} × ${fmt(count)} = ${fmt(exact)}` },
          {
            expr: `看第 ${digits + 1} 位小数「${nextDigit}」${nextDigit >= 5 ? '≥5，向保留位进 1' : '<5，直接舍去'}`,
            result: `保留 ${digits} 位小数 → ${shown}`,
          },
        ],
        conclusion: `购买 ${fmt(count)} 千克苹果要付约 ${shown} 元。`,
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
      const perMin = metersPerHour / 60
      const approx = roundTo(perMin, 2)
      const shown = fixedN(approx, 2)
      return {
        value: approx,
        text: `${speed} 千米/时 ≈ ${shown} 米/分`,
        steps: [
          { expr: `${speed} 千米 = ${speed * 1000} 米`, result: `${metersPerHour} 米/时` },
          { expr: `1 时 = 60 分`, result: `${metersPerHour} ÷ 60 = ${fmt(perMin)}` },
          { expr: `保留两位小数（四舍五入）`, result: `${shown} 米/分` },
        ],
        conclusion: `求商的近似值，先算出比需要保留的位数多一位的商，再按"四舍五入"写出结果：${speed} 千米/时 ≈ ${shown} 米/分。`,
      }
    }
    case 'round-life': {
      // 两种情境各用各的：去尾法 = 用钱买铅笔（求"最多买几支"），
      // 进一法 = 用油壶装油（求"至少需要几个"）。原来进一法也套用铅笔情境，
      // 会出现「300 元至少需要 86 个」这种说不通的话。
      const method = Math.round(p.method ?? 0)
      const total = p.total ?? 0
      const r = roundLife(total, method)
      if (r.mode === 'floor') {
        return {
          value: r.result,
          text: `${total} 元最多买 ${r.result} 支自动铅笔`,
          steps: [
            { expr: `总价 ÷ 单价：${total} ÷ ${fmt(r.unit)}`, result: `商是 ${fmt(r.quotient)}，不是整数` },
            { expr: `去尾法：只取整数部分`, result: `${r.result} 支` },
            {
              expr: `验算：${r.result} 支要多少钱`,
              result: `${fmt(r.unit)} × ${r.result} = ${fmt(r.usedValue)} 元（剩 ${fmt(r.remainder)} 元，不够再买 1 支）`,
            },
          ],
          conclusion: `求"最多可以买多少支"，支数必须是整数且钱不能超：用去尾法，${total} 元最多买 ${r.result} 支自动铅笔（${r.result} 支用 ${fmt(r.usedValue)} 元，再买 1 支要 ${fmt(r.nextValue)} 元 > ${total} 元）。`,
        }
      }
      return {
        value: r.result,
        text: `${total} 千克油至少需要 ${r.result} 个油壶`,
        steps: [
          { expr: `总油量 ÷ 每个油壶装的油：${total} ÷ ${fmt(r.unit)}`, result: `商是 ${fmt(r.quotient)}，不是整数` },
          { expr: `进一法：整数部分再加 1`, result: `${r.result} 个` },
          {
            expr: `验算：${r.result - 1} 个装不下、${r.result} 个装得下`,
            result: `${fmt(r.unit)} × ${r.result - 1} = ${fmt(r.usedValue)} < ${total}；${fmt(r.unit)} × ${r.result} = ${fmt(r.nextValue)} ≥ ${total}`,
          },
        ],
        conclusion: `求"至少需要准备几个"，要保证够装：用进一法，${total} 千克油至少需要 ${r.result} 个油壶（${r.result - 1} 个只能装 ${fmt(r.usedValue)} 千克，不够；${r.result} 个能装 ${fmt(r.nextValue)} 千克）。`,
      }
    }

    /* ============ 二 混合运算与数量关系（三） ============ */
    case 'frac-mix': {
      const a = p.a ?? 0
      const b = p.b ?? 0
      const n = p.n ?? 0
      const m = fracMix(a, b, n)
      return {
        value: m.total,
        text: `一共用彩绳 ${fmt(m.total)} 米`,
        steps: [
          { expr: `解法一：先分别算两种中国结各用多少米`, result: m.method1 },
          { expr: `解法二：先算各做一个共用的米数（两个分率的和是 1）`, result: m.method2 },
        ],
        conclusion: `两种解法结果相同（${fmt(m.total)} 米）：分数四则混合运算的顺序与整数相同，乘法分配律对分数同样适用。`,
      }
    }
    case 'estimate-shop': {
      const budget = p.budget ?? 0
      const est = estimateShop(budget, SHOP_GOODS)
      const flour = affordableVerdict(est, FLOUR_PRICE)
      const rice = affordableVerdict(est, RICE_PRICE)
      return {
        value: est.leftHigh,
        text: `估大法最少剩 ${fmt(est.leftHigh)} 元，估小法最多剩 ${fmt(est.leftLow)} 元`,
        steps: [
          { expr: `估大法：19.6 看作 20，30.4 看作 31`, result: `${fmt(budget)} - 20 - 31×2 = ${fmt(est.leftHigh)} 元` },
          { expr: `估小法：19.6 看作 19，30.4 看作 30`, result: `${fmt(budget)} - 19 - 30×2 = ${fmt(est.leftLow)} 元` },
          {
            expr: `最少剩 ${fmt(est.leftHigh)} 元与面粉 ${FLOUR_PRICE} 元比`,
            result: `${VERDICT_TEXT[flour]}买面粉${verdictWhy(flour)}`,
          },
          {
            expr: `最多剩 ${fmt(est.leftLow)} 元与大米 ${RICE_PRICE} 元比`,
            result: `${VERDICT_TEXT[rice]}买大米${verdictWhy(rice)}`,
          },
        ],
        conclusion: `估大法看"最少剩多少"，估小法看"最多剩多少"：最少剩的够就一定够，最多剩的都不够就一定不够，剩下的情况无法确定。`,
      }
    }
    case 'segment': {
      const total = p.total ?? 0
      const fn = p.fn ?? 0
      const fd = p.fd ?? 0
      const boysCount = fractionCount(total, fn, fd)
      const boys = Math.round(boysCount.value * 100) / 100
      const girls = Math.round((total - boys) * 100) / 100
      const steps: LabStep[] = [
        { expr: `男运动员 = 总人数 × ${fn}/${fd}`, result: `${total} × ${fn}/${fd} = ${fmt(boys)} 人` },
        { expr: `女运动员 = 总人数 - 男运动员`, result: `${total} - ${fmt(boys)} = ${fmt(girls)} 人` },
        { expr: `或：女占 1 - ${fn}/${fd} = ${fractionText(fd - fn, fd)}`, result: `${total} × ${fractionText(fd - fn, fd)} = ${fmt(girls)} 人` },
      ]
      if (!boysCount.integral) {
        steps.push({
          expr: `注意实际意义：人数必须是整数`,
          result: `${total} 不是 ${fd} 的倍数，算出 ${fmt(boysCount.value)} 人；把总人数调成 ${fd} 的倍数（如 ${snapUpToMultiple(total, fd)} 人）才合适`,
        })
      }
      return {
        value: girls,
        text: `${total} 人，女运动员 ${fmt(girls)} 人${boysCount.integral ? '' : '（人数需为整数）'}`,
        steps,
        conclusion: boysCount.integral
          ? `已知总人数和男运动员占的几分之几，先求男运动员人数，再用总人数减去；或直接求女生所占的分率再乘总人数。`
          : `人数必须是整数：${total} 人分成 ${fd} 份分不尽，把总人数调成 ${fd} 的倍数（如 ${snapUpToMultiple(total, fd)} 人）再算。`,
      }
    }
    case 'segment-more': {
      const m = segmentMore(p.base ?? 0, p.fn ?? 0, p.fd ?? 0, Math.round(p.mode ?? 0))
      const steps: LabStep[] = [
        {
          expr: m.increase ? `增加的部分 = 原来 × ${m.fraction}` : `减少的部分 = 原来 × ${m.fraction}`,
          result: `${fmt(m.base)} × ${m.fraction} = ${fmt(m.delta)} 天`,
        },
        {
          expr: m.increase ? `结果 = 原来 + 增加的部分` : `结果 = 原来 - 减少的部分`,
          result: `${m.increase ? '+' : '-'} ${fmt(m.delta)} → ${fmt(m.result)} 天`,
        },
        {
          expr: `或：结果 = 原来 × (1 ${m.increase ? '+' : '-'} ${m.fraction})`,
          result: `${fmt(m.base)} × ${fmt(1 + (m.increase ? 1 : -1) * (m.delta / (m.base || 1)))} = ${fmt(m.result)} 天`,
        },
      ]
      if (!m.integral) {
        steps.push({ expr: '注意实际意义', result: `天数可以是小数，但要注意题意是否需要取整` })
      }
      return {
        value: m.result,
        text: `结果 = ${fmt(m.result)} 天`,
        steps,
        conclusion: m.increase
          ? `比原来多 ${m.fraction}：先算多出的部分 ${fmt(m.delta)} 天，再加上原来的 ${fmt(m.base)} 天，得 ${fmt(m.result)} 天；也可以 ${fmt(m.base)} × (1 + ${m.fraction}) = ${fmt(m.result)} 天。`
          : `比原来少 ${m.fraction}：先算少掉的部分 ${fmt(m.delta)} 天，再从原来的 ${fmt(m.base)} 天里减去，得 ${fmt(m.result)} 天。`,
      }
    }
    case 'work-together': {
      const a = p.a ?? 0
      const b = p.b ?? 0
      const [rn, rd] = unitFractionSum(a, b)
      const rateText = fractionText(rn, rd)
      const hours = fractionDecimal(rd, rn, 2)
      const hoursFrac = fractionText(rd, rn)
      const exact = hours.exact || rd === 1
      return {
        value: hours.value,
        text: `一起做${exact ? '' : '约'} ${hours.text} 小时完成（= ${hoursFrac} 小时）`,
        steps: [
          { expr: `志杰每小时完成 1/${a}`, result: `爸爸每小时完成 1/${b}（把总工作量看作 1）` },
          { expr: `一起每小时完成 1/${a} + 1/${b} = ${a + b}/${a * b}`, result: `化成最简分数 = ${rateText}` },
          { expr: `合作时间 = 1 ÷ ${rateText}`, result: `${hoursFrac} 小时${exact ? '' : ` ≈ ${hours.text} 小时`}` },
        ],
        conclusion: exact
          ? `把总工作量看作 1：1/${a} + 1/${b} = ${rateText}，两人一起 ${hoursFrac} 小时完成。`
          : `把总工作量看作 1：1/${a} + 1/${b} = ${rateText}，合作时间 ${hoursFrac} ≈ ${hours.text} 小时（除不尽，用约等号）。`,
      }
    }
    case 'piecewise': {
      const km = p.km ?? 0
      const r = piecewiseFee(km)
      const steps: LabStep[] = [{ expr: `起步价（不超过 ${r.baseKm} 千米）`, result: `${fmt(r.baseFee)} 元` }]
      if (r.withinBase) {
        steps.push({ expr: `没有超出起步价千米数`, result: `车费 ${fmt(r.fee)} 元` })
      } else {
        steps.push({
          expr: `超出 ${fmt(km - r.baseKm)} 千米${r.roundedUp ? '（不足 1 千米按 1 千米计算）' : ''}`,
          result: `按 ${r.extraKm} 千米计费`,
        })
        steps.push({ expr: `超出部分费用 = ${r.extraKm} × 2.2`, result: `${fmt(r.extraFee)} 元` })
        steps.push({ expr: `合计 = ${fmt(r.baseFee)} + ${fmt(r.extraFee)}`, result: `${fmt(r.fee)} 元` })
      }
      return {
        value: r.fee,
        text: `${fmt(km)} 千米车费 ${fmt(r.fee)} 元`,
        steps,
        conclusion: r.withinBase
          ? `不超过 ${r.baseKm} 千米都收起步价 ${fmt(r.baseFee)} 元，所以 ${fmt(km)} 千米的车费是 ${fmt(r.fee)} 元。`
          : `分段计费：起步价 ${fmt(r.baseFee)} 元（含 ${r.baseKm} 千米）＋ 超出 ${r.extraKm} 千米 × 2.2 元 = ${fmt(r.fee)} 元${r.roundedUp ? '；不足 1 千米按 1 千米计算' : ''}。`,
      }
    }

    /* ============ 三 数与运算的再认识 ============ */
    case 'place-value': {
      // 与组件共用同一份数据与拆位逻辑（原来两边各写一份，容易图上与算式不一致）
      const ex = placeExample(p.sel ?? 0)
      return {
        value: ex.v,
        text: ex.text,
        steps: [
          { expr: `按数位拆开`, result: ex.powText },
          { expr: `相邻计数单位的进率`, result: '10 个一 = 1 个十，10 个十 = 1 个百，10 个十分之一 = 1 个一' },
        ],
        conclusion: `整数、分数和小数都是用计数单位计数的：${ex.text}；相邻两个计数单位之间的进率都是 10。`,
      }
    }
    case 'compare-unit': {
      const pr = comparePair(p.sel ?? 0)
      return {
        value: pr.gt ? 1 : 0,
        text: `${pr.a} ${pr.gt ? '>' : '<'} ${pr.b}`,
        steps: [
          { expr: `比较相同计数单位的个数`, result: pr.how },
          { expr: `结论`, result: `${pr.a} ${pr.gt ? '>' : '<'} ${pr.b}` },
        ],
        conclusion: `比较数的大小，就是比较相同计数单位的个数；分数、小数的大小比较都可以转化（通分或统一计数单位）成整数的大小比较。`,
      }
    }
    case 'op-consistency': {
      const op = opExample(p.sel ?? 0)
      return {
        value: op.value,
        text: `${op.expr} = ${fmt(op.value)}`,
        steps: [
          { expr: `换成计数单位来说`, result: op.how },
          { expr: `结果`, result: `${op.expr} = ${op.ans}` },
        ],
        conclusion: `四则运算本质上都是把相同计数单位的个数相加（减、乘、除）：${op.how}，所以 ${op.expr} = ${op.ans}。`,
      }
    }
    case 'binary': {
      const dec = Math.round(p.dec ?? 0)
      const bin = toBinary(dec)
      const steps: LabStep[] = binaryDivisionSteps(dec)
      steps.push({ expr: '余数倒序排列', result: `${dec} = (${bin})₂` })
      const boundary = carryBoundary(dec)
      return {
        value: dec,
        text: `十进制 ${dec} = 二进制（${bin}）₂`,
        steps,
        conclusion: `二进制按"满二进一"计数：${boundary.from} 是（${boundary.fromBin}）₂，再加 1 就满二进一变成（${boundary.toBin}）₂。十进制 ${dec} 用二进制表示是（${bin}）₂，读作"${binaryReading(bin)}"。`,
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
      // 用最简分数表示，除不尽时用约等号（原来一律写 "="，37.5 之外的取值会不成立）
      const frac = fractionDecimal(a * c, b, 2)
      const x = frac.value
      const eq = frac.exact ? '=' : '≈'
      const fracText = fractionText(a * c, b)
      return {
        value: x,
        text: `应加入 ${eq} ${fmt(x)} 克糖`,
        steps: [
          { expr: `列出比例 ${fmt(a)}:${fmt(b)} = x:${fmt(c)}`, result: `糖与水质量比相同` },
          { expr: `外项积 = 内项积：${fmt(b)}x = ${fmt(a)} × ${fmt(c)}`, result: `${fmt(b)}x = ${fmt(a * c)}` },
          {
            expr: `x = ${fmt(a)} × ${fmt(c)} ÷ ${fmt(b)}`,
            result: frac.exact ? `${fmt(x)} 克` : `${fracText} ${eq} ${fmt(x)} 克（除不尽）`,
          },
        ],
        conclusion: frac.exact
          ? `根据比例的基本性质列出方程：${fmt(b)}x = ${fmt(a * c)}，x = ${fmt(x)}，所以应加入 ${fmt(x)} 克糖。`
          : `根据比例的基本性质列出方程：${fmt(b)}x = ${fmt(a * c)}，x = ${fracText} ${eq} ${fmt(x)} 克（除不尽，用约等号）。`,
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
        text: `圆心角 ${fmt(angle)}°，占圆的 ${fractionText(angle, 360)}（≈ ${fixedN(angle / 360, 3)}）`,
        steps: [
          { expr: `圆心角`, result: `${fmt(angle)}°` },
          {
            expr: `扇形占圆的比例 = 圆心角 ÷ 360°`,
            result: `${fmt(angle)} ÷ 360 = ${fractionText(angle, 360)} ≈ ${fixedN(angle / 360, 3)}`,
          },
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
      const r = p.r ?? 0
      // 内圆半径 ≥ 外圆半径时不成立：与图上的一致处理是给出提示，而不是静默夹取成"≈ 0"
      if (r >= R) {
        return {
          value: 0,
          text: `内圆半径 ${fmt(r)} 厘米不小于外圆半径 ${fmt(R)} 厘米，无法围成环形`,
          steps: [
            { expr: `环形的条件`, result: `内圆半径必须小于外圆半径（r < R）` },
            { expr: `当前取值`, result: `r = ${fmt(r)} 厘米，R = ${fmt(R)} 厘米，不满足 r < R` },
          ],
          conclusion: `把内圆半径调小（小于外圆半径 ${fmt(R)} 厘米）才能围成环形：环宽 = R − r，面积 = π(R² − r²)。`,
        }
      }
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
      const ask = Math.round(p.ask ?? 0)
      const cm = p.cm ?? 0
      const actualM = p.actualM ?? 0
      if (ask === 1) {
        // 已知实际距离，求图上距离
        const actualCm = actualM * 100
        const mapCm = roundTo(actualCm / scaleDen, 2)
        return {
          value: mapCm,
          text: `图上距离 ${fmt(mapCm)} 厘米`,
          steps: [
            { expr: `先统一单位：${fmt(actualM)} 米 = ${fmt(actualCm)} 厘米`, result: `${fmt(actualCm)} 厘米` },
            { expr: `图上距离 = 实际距离 ÷ 比例尺分母`, result: `${fmt(actualCm)} ÷ ${fmt(scaleDen)} = ${fmt(mapCm)} 厘米` },
          ],
          conclusion: `实际 ${fmt(actualM)} 米，按 1:${fmt(scaleDen)} 画在图上就是 ${fmt(mapCm)} 厘米。`,
        }
      }
      if (ask === 2) {
        // 已知图上距离与实际距离，求比例尺
        const actualCm = actualM * 100
        const ratio = roundTo(actualCm / cm, 2)
        return {
          value: ratio,
          text: `比例尺 1:${fmt(ratio)}`,
          steps: [
            { expr: `先统一单位：${fmt(actualM)} 米 = ${fmt(actualCm)} 厘米`, result: `${fmt(actualCm)} 厘米` },
            { expr: `图上距离 : 实际距离 = ${fmt(cm)} : ${fmt(actualCm)}`, result: `前项化成 1 → 1 : ${fmt(ratio)}` },
          ],
          conclusion: `图上 ${fmt(cm)} 厘米表示实际 ${fmt(actualM)} 米，这幅图的比例尺是 1:${fmt(ratio)}。`,
        }
      }
      const actualCm = cm * scaleDen
      const outM = actualCm / 100
      return {
        value: outM,
        text: `实际距离 ${fmt(outM)} 米`,
        steps: [
          { expr: `实际距离 = 图上距离 × 比例尺分母`, result: `${fmt(cm)} × ${fmt(scaleDen)} = ${fmt(actualCm)} 厘米` },
          { expr: `厘米 → 米`, result: `${fmt(actualCm)} ÷ 100 = ${fmt(outM)} 米` },
        ],
        conclusion: `比例尺 1:${fmt(scaleDen)} 表示图上 1 厘米相当于实际 ${fmt(scaleDen / 100)} 米；图上 ${fmt(cm)} 厘米就是实际 ${fmt(outM)} 米。`,
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
