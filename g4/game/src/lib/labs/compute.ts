import type { LabKind, ParamValues } from '@data/schema/lab'
import { COUNT_UNITS, digitsOf, factorsOf, formatBig, roundTo, toFixed2 } from '@/lib/engine/math'

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

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function computeLab(kind: LabKind, p: ParamValues): LabResult {
  switch (kind) {
    /* ============ 一 两、三位数除以两位数 ============ */
    case 'div-oral': {
      const base = p.base ?? 60
      const div = Math.round(p.div ?? 20)
      const tensBase = base / 10
      const tensDiv = div / 10
      const q = tensBase / tensDiv
      return {
        value: q,
        text: `${fmt(base)} ÷ ${fmt(div)} = ${fmt(q)}`,
        steps: [
          { expr: `${fmt(base)} 是 ${fmt(tensBase)} 个十`, result: `${fmt(div)} 是 ${fmt(tensDiv)} 个十` },
          { expr: `${fmt(tensBase)} ÷ ${fmt(tensDiv)}`, result: `${fmt(q)}` },
          { expr: `商是 ${fmt(q)} 个十`, result: `${fmt(base)} ÷ ${fmt(div)} = ${fmt(q)}` },
        ],
        conclusion: `把整十数看成"几个十"，转化成表内除法口算，${fmt(base)} ÷ ${fmt(div)} = ${fmt(q)}。`,
      }
    }
    case 'div-try': {
      const num = Math.round(p.num ?? 96)
      const div = Math.round(p.div ?? 24)
      const q = Math.floor(num / div)
      const r = num % div
      const approx = Math.floor(div / 10) * 10
      return {
        value: q,
        text: r === 0 ? `${fmt(num)} ÷ ${fmt(div)} = ${fmt(q)}` : `${fmt(num)} ÷ ${fmt(div)} = ${fmt(q)} …… ${fmt(r)}`,
        steps: [
          { expr: `把除数 ${fmt(div)} 看作整十数`, result: `≈ ${fmt(approx)} 来试商` },
          { expr: `${fmt(approx)} × ${fmt(q)}`, result: `${fmt(approx * q)}（初商 ${fmt(q)}）` },
          { expr: `验算：${fmt(div)} × ${fmt(q)}`, result: `${fmt(div * q)}，${fmt(num)} ${div * q === num ? '正好' : '接近'} ${fmt(div * q)}` },
        ],
        conclusion: r === 0
          ? `把 ${fmt(div)} 看作 ${fmt(approx)} 试商，${fmt(num)} ÷ ${fmt(div)} = ${fmt(q)}。`
          : `把 ${fmt(div)} 看作 ${fmt(approx)} 试商，${fmt(num)} ÷ ${fmt(div)} = ${fmt(q)} 余 ${fmt(r)}。`,
      }
    }
    case 'div-pen': {
      const num = Math.round(p.num ?? 156)
      const div = Math.round(p.div ?? 12)
      const q = Math.floor(num / div)
      const r = num % div
      const digs = digitsOf(num)
      const lead = digs.length >= 3 ? Math.floor(num / 100) : Math.floor(num / 10)
      const canTwo = digs.length >= 3 ? lead >= div : num >= div
      const first = canTwo ? 2 : 3
      return {
        value: q,
        text: r === 0 ? `${fmt(num)} ÷ ${fmt(div)} = ${fmt(q)}` : `${fmt(num)} ÷ ${fmt(div)} = ${fmt(q)} …… ${fmt(r)}`,
        steps: [
          { expr: `除数 ${fmt(div)} 是两位数`, result: `先除被除数的前两位` },
          { expr: `前两位 ${canTwo ? fmt(Number(String(num).slice(0, 2))) : fmt(Number(String(num).slice(0, 3)))} 够商`, result: `商写在第${first}位上` },
          { expr: `继续除`, result: r === 0 ? `${fmt(num)} ÷ ${fmt(div)} = ${fmt(q)}` : `商 ${fmt(q)}，余数 ${fmt(r)}` },
        ],
        conclusion: `除数是两位数，先除被除数的前两位，除到哪一位商就写在那一位上面。${fmt(num)} ÷ ${fmt(div)}${r === 0 ? ` = ${fmt(q)}` : ` = ${fmt(q)} 余 ${fmt(r)}`}。`,
      }
    }
    case 'div-route': {
      const total = Math.round(p.total ?? 224)
      const shelf = Math.round(p.shelf ?? 2)
      const floor = Math.round(p.floor ?? 4)
      const perShelf = total / shelf
      const perFloor = perShelf / floor
      return {
        value: perFloor,
        text: `平均每层放 ${fmt(perFloor)} 本`,
        steps: [
          { expr: `先求每个书架放多少本`, result: `${fmt(total)} ÷ ${fmt(shelf)} = ${fmt(perShelf)} 本` },
          { expr: `再求每层放多少本`, result: `${fmt(perShelf)} ÷ ${fmt(floor)} = ${fmt(perFloor)} 本` },
          { expr: `综合算式：${fmt(total)} ÷ ${fmt(shelf)} ÷ ${fmt(floor)}`, result: `${fmt(perFloor)} 本` },
        ],
        conclusion: `平均每个书架每层放 ${fmt(perFloor)} 本；可以把求出的得数当作条件检验。`,
      }
    }

    /* ============ 二 周长与面积 ============ */
    case 'peri-rect': {
      const a = p.a ?? 12
      const b = p.b ?? 8
      const c = (a + b) * 2
      return {
        value: c,
        text: `周长 ${fmt(c)} 厘米`,
        steps: [
          { expr: `长 + 宽 = ${fmt(a)} + ${fmt(b)}`, result: `${fmt(a + b)} 厘米` },
          { expr: `C = (a + b) × 2 = ${fmt(a + b)} × 2`, result: `${fmt(c)} 厘米` },
        ],
        conclusion: `长方形周长 = (长 + 宽) × 2 = ${fmt(c)} 厘米。`,
      }
    }
    case 'peri-square': {
      const a = p.a ?? 12
      const c = a * 4
      return {
        value: c,
        text: `周长 ${fmt(c)} 厘米`,
        steps: [
          { expr: `四条边长度相加`, result: `${fmt(a)} × 4` },
          { expr: `C = a × 4 = ${fmt(a)} × 4`, result: `${fmt(c)} 厘米` },
        ],
        conclusion: `正方形周长 = 边长 × 4 = ${fmt(c)} 厘米。`,
      }
    }
    case 'area-grid': {
      const a = Math.round(p.a ?? 8)
      const b = Math.round(p.b ?? 5)
      const n = a * b
      return {
        value: n,
        text: `${fmt(n)} 平方厘米`,
        steps: [
          { expr: `沿长铺每排 ${fmt(a)} 个`, result: `沿宽铺 ${fmt(b)} 排` },
          { expr: `小正方形个数 = ${fmt(a)} × ${fmt(b)}`, result: `${fmt(n)} 个` },
        ],
        conclusion: `用 1 平方厘米的小正方形铺满，面积是 ${fmt(n)} 平方厘米。`,
      }
    }
    case 'area-rect': {
      const a = p.a ?? 8
      const b = p.b ?? 5
      const s = a * b
      return {
        value: s,
        text: `${fmt(s)} 平方厘米`,
        steps: [
          { expr: `S = 长 × 宽 = ${fmt(a)} × ${fmt(b)}`, result: `${fmt(s)} 平方厘米` },
        ],
        conclusion: `长方形面积 = 长 × 宽 = ${fmt(s)} 平方厘米。`,
      }
    }
    case 'area-square': {
      const a = p.a ?? 6
      const s = a * a
      return {
        value: s,
        text: `${fmt(s)} 平方厘米`,
        steps: [
          { expr: `S = 边长 × 边长 = ${fmt(a)} × ${fmt(a)}`, result: `${fmt(s)} 平方厘米` },
        ],
        conclusion: `正方形面积 = 边长 × 边长 = ${fmt(s)} 平方厘米。`,
      }
    }
    case 'area-unit': {
      const v = p.v ?? 300
      const dir = Math.round(p.dir ?? 0)
      const bigger = dir === 0
      const result = bigger ? v / 100 : v * 100
      const from = bigger ? '平方厘米' : '平方分米'
      const to = bigger ? '平方分米' : '平方厘米'
      return {
        value: result,
        text: `${fmt(v)} ${from} = ${fmt(result)} ${to}`,
        steps: [
          { expr: `1 ${bigger ? '平方分米' : '平方厘米'} = ${bigger ? 100 : 1 / 100} ${bigger ? '平方厘米' : '平方分米'}`.replace('= 0.01', '= 0.01'), result: '' },
          { expr: `${fmt(v)} ${bigger ? '÷' : '×'} 100`, result: `${fmt(result)} ${to}` },
        ],
        conclusion: `相邻面积单位的进率是 100：${fmt(v)} ${from} = ${fmt(result)} ${to}。`,
      }
    }

    /* ============ 三 周长与面积的变化 ============ */
    case 'peri-area-change': {
      const rows = Math.round(p.rows ?? 4)
      const total = 36
      const cols = total / rows
      const w = Math.max(cols, rows)
      const h = Math.min(cols, rows)
      const perimeter = (w + h) * 2
      return {
        value: perimeter,
        text: `长 ${fmt(cols)}、宽 ${fmt(rows)}：面积 ${fmt(total)}，周长 ${fmt(perimeter)}`,
        steps: [
          { expr: `36 个小正方形拼成长 × 宽`, result: `${fmt(cols)} × ${fmt(rows)}` },
          { expr: `面积 = ${fmt(cols)} × ${fmt(rows)}`, result: `${fmt(total)} 平方厘米` },
          { expr: `周长 = (长 + 宽) × 2`, result: `${fmt(perimeter)} 厘米` },
        ],
        conclusion: `面积都是 ${fmt(total)} 平方厘米，但周长不同；长和宽越接近，周长越短，正方形（6×6）时周长最短（24 厘米）。`,
      }
    }

    /* ============ 四 乘法数量关系 ============ */
    case 'mul-meaning': {
      const g = Math.round(p.groups ?? 3)
      const per = Math.round(p.per ?? 4)
      const total = g * per
      return {
        value: total,
        text: `${fmt(per)} × ${fmt(g)} = ${fmt(total)}`,
        steps: [
          { expr: `${fmt(per)} + ${fmt(per)} + … + ${fmt(per)}`, result: `${fmt(g)} 个相同加数` },
          { expr: `用乘法：${fmt(per)} × ${fmt(g)}`, result: `${fmt(total)}` },
        ],
        conclusion: `求 ${fmt(g)} 个 ${fmt(per)} 相加的和，用乘法计算比较简便：${fmt(per)} × ${fmt(g)} = ${fmt(total)}。`,
      }
    }
    case 'mul-total': {
      const price = p.price ?? 8
      const count = Math.round(p.count ?? 3)
      const total = price * count
      return {
        value: total,
        text: `${fmt(total)} 元`,
        steps: [
          { expr: `单价 = ${fmt(price)} 元`, result: `数量 = ${fmt(count)}` },
          { expr: `总价 = 单价 × 数量 = ${fmt(price)} × ${fmt(count)}`, result: `${fmt(total)} 元` },
        ],
        conclusion: `买 ${fmt(count)} 个（支），每个 ${fmt(price)} 元，一共 ${fmt(total)} 元。总价 = 单价 × 数量。`,
      }
    }
    case 'mul-distance': {
      const v = p.v ?? 70
      const t = Math.round(p.t ?? 4)
      const s = v * t
      const unit = p.unit ? '米' : '米'
      return {
        value: s,
        text: `${fmt(s)} ${unit}`,
        steps: [
          { expr: `速度 = ${fmt(v)} 米/分`, result: `时间 = ${fmt(t)} 分` },
          { expr: `路程 = 速度 × 时间 = ${fmt(v)} × ${fmt(t)}`, result: `${fmt(s)} ${unit}` },
        ],
        conclusion: `每分钟走 ${fmt(v)} 米，走 ${fmt(t)} 分钟，路程是 ${fmt(s)} ${unit}。`,
      }
    }
    case 'mul-solve': {
      const price = p.price ?? 6
      const count = Math.round(p.count ?? 5)
      const total = price * count
      return {
        value: total,
        text: `${fmt(total)} 元`,
        steps: [
          { expr: `先求单价：总价 ÷ 数量`, result: `（本题单价已给出 = ${fmt(price)} 元）` },
          { expr: `总价 = 单价 × 数量 = ${fmt(price)} × ${fmt(count)}`, result: `${fmt(total)} 元` },
        ],
        conclusion: `单价不变，买 ${fmt(count)} 本要 ${fmt(total)} 元。`,
      }
    }
    case 'travel-plan': {
      const person = Math.round(p.person ?? 3)
      const transport = p.transport ?? 400
      const ticket = p.ticket ?? 150
      const hotel = p.hotel ?? 300
      const days = Math.round(p.days ?? 2)
      const tCost = transport * person
      const tiCost = ticket * person
      const hCost = hotel * days
      const food = 80 * person * days
      const total = tCost + tiCost + hCost + food
      return {
        value: total,
        text: `旅游总费用约 ${fmt(total)} 元`,
        steps: [
          { expr: `交通 = ${fmt(transport)} × ${fmt(person)}`, result: `${fmt(tCost)} 元` },
          { expr: `门票 = ${fmt(ticket)} × ${fmt(person)}`, result: `${fmt(tiCost)} 元` },
          { expr: `住宿 = ${fmt(hotel)} × ${fmt(days)}`, result: `${fmt(hCost)} 元` },
          { expr: `餐费 ≈ ${fmt(food)} 元`, result: `合计 ${fmt(total)} 元` },
        ],
        conclusion: `${fmt(person)} 人外出 ${fmt(days)} 天，交通、门票、住宿和餐费合计约 ${fmt(total)} 元。`,
      }
    }

    /* ============ 五 混合运算 ============ */
    case 'mix-three': {
      const c = p.calligraphy ?? 18
      const t = Math.round(p.times ?? 2)
      const less = Math.round(p.less ?? 6)
      const paint = c * t
      const total = c + paint
      const choir = total - less
      return {
        value: choir,
        text: `合唱组 ${fmt(choir)} 人`,
        steps: [
          { expr: `绘画组 = ${fmt(c)} × ${fmt(t)}`, result: `${fmt(paint)} 人` },
          { expr: `书法 + 绘画 = ${fmt(c)} + ${fmt(paint)}`, result: `${fmt(total)} 人` },
          { expr: `合唱 = ${fmt(total)} − ${fmt(less)}`, result: `${fmt(choir)} 人` },
        ],
        conclusion: `先算乘法，再算加减：合唱组有 ${fmt(choir)} 人。`,
      }
    }
    case 'mix-bracket': {
      const money = p.money ?? 600
      const plane = p.plane ?? 126
      const pcount = Math.round(p.pcount ?? 4)
      const ship = p.ship ?? 48
      const planeCost = plane * pcount
      const rest = money - planeCost
      const n = Math.floor(rest / ship)
      return {
        value: n,
        text: `还能买 ${fmt(n)} 个舰船模型`,
        steps: [
          { expr: `飞机模型共 ${fmt(plane)} × ${fmt(pcount)}`, result: `${fmt(planeCost)} 元` },
          { expr: `剩下 ${fmt(money)} − ${fmt(planeCost)}`, result: `${fmt(rest)} 元` },
          { expr: `${fmt(rest)} ÷ ${fmt(ship)}`, result: `${fmt(n)} 个` },
        ],
        conclusion: `综合算式（${fmt(money)} − ${fmt(plane)} × ${fmt(pcount)}）÷ ${fmt(ship)}：先算小括号里面的乘法，再算减法，最后算除法，能买 ${fmt(n)} 个。`,
      }
    }
    case 'mix-segment': {
      const pear = p.pear ?? 20
      const less = Math.round(p.less ?? 12)
      const times = Math.round(p.times ?? 3)
      const orange = pear - less
      const sum = pear + orange
      const apple = sum * times
      return {
        value: apple,
        text: `苹果 ${fmt(apple)} 箱`,
        steps: [
          { expr: `橘子 = 梨 − 少 = ${fmt(pear)} − ${fmt(less)}`, result: `${fmt(orange)} 箱` },
          { expr: `梨 + 橘子 = ${fmt(pear)} + ${fmt(orange)}`, result: `${fmt(sum)} 箱` },
          { expr: `苹果 = ${fmt(sum)} × ${fmt(times)}`, result: `${fmt(apple)} 箱` },
        ],
        conclusion: `先用线段图分析：先求橘子，再求总和，最后乘倍数，苹果有 ${fmt(apple)} 箱。`,
      }
    }

    /* ============ 五 多位数的认识 ============ */
    case 'num-count': {
      const v = Math.round(p.v ?? 10000)
      const units: [number, string][] = [
        [1e11, '千亿'],
        [1e10, '百亿'],
        [1e9, '十亿'],
        [1e8, '亿'],
        [1e7, '千万'],
        [1e6, '百万'],
        [1e5, '十万'],
        [1e4, '万'],
        [1e3, '千'],
        [1e2, '百'],
        [1e1, '十'],
        [1, '一'],
      ]
      const hit = units.find(([u]) => v % u === 0 && v / u >= 1) ?? units[units.length - 1]!
      const k = v / hit[0]
      return {
        value: v,
        text: formatBig(v),
        steps: [
          { expr: `${formatBig(v)}`, result: `是 ${fmt(k)} 个${hit[1]}` },
          { expr: `每相邻两个计数单位之间的进率`, result: `都是 10（十进制计数法）` },
        ],
        conclusion: `${formatBig(v)} 里有 ${fmt(k)} 个${hit[1]}；每相邻两个计数单位之间的进率都是 10。`,
      }
    }
    case 'num-place': {
      const digit = Math.round(p.digit ?? 3)
      const place = Math.round(p.place ?? 4)
      const unit = COUNT_UNITS[place - 1] ?? '个'
      return {
        value: digit,
        text: `${fmt(digit)} 在${unit}位，表示 ${fmt(digit)} 个${unit}`,
        steps: [
          { expr: `从右边起第 ${fmt(place)} 位`, result: `${unit}位` },
          { expr: `计数单位`, result: `${unit}` },
          { expr: `${fmt(digit)} 表示`, result: `${fmt(digit)} 个${unit}` },
        ],
        conclusion: `数字 ${fmt(digit)} 写在${unit}位上，就表示 ${fmt(digit)} 个${unit}。`,
      }
    }
    case 'num-multidigit': {
      const wan = Math.round(p.wan ?? 1600)
      const yi = Math.round(p.yi ?? 0)
      const value = yi * 100000000 + wan * 10000
      return {
        value,
        text: formatBig(value),
        steps: [
          { expr: `万级：${fmt(wan)} 个万`, result: `${fmt(wan * 10000)}` },
          { expr: `亿级：${fmt(yi)} 个亿`, result: `${fmt(yi * 100000000)}` },
          { expr: `组成的数`, result: formatBig(value) },
        ],
        conclusion: `由 ${fmt(wan)} 个万${yi > 0 ? `和 ${fmt(yi)} 个亿` : ''}组成，写作 ${formatBig(value)}。`,
      }
    }
    case 'num-approx': {
      const v = Math.round(p.v ?? 384204)
      const wan = Math.round(v / 10000)
      return {
        value: wan * 10000,
        text: `${formatBig(v)} ≈ ${fmt(wan)} 万`,
        steps: [
          { expr: `${formatBig(v)} 的千位`, result: `${digitsOf(v)[3] ?? 0}` },
          { expr: `${(digitsOf(v)[3] ?? 0) >= 5 ? '向万位进 1' : '舍去千位及以后'}` , result: `${fmt(wan)} 万` },
        ],
        conclusion: `四舍五入到万位，${formatBig(v)} ≈ ${fmt(wan)} 万。`,
      }
    }
    case 'num-idcode': {
      const year = Math.round(p.year ?? 2016)
      const month = Math.round(p.month ?? 2)
      const day = Math.round(p.day ?? 18)
      const date = `${year}${pad2(month)}${pad2(day)}`
      return {
        value: year * 10000 + month * 100 + day,
        text: `出生日期码：${date}`,
        steps: [
          { expr: `前 6 位：行政区划代码`, result: `表示出生地` },
          { expr: `第 7~14 位：出生日期码`, result: `${date}` },
          { expr: `第 15~17 位：顺序码`, result: `第 17 位单数男、双数女` },
        ],
        conclusion: `身份证号码第 7~14 位是出生日期码 ${date}，年月日用两位数表示。`,
      }
    }

    /* ============ 八 度量衡 ============ */
    case 'measure-story': {
      const chi = p.chi ?? 5
      const sheng = p.sheng ?? 3
      const jin = p.jin ?? 4
      return {
        value: chi * 23 + sheng * 200 + jin * 250,
        text: `${fmt(chi)} 尺 ≈ ${fmt(chi * 23)} 厘米；${fmt(sheng)} 升 ≈ ${fmt(sheng * 200)} 毫升；${fmt(jin)} 斤 ≈ ${fmt(jin * 250)} 克`,
        steps: [
          { expr: `${fmt(chi)} 尺 × 23`, result: `${fmt(chi * 23)} 厘米` },
          { expr: `${fmt(sheng)} 升 × 200`, result: `${fmt(sheng * 200)} 毫升` },
          { expr: `${fmt(jin)} 斤 × 250`, result: `${fmt(jin * 250)} 克` },
        ],
        conclusion: `秦始皇统一度量衡后，1 尺约 23 厘米、1 升约 200 毫升、1 斤约 250 克，度量衡统一便于商品流通。`,
      }
    }

    /* ============ 九 大数的运算 ============ */
    case 'big-mul': {
      const num = Math.round(p.num ?? 128)
      const mult = Math.round(p.mult ?? 16)
      const t = Math.floor(mult / 10)
      const o = mult % 10
      const oProd = num * o
      const tProd = num * t
      const total = num * mult
      return {
        value: total,
        text: formatBig(total),
        steps: [
          { expr: `${fmt(num)} × ${fmt(o)}（个位）`, result: `${fmt(oProd)}` },
          { expr: `${fmt(num)} × ${fmt(t)}（十位）`, result: `${fmt(tProd)}0` },
          { expr: `两积相加`, result: `${fmt(oProd)} + ${fmt(tProd * 10)} = ${formatBig(total)}` },
        ],
        conclusion: `三位数乘两位数：先用个位上的数乘，再用十位上的数乘，最后把两次的积相加，结果是 ${formatBig(total)}。`,
      }
    }
    case 'big-calc': {
      const tens = Math.round(p.tens ?? 3)
      const n = tens * 10 + 5
      const square = n * n
      const prefix = tens * (tens + 1)
      return {
        value: square,
        text: `${fmt(n)} × ${fmt(n)} = ${fmt(square)}`,
        steps: [
          { expr: `积的末两位`, result: `25` },
          { expr: `前面的数 = 十位 × (十位 + 1) = ${fmt(tens)} × ${fmt(tens + 1)}`, result: `${fmt(prefix)}` },
          { expr: `结果 = ${fmt(prefix)} × 100 + 25`, result: `${fmt(square)}` },
        ],
        conclusion: `${fmt(n)} × ${fmt(n)}：末两位是 25，前面是 ${fmt(tens)} × ${fmt(tens + 1)} = ${fmt(prefix)}，所以等于 ${fmt(square)}。`,
      }
    }
    case 'big-1yi': {
      const sheets = Math.round(p.sheets ?? 1000000)
      const thick = p.thick ?? 1
      const cm = (sheets / 100) * thick
      const meters = cm / 100
      const everest = 8848
      return {
        value: meters,
        text: `${formatBig(sheets)} 张纸摞起来约 ${fmt(meters)} 米`,
        steps: [
          { expr: `每 100 张厚 ${fmt(thick)} 厘米`, result: `${formatBig(sheets)} ÷ 100 = ${fmt(sheets / 100)} 组` },
          { expr: `高度 = ${fmt(sheets / 100)} × ${fmt(thick)} 厘米`, result: `${fmt(cm)} 厘米` },
          { expr: `换算成米`, result: `${fmt(meters)} 米` },
        ],
        conclusion: `1 亿张纸摞起来约 ${fmt(100000000 / 100 * thick / 100)} 米，${meters >= everest ? `比珠穆朗玛峰（${fmt(everest)} 米）还高！` : `比珠穆朗玛峰（${fmt(everest)} 米）矮。`}`,
      }
    }
  }
}
