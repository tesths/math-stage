/**
 * 二年级 Lab 的「过程态」纯函数（分一分 / 进一进 / 退一退 / 拨一拨 / 找零 / 比一比 / 转一转）
 *
 * 这些函数只算数据，不碰 DOM：组件按返回的步骤把图形一步一步画出来，
 * 单测直接断言「第 k 步之后盘子里的数 / 珠子的数 / 钱数是多少」，
 * 保证过程态不是「换一句话」，而是同一份数据算出来的另一帧。
 */

/** 每一步的通用结构 */
export interface ProcStep<T> {
  /** 这一步做完之后的状态 */
  state: T
  /** 这一步在做什么（可直接念给学生听） */
  say: string
}

/* ---------------- 一 认识乘法 / 乘法口诀：一组一组地数 ---------------- */

export interface CountOnState {
  /** 已经数了几组 */
  rows: number
  /** 连加算式（只写已经数过的那几组） */
  expr: string
  /** 累加和 */
  sum: number
}

/**
 * 几个几：第 k 步点亮 k 组，连加式子同步变长。
 * 课本 p2「2+2+2+2」/ p10「1 个 5 是 5，2 个 5 相加得 10」都是这个动作。
 */
export function countOn(each: number, rows: number): ProcStep<CountOnState>[] {
  const n = Math.max(0, Math.round(rows))
  return Array.from({ length: n }, (_, i) => {
    const k = i + 1
    return {
      state: {
        rows: k,
        expr: Array.from({ length: k }, () => `${each}`).join(' + '),
        sum: each * k,
      },
      say: k === 1 ? `第 1 组：${each}` : `再添一组 ${each}：${each * k}`,
    }
  })
}

/* ---------------- 二 平均分：一轮一轮地分 ---------------- */

export interface ShareState {
  /** 第几轮 */
  round: number
  /** 每份已有的个数 */
  each: number
  /** 已经分掉几个 */
  placed: number
  /** 还剩下的个数 */
  left: number
}

/**
 * 平均分给 groups 份：每轮每份分 1 个（课本 p20「先拿 2 个，每只松鼠分 1 个，再照这样接着分」）。
 * 分不完的余数留在筐里。
 */
export function shareRounds(total: number, groups: number): ProcStep<ShareState>[] {
  const g = Math.max(1, Math.round(groups))
  const t = Math.max(0, Math.round(total))
  const rounds = Math.floor(t / g)
  const rest = t % g
  const steps: ProcStep<ShareState>[] = []
  for (let r = 1; r <= rounds; r++) {
    steps.push({
      state: { round: r, each: r, placed: r * g, left: t - r * g },
      say: `第 ${r} 轮：每份再分 1 个，每份 ${r} 个，还剩 ${t - r * g} 个`,
    })
  }
  if (rest > 0) {
    steps.push({
      state: { round: rounds + 1, each: rounds, placed: rounds * g, left: rest },
      say: `只剩 ${rest} 个，不够再给每份分 1 个了：每份 ${rounds} 个，还剩 ${rest} 个`,
    })
  }
  return steps
}

/* ---------------- 二 每几个一份：一份一份地圈 ---------------- */

export interface ChunkState {
  /** 已经圈了几份 */
  groups: number
  /** 圈进去的个数（按顺序） */
  circled: number[]
  /** 剩下的个数 */
  left: number
}

/**
 * 每 per 个一份：第 k 步圈住前 k*per 个。
 * 课本 p22/p30「10 块，每 2 块一份，分成了几份」。
 */
export function chunkGroups(total: number, per: number): ProcStep<ChunkState>[] {
  const p = Math.max(1, Math.round(per))
  const t = Math.max(0, Math.round(total))
  const q = Math.floor(t / p)
  const steps: ProcStep<ChunkState>[] = []
  for (let k = 1; k <= q; k++) {
    steps.push({
      state: {
        groups: k,
        circled: Array.from({ length: k * p }, (_, i) => i),
        left: t - k * p,
      },
      say: `圈第 ${k} 份：放进 ${p} 个，还剩 ${t - k * p} 个`,
    })
  }
  return steps
}

/* ---------------- 二 用口诀求商：一辆一辆地装 ---------------- */

export interface PackState {
  cars: number
  used: number
  left: number
  koujue: string
}

/**
 * 每辆自行车装 per 个车轮，一个一个装（课本 p28「8 个车轮能安装几辆」）。
 * 装到第 k 辆时，被用掉 k*per 个，剩下 t-k*per 个。
 */
export function packUp(per: number, count: number, koujue: (a: number, b: number) => string): ProcStep<PackState>[] {
  const p = Math.max(1, Math.round(per))
  const c = Math.max(0, Math.round(count))
  const total = p * c
  const steps: ProcStep<PackState>[] = []
  for (let k = 1; k <= c; k++) {
    steps.push({
      state: {
        cars: k,
        used: k * p,
        left: total - k * p,
        koujue: koujue(p, k),
      },
      say: `装第 ${k} 辆：又用掉 ${p} 个，一共用 ${k * p} 个，还剩 ${total - k * p} 个`,
    })
  }
  return steps
}

/* ---------------- 五 两位数加、减两位数：进位与退位 ---------------- */

export interface AddState {
  a: number
  b: number
  oSum: number
  carry: boolean
  oRes: number
  tSum: number
  tRes: number
  value: number
}

/** 两位数加两位数：个位相加 → 满十进 1 → 十位相加 */
export function carryAdd(ta: number, oa: number, tb: number, ob: number): AddState {
  const oSum = oa + ob
  const carry = oSum >= 10
  const tSum = ta + tb
  return {
    a: ta * 10 + oa,
    b: tb * 10 + ob,
    oSum,
    carry,
    oRes: oSum % 10,
    tSum,
    tRes: tSum + (carry ? 1 : 0),
    value: (ta * 10 + oa) + (tb * 10 + ob),
  }
}

export interface SubState {
  a: number
  b: number
  /** 被减数不小于减数才做退位减法（本册不学负数） */
  ok: boolean
  borrow: boolean
  oRes: number
  tRes: number
  value: number
  /** 个位退 1 之后变成多少（14 表示 4+10） */
  oBorrowed: number
}

/**
 * 两位数减两位数：个位不够减就从十位退 1。
 * 若被减数 < 减数，ok=false —— 旧实现把两个数悄悄调换再相减，算出来的是错的答案（P0）。
 */
export function borrowSub(ta: number, oa: number, tb: number, ob: number): SubState {
  const a = ta * 10 + oa
  const b = tb * 10 + ob
  const ok = a >= b
  const borrow = oa < ob
  const oRes = borrow ? oa + 10 - ob : oa - ob
  const tRes = tb + (borrow ? 1 : 0)
  return {
    a,
    b,
    ok,
    borrow,
    oRes,
    tRes,
    value: a - b,
    oBorrowed: borrow ? oa + 10 : oa,
  }
}

/* ---------------- 四 认识三位数：满十进一 / 逐位读数 ---------------- */

export interface PlaceState {
  h: number
  t: number
  o: number
  value: number
  /** 十位是否由 10 个「一」捆成 */
  regrouped: boolean
}

/**
 * 数位表满十进一：把 10 个「一」捆成 1 个「十」。
 * 只演示「个位满十」这一条进率，课本 p65 的眼睛点。
 */
export function carryTen(t: number, o: number): PlaceState {
  const regrouped = o >= 10
  return {
    h: 0,
    t: t + (regrouped ? Math.floor(o / 10) : 0),
    o: o % 10,
    value: t * 10 + o,
    regrouped,
  }
}

/** 三位数的逐位读数（从高位起，一档一档拨） */
export function placeReading(n: number): { place: string; digit: number; say: string; running: number }[] {
  const h = Math.floor(n / 100) % 10
  const t = Math.floor(n / 10) % 10
  const o = n % 10
  const rows = [
    { place: '百位', digit: h, say: `${h} 个百是 ${h * 100}` },
    { place: '十位', digit: t, say: `${t} 个十是 ${t * 10}` },
    { place: '个位', digit: o, say: `${o} 个一是 ${o}` },
  ]
  let running = 0
  return rows.map((r) => {
    running += r.digit * (r.place === '百位' ? 100 : r.place === '十位' ? 10 : 1)
    return { ...r, running }
  })
}

/* ---------------- 四 算盘：一颗上珠 5、一颗下珠 1 ---------------- */

export interface BeadState {
  place: string
  digit: number
  upper: number
  lower: number
  /** 这一档表示多少 */
  value: number
  /** 累计到这一档的数 */
  running: number
}

/** 把一个三位数拆成算盘三档的珠子（上珠 1 颗 = 5，下珠至多 4 颗） */
export function abacusBeads(n: number): BeadState[] {
  const digits = [Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10]
  const places = ['百位', '十位', '个位']
  const weights = [100, 10, 1]
  let running = 0
  return digits.map((d, i) => {
    const value = d * weights[i]!
    running += value
    return {
      place: places[i]!,
      digit: d,
      upper: d >= 5 ? 1 : 0,
      lower: d % 5,
      value,
      running,
    }
  })
}

/* ---------------- 八 欢乐购物街：换钱与找零 ---------------- */

export interface ChangeState {
  price: number
  paid: number
  enough: boolean
  change: number
  /** 还差多少（不够时） */
  short: number
}

/** 找回 = 付出 − 价格；不够时给出还差多少 */
export function changeOf(price: number, paid: number): ChangeState {
  const enough = paid >= price
  return {
    price,
    paid,
    enough,
    change: enough ? paid - price : 0,
    short: enough ? 0 : price - paid,
  }
}

/** 1 元换 10 角：换 k 次就有 k*10 角 */
export function exchangeYuan(yuan: number, times: number): { jiao: number; kept: number; say: string } {
  const k = Math.max(0, Math.round(times))
  const jiao = k * 10
  return {
    jiao,
    kept: Math.max(0, yuan - k),
    say: `把 ${k} 张 1 元换成 ${jiao} 个 1 角：1 元 = 10 角`,
  }
}

/* ---------------- 六 有余数的除法：余数一个一个地走 ---------------- */

export interface RemainderState {
  /** 被除数 = 除数*商 + 余数 */
  dividend: number
  quotient: number
  remainder: number
  /** 余数是否等于除数（此时还能再分一份） */
  full: boolean
}

/** 用小棒摆三角形那样，除数固定、被除数从 q*d 起一个一个加，看余数怎么变 */
export function remainderCycle(d: number, q = 3): RemainderState[] {
  const div = Math.max(2, Math.round(d))
  const base = Math.max(1, Math.round(q)) * div
  return Array.from({ length: div + 1 }, (_, i) => ({
    dividend: base + i,
    quotient: Math.round((base + i - (i % div)) / div),
    remainder: i % div,
    full: i === div,
  }))
}

/* ---------------- 四 三位数比大小：一位一位地比 ---------------- */

export interface CompareStep {
  place: string
  left: number
  right: number
  relation: '>' | '<' | '='
  /** 是否在这一位分出了大小 */
  decided: boolean
}

/** 从百位开始逐位比较，返回每一步 */
export function comparePlaces(a: number, b: number): CompareStep[] {
  const da = [Math.floor(a / 100) % 10, Math.floor(a / 10) % 10, a % 10]
  const db = [Math.floor(b / 100) % 10, Math.floor(b / 10) % 10, b % 10]
  const places = ['百位', '十位', '个位']
  const steps: CompareStep[] = []
  for (let i = 0; i < 3; i++) {
    const left = da[i]!
    const right = db[i]!
    const relation = left > right ? '>' : left < right ? '<' : '='
    steps.push({ place: places[i]!, left, right, relation, decided: relation !== '=' })
    if (relation !== '=') return steps // 高位已经分出大小，后面的位不用再比
  }
  return steps
}

/* ---------------- 生活中的方向：一次向右转 ---------------- */

/** 0 东 1 南 2 西 3 北（顺时针）；向右转 = 顺时针一步 */
export function turnRight(face: number): number {
  return (Math.round(face) + 1) % 4
}

/** 面向 d 时前/后/左/右 四个方向 */
export function surroundings(face: number): { front: number; back: number; left: number; right: number } {
  const f = ((Math.round(face) % 4) + 4) % 4
  return { front: f, back: (f + 2) % 4, left: (f + 3) % 4, right: (f + 1) % 4 }
}

/* ---------------- 三 表内乘除：一句口诀写三道算式 ---------------- */

export interface FormulaState {
  koujue: string
  multiply: string
  divideA: string
  divideB: string
  /** 两个乘数相同时只有一种除法 */
  single: boolean
}

export function fromKoujue(a: number, b: number, koujue: (x: number, y: number) => string): FormulaState {
  const prod = a * b
  return {
    koujue: koujue(a, b),
    multiply: `${a} × ${b} = ${prod}`,
    divideA: `${prod} ÷ ${a} = ${b}`,
    divideB: `${prod} ÷ ${b} = ${a}`,
    single: a === b,
  }
}
