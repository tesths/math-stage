import type { LabKind, ParamValues } from '@data/schema/lab'
import { DIRECTIONS, koujue, leftOf, numCn, oppositeOf, rightOf, splitDigits, toFixed2 } from '@/lib/engine/math'

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

export function computeLab(kind: LabKind, p: ParamValues): LabResult {
  switch (kind) {
    /* ============ 一 1~6的表内乘法 ============ */
    case 'groups': {
      const each = p.each ?? 2
      const groups = p.groups ?? 2
      const total = each * groups
      const add = Array.from({ length: groups }, () => `${fmt(each)}`).join(' + ')
      return {
        value: total,
        text: `${groups} 个 ${each} 相加 = ${each} × ${groups} = ${fmt(total)}`,
        steps: [
          { expr: `几个几？`, result: `${groups} 个 ${each} 相加` },
          { expr: `加法算式`, result: `${add} = ${fmt(total)}` },
          { expr: `乘法算式`, result: `${each} × ${groups} = ${fmt(total)}` },
        ],
        conclusion: `求 ${groups} 个 ${each} 相加的和，可以用乘法 ${each} × ${groups} 计算，得 ${total}。`,
      }
    }
    case 'mult-table': {
      const base = p.base ?? 5
      const n = p.n ?? 1
      const prod = base * n
      const kj = koujue(base, n)
      return {
        value: prod,
        text: `${base} × ${n} = ${fmt(prod)}`,
        steps: [
          { expr: `${n} 个 ${base} 相加`, result: `得 ${fmt(prod)}` },
          { expr: `乘法算式`, result: `${base} × ${n} = ${fmt(prod)}` },
          { expr: `乘法口诀`, result: `${kj}` },
        ],
        conclusion: `${n} 个 ${base} 是 ${fmt(prod)}，口诀：${kj}。`,
      }
    }

    /* ============ 二 1~6的表内除法 ============ */
    case 'divide-share': {
      const total = p.total ?? 8
      const groups = p.groups ?? 2
      const q = Math.floor(total / groups)
      const r = total % groups
      const each = q
      return {
        value: each,
        text: `把 ${total} 平均分成 ${groups} 份，每份 ${fmt(each)} 个${r > 0 ? `，还剩 ${fmt(r)} 个` : ''}`,
        steps: [
          { expr: `平均分成 ${groups} 份`, result: `每份同样多` },
          { expr: `每份几个 = 总数 ÷ 份数`, result: `${fmt(total)} ÷ ${fmt(groups)} = ${fmt(each)}${r > 0 ? ` …… ${fmt(r)}` : ''}` },
        ],
        conclusion:
          r > 0
            ? `平均分后还有剩余：每份 ${each} 个，还剩 ${r} 个（不能正好分完）。`
            : `${total} 正好平均分成 ${groups} 份，每份 ${each} 个，这是平均分。`,
      }
    }
    case 'divide-group': {
      const total = p.total ?? 8
      const per = p.per ?? 2
      const q = Math.floor(total / per)
      const r = total % per
      return {
        value: q,
        text: `每 ${per} 个一份，${total} 可以分成 ${fmt(q)} 份${r > 0 ? `，还剩 ${fmt(r)} 个` : ''}`,
        steps: [
          { expr: `把 ${total} 按每 ${per} 个一份圈`, result: `圈了 ${fmt(q)} 份${r > 0 ? `，剩 ${fmt(r)} 个` : ''}` },
          { expr: `份数 = 总数 ÷ 每份几个`, result: `${fmt(total)} ÷ ${fmt(per)} = ${fmt(q)}${r > 0 ? ` …… ${fmt(r)}` : ''}` },
        ],
        conclusion: `${total} 个物体，每 ${per} 个一份，可以分成 ${q} 份${r > 0 ? `，还剩 ${r} 个` : ''}。`,
      }
    }
    case 'quotient': {
      const b = p.b ?? 2
      const a = p.a ?? 4
      const prod = a * b
      const kj = koujue(a, b)
      return {
        value: a,
        text: `${fmt(prod)} ÷ ${fmt(b)} = ${fmt(a)}`,
        steps: [
          { expr: `想乘法口诀`, result: `${b} × （ ）= ${fmt(prod)}，即「${kj}」` },
          { expr: `括号里的数是几？`, result: `${fmt(a)}` },
          { expr: `商就是几`, result: `${fmt(prod)} ÷ ${fmt(b)} = ${fmt(a)}` },
        ],
        conclusion: `求商时想乘法口诀「${kj}」，${fmt(prod)} ÷ ${fmt(b)} = ${fmt(a)}。`,
      }
    }

    /* ============ 三 7~9的表内乘除法 / 期末复习 ============ */
    case 'table-calc': {
      const a = p.a ?? 6
      const b = p.b ?? 7
      const mode = Math.round(p.mode ?? 0)
      const prod = a * b
      const kj = koujue(a, b)
      const divide = mode === 1
      const value = divide ? b : prod
      return {
        value,
        text: divide ? `${fmt(prod)} ÷ ${fmt(a)} = ${fmt(b)}` : `${fmt(a)} × ${fmt(b)} = ${fmt(prod)}`,
        steps: divide
          ? [
              { expr: `乘法口诀`, result: `${kj}` },
              { expr: `${fmt(prod)} ÷ ${fmt(a)} = ?`, result: `想 ${fmt(a)} × （ ）= ${fmt(prod)}` },
              { expr: `得数`, result: `${fmt(b)}` },
            ]
          : [
              { expr: `乘法口诀`, result: `${kj}` },
              { expr: `${fmt(a)} × ${fmt(b)} = ?`, result: `${fmt(prod)}` },
            ],
        conclusion: divide
          ? `一句口诀「${kj}」还能算 ${fmt(prod)} ÷ ${fmt(b)} = ${fmt(a)}，共两道除法算式。`
          : `一句口诀「${kj}」能算乘法 ${a} × ${b} = ${prod}，还能算除法 ${prod} ÷ ${a} = ${b}。`,
      }
    }

    /* ============ 奇妙的七巧板 ============ */
    case 'tangram': {
      const sel = Math.round(p.sel ?? 0)
      // 图案表与 lib/labs/tangram.ts 的 ASSEMBLIES 一一对应，用哪几块板由真实拼法决定
      const defs = [
        { name: '正方形（7 块）', used: [1, 2, 3, 4, 5, 6, 7] as number[], area: 64 },
        { name: '长方形（③⑤④）', used: [3, 4, 5], area: 16 },
        { name: '正方形（③⑤）', used: [3, 5], area: 8 },
        { name: '平行四边形（③⑤）', used: [3, 5], area: 8 },
        { name: '三角形（③⑤）', used: [3, 5], area: 8 },
        { name: '三角形（③⑤⑦，和①一样大）', used: [3, 5, 7], area: 16 },
      ]
      const d = defs[Math.min(defs.length - 1, Math.max(0, sel))]!
      const names = d.used.map((n) => `${n}号板`).join('、')
      return {
        value: d.area,
        text: d.name,
        steps: [
          {
            expr: `七巧板的组成`,
            result: `7 块板：2 个大三角形、1 个中三角形、2 个小三角形、1 个正方形、1 个平行四边形`,
          },
          { expr: `用哪几块板`, result: `${names}（共 ${d.used.length} 块）` },
          { expr: `面积验算`, result: `这几块板的面积加起来 = ${d.area}，和目标图形的面积一样大` },
        ],
        conclusion: `同样的几块板能拼成不同的图形：③号和⑤号两块完全一样的三角形，既能拼成④号正方形，也能拼成⑥号平行四边形、⑦号中三角形。`,
      }
    }

    /* ============ 生活中的方向 ============ */
    case 'direction': {
      const face = Math.round(p.face ?? 0)
      const front = DIRECTIONS[face % 4]!
      const back = DIRECTIONS[oppositeOf(face % 4)]!
      const left = DIRECTIONS[leftOf(face % 4)]!
      const right = DIRECTIONS[rightOf(face % 4)]!
      return {
        value: face % 4,
        text: `面向${front}：前面是${front}，后面是${back}，左边是${left}，右边是${right}`,
        steps: [
          { expr: `前面（面向的方向）`, result: `${front}` },
          { expr: `后面 = 相对方向`, result: `${back}` },
          { expr: `左边 / 右边`, result: `${left} / ${right}` },
        ],
        conclusion: `东和西相对，南和北相对。面向${front}时，后面是${back}，左边是${left}，右边是${right}。`,
      }
    }

    /* ============ 四 认识三位数 ============ */
    case 'place-value': {
      const h = p.h ?? 1
      const t = p.t ?? 2
      const o = p.o ?? 4
      const value = h * 100 + t * 10 + o
      const parts = [
        h > 0 ? `${fmt(h)} 个百` : '',
        t > 0 ? `${fmt(t)} 个十` : '',
        o > 0 ? `${fmt(o)} 个一` : '',
      ].filter(Boolean)
      return {
        value,
        text: `${fmt(value)} 由 ${parts.join('、')} 组成`,
        steps: [
          { expr: `百位有 ${fmt(h)}`, result: `表示 ${fmt(h)} 个百` },
          { expr: `十位有 ${fmt(t)}`, result: `表示 ${fmt(t)} 个十` },
          { expr: `个位有 ${fmt(o)}`, result: `表示 ${fmt(o)} 个一` },
          { expr: `合起来`, result: `${fmt(h * 100)} + ${fmt(t * 10)} + ${fmt(o)} = ${fmt(value)}` },
        ],
        conclusion: value === 0 ? '0 表示这一位上没有数。' : `${fmt(value)} = ${parts.join(' + ')}。`,
      }
    }
    case 'compare': {
      const a = p.a ?? 402
      const b = p.b ?? 385
      const sign = a > b ? '>' : a < b ? '<' : '='
      const [ah, at, ao] = splitDigits(a)
      const [bh, bt, bo] = splitDigits(b)
      return {
        value: sign === '>' ? 1 : sign === '<' ? -1 : 0,
        text: `${fmt(a)} ${sign} ${fmt(b)}`,
        steps: [
          { expr: `先比百位`, result: `${fmt(ah)} ${ah > bh ? '>' : ah < bh ? '<' : '='} ${fmt(bh)}` },
          ...(ah === bh ? [{ expr: `百位相同，比十位`, result: `${fmt(at)} ${at > bt ? '>' : at < bt ? '<' : '='} ${fmt(bt)}` }] : []),
          ...(ah === bh && at === bt ? [{ expr: `十位相同，比个位`, result: `${fmt(ao)} ${ao > bo ? '>' : ao < bo ? '<' : '='} ${fmt(bo)}` }] : []),
          { expr: `结论`, result: `${fmt(a)} ${sign} ${fmt(b)}` },
        ],
        conclusion: `比较三位数的大小：先比百位，百位相同比十位，十位相同比个位。${fmt(a)} ${sign} ${fmt(b)}。`,
      }
    }
    case 'abacus': {
      const sel = Math.round(p.sel ?? 0)
      const defs = [
        { num: 5, how: '个位上 1 颗上珠表示 5' },
        { num: 105, how: '百位 1、个位 5（上珠）' },
        { num: 234, how: '百位 2、十位 3、个位 4' },
        { num: 360, how: '百位 3、十位 6（上珠+下珠）、个位 0' },
        { num: 999, how: '百位 9、十位 9、个位 9（都含上珠）' },
      ]
      const d = defs[sel]!
      const [h, t, o] = splitDigits(d.num)
      const bead = (v: number) => ({ upper: v >= 5 ? 1 : 0, lower: v % 5 })
      return {
        value: d.num,
        text: `${d.num}：${d.how}`,
        steps: [
          { expr: `一颗下珠表示 1`, result: `一颗上珠表示 5` },
          { expr: `百位`, result: `拨 ${h}（上珠 ${bead(h).upper} 颗 + 下珠 ${bead(h).lower} 颗）` },
          { expr: `十位`, result: `拨 ${t}（上珠 ${bead(t).upper} 颗 + 下珠 ${bead(t).lower} 颗）` },
          { expr: `个位`, result: `拨 ${o}（上珠 ${bead(o).upper} 颗 + 下珠 ${bead(o).lower} 颗）` },
        ],
        conclusion: `算盘上：上珠 1 颗表示 5，下珠 1 颗表示 1。读作 ${d.num}。`,
      }
    }

    /* ============ 五 两位数加、减两位数 ============ */
    case 'twodigit-add': {
      const a = (p.ta ?? 3) * 10 + (p.oa ?? 4)
      const b = (p.tb ?? 2) * 10 + (p.ob ?? 8)
      const tSum = (p.ta ?? 3) + (p.tb ?? 2)
      const oSum = (p.oa ?? 4) + (p.ob ?? 8)
      const carry = oSum >= 10
      const value = a + b
      const oRes = oSum % 10
      const tRes = tSum + (carry ? 1 : 0)
      return {
        value,
        text: `${fmt(a)} + ${fmt(b)} = ${fmt(value)}`,
        steps: [
          { expr: `个位相加`, result: `${fmt(p.oa ?? 4)} + ${fmt(p.ob ?? 8)} = ${fmt(oSum)}${carry ? '，满十进 1' : ''}` },
          { expr: `十位相加`, result: `${fmt(p.ta ?? 3)} + ${fmt(p.tb ?? 2)} = ${fmt(tSum)}${carry ? `，再加进上来的 1，得 ${fmt(tRes)}` : ''}` },
          { expr: `合起来`, result: `${fmt(tRes)} 个十 + ${fmt(oRes)} 个一 = ${fmt(value)}` },
        ],
        conclusion: `个位相加满十要向十位进 1。${fmt(a)} + ${fmt(b)} = ${fmt(value)}。`,
      }
    }
    case 'twodigit-sub': {
      const ta = p.ta ?? 5
      const oa = p.oa ?? 4
      const tb = p.tb ?? 3
      const ob = p.ob ?? 6
      const a = ta * 10 + oa
      const b = tb * 10 + ob
      // 旧实现：a < b 时悄悄把两个数调换再相减，还教「大数减小数」——
      // 54 − 36 与 36 − 54 是两个不同的减法，调换后算出来的差是错的（P0）。
      if (a < b) {
        return {
          value: a - b,
          text: `${fmt(a)} - ${fmt(b)} = ？（本册不学负数）`,
          steps: [
            { expr: `先比大小`, result: `${fmt(a)} < ${fmt(b)}，被减数比减数小` },
            { expr: `怎么办`, result: `被减数要大于或等于减数才能用退位减法，先把被减数调大再算` },
          ],
          conclusion: `被减数 ${fmt(a)} 比减数 ${fmt(b)} 小：本册不学负数，请先把被减数调大一些再减。`,
        }
      }
      const borrow = oa < ob
      const oBorrowed = borrow ? oa + 10 : oa
      const oRes = borrow ? oa + 10 - ob : oa - ob
      const tRes = ta - (borrow ? 1 : 0) - tb
      const value = a - b
      return {
        value,
        text: `${fmt(a)} - ${fmt(b)} = ${fmt(value)}`,
        steps: [
          {
            expr: `个位相减`,
            result: borrow
              ? `${fmt(oa)} 不够减 ${fmt(ob)}，从十位退 1 当 10：${fmt(oBorrowed)} - ${fmt(ob)} = ${fmt(oRes)}`
              : `${fmt(oa)} - ${fmt(ob)} = ${fmt(oRes)}`,
          },
          {
            expr: `十位相减`,
            result: borrow
              ? `${fmt(ta)} 退 1 得 ${fmt(ta - 1)}，${fmt(ta - 1)} - ${fmt(tb)} = ${fmt(tRes)}`
              : `${fmt(ta)} - ${fmt(tb)} = ${fmt(tRes)}`,
          },
          { expr: `合起来`, result: `${fmt(tRes)} 个十 + ${fmt(oRes)} 个一 = ${fmt(value)}` },
        ],
        conclusion: borrow
          ? `个位不够减，从十位退 1 当 10。${fmt(a)} - ${fmt(b)} = ${fmt(value)}。`
          : `个位够减，直接相减。${fmt(a)} - ${fmt(b)} = ${fmt(value)}。`,
      }
    }

    /* ============ 欢乐购物街 ============ */
    case 'money': {
      const sel = Math.round(p.sel ?? 0)
      const defs = [
        { name: '1 元', note: '1 元 = 10 角', icon: '💴' },
        { name: '1 角', note: '1 角 = 10 分', icon: '🪙' },
        { name: '5 元', note: '5 元 = 5 个 1 元', icon: '💵' },
        { name: '10 元', note: '10 元 = 10 个 1 元', icon: '💵' },
        { name: '100 元', note: '100 元 = 10 个 10 元', icon: '💯' },
        { name: '50 元', note: '50 元 = 5 个 10 元', icon: '💵' },
      ]
      const d = defs[sel]!
      return {
        value: sel,
        text: `${d.icon} ${d.name} · ${d.note}`,
        steps: [
          { expr: `人民币的单位`, result: `元、角、分` },
          { expr: `进率`, result: `1 元 = 10 角，1 角 = 10 分` },
          { expr: `面额`, result: `${d.name}：${d.note}` },
        ],
        conclusion: `购物用人民币：1 元 = 10 角，1 角 = 10 分。${d.name} 就是 ${d.note}。`,
      }
    }
    case 'money-calc': {
      const price = p.price ?? 6
      const paid = p.paid ?? 10
      const change = paid - price
      const enough = change >= 0
      return {
        value: enough ? change : 0,
        text: enough ? `付 ${fmt(paid)} 元，应找回 ${fmt(change)} 元` : `付 ${fmt(paid)} 元不够，还差 ${fmt(-change)} 元`,
        steps: [
          { expr: `商品价格`, result: `${fmt(price)} 元` },
          { expr: `付出的钱`, result: `${fmt(paid)} 元` },
          { expr: enough ? `找回 = 付出 - 价格` : `还差 = 价格 - 付出`, result: `${fmt(paid)} - ${fmt(price)} = ${fmt(Math.abs(change))} 元` },
        ],
        conclusion: enough
          ? `应付 ${price} 元，付 ${paid} 元，找回 ${change} 元。`
          : `付的钱比价格少，钱不够，还差 ${-change} 元。`,
      }
    }

    /* ============ 六 有余数的除法 ============ */
    case 'remainder': {
      const total = p.total ?? 10
      const per = p.per ?? 3
      const q = Math.floor(total / per)
      const r = total % per
      return {
        value: q,
        text: `${fmt(total)} ÷ ${fmt(per)} = ${fmt(q)} …… ${fmt(r)}`,
        steps: [
          { expr: `${fmt(total)} 里最多有 ${fmt(q)} 个 ${fmt(per)}`, result: `分给 ${fmt(q)} 份` },
          { expr: `剩下`, result: `${fmt(total)} - ${fmt(q * per)} = ${fmt(r)}` },
          { expr: `除法算式`, result: `${fmt(total)} ÷ ${fmt(per)} = ${fmt(q)} …… ${fmt(r)}` },
        ],
        conclusion: `${total} 个，每 ${per} 个一份，分给 ${q} 份，还剩 ${r} 个。余数 ${r} 比除数 ${per} 小。`,
      }
    }
    case 'remainder-rule': {
      const d = p.d ?? 3
      const maxR = d - 1
      const list = Array.from({ length: d }, (_, i) => `余 ${i}`).join('、')
      return {
        value: maxR,
        text: `除以 ${fmt(d)}，余数最大是 ${fmt(maxR)}（余数有 ${list}）`,
        steps: [
          { expr: `被除数 ÷ ${fmt(d)}`, result: `余数只可能是 0 ~ ${fmt(maxR)}` },
          { expr: `余数最大`, result: `${fmt(maxR)}` },
          { expr: `余数比除数`, result: `余数 ${fmt(maxR)} < 除数 ${fmt(d)}` },
        ],
        conclusion: `余数都比除数小：除以 ${d}，余数最大是 ${maxR}（= 除数 - 1）。`,
      }
    }
  }
}
