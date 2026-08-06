import type { LabDef } from '../schema/lab'

/** 六 两、三位数除以一位数（书页 68-85） */
export const c8Labs: LabDef[] = [
  {
    id: 'g3-c8-div-oral',
    chapter: 'c8',
    page: 69,
    source: '例题',
    title: '口算整十整百数除以一位数',
    prompt:
      '城西大道两侧对称地挂灯笼，一共挂了 600 个，每侧挂多少个？拖动整十/整百数与一位数，用"几个百"口算。',
    kind: 'div-oral',
    params: [
      { key: 'base', label: '被除数（整十整百）', min: 2, max: 900, step: 10, default: 600, unit: '' },
      { key: 'div', label: '一位数', min: 2, max: 9, step: 1, default: 2, unit: '' },
    ],
    formula: '整十整百数 ÷ 一位数',
    tip: '6 个百平均分成 2 份，每份 3 个百，就是 300。先算 6 ÷ 2，再在末尾添上 0 的个数。',
  },
  {
    id: 'g3-c8-div-pen',
    chapter: 'c8',
    page: 71,
    source: '例题',
    title: '笔算除法（除到十位有余）',
    prompt:
      '3 个香囊一共 42 元，每个多少元？拖动被除数的十位、个位和除数，观察竖式"先分几个十再分几个一"。',
    kind: 'div-pen',
    params: [
      { key: 'tens', label: '十位', min: 1, max: 9, step: 1, default: 4, unit: '' },
      { key: 'ones', label: '个位', min: 0, max: 9, step: 1, default: 2, unit: '' },
      { key: 'div', label: '一位数', min: 2, max: 9, step: 1, default: 3, unit: '' },
    ],
    formula: '(十位×10 + 个位) ÷ 一位数',
    tip: '42 ÷ 3：先分 3 个十，每份 1 个十；剩下的 1 个十和 2 个一合起来是 12，再分，每份 4 个一。',
  },
  {
    id: 'g3-c8-div-more',
    chapter: 'c8',
    page: 75,
    source: '例题',
    title: '三位数除以一位数',
    prompt:
      '星期六和星期日一共卖出 532 个中国结，平均每天卖出多少个？拖动三位数和除数，观察商的每一位。',
    kind: 'div-pen',
    params: [
      { key: 'h', label: '百位', min: 1, max: 9, step: 1, default: 5, unit: '' },
      { key: 't', label: '十位', min: 0, max: 9, step: 1, default: 3, unit: '' },
      { key: 'o', label: '个位', min: 0, max: 9, step: 1, default: 2, unit: '' },
      { key: 'div', label: '一位数', min: 2, max: 9, step: 1, default: 2, unit: '' },
    ],
    formula: '(百×100 + 十×10 + 个) ÷ 一位数',
    tip: '从被除数的最高位除起，一位不够看两位；除到哪一位，商就写在哪一位的上面。',
  },
  {
    id: 'g3-c8-remainder',
    chapter: 'c8',
    page: 72,
    source: '例题',
    title: '有余数的除法',
    prompt:
      '每块手帕 4 元，90 元可以买多少块，还剩几元？拖动被除数和除数，观察商与余数。',
    kind: 'remainder',
    params: [
      { key: 'total', label: '总数', min: 10, max: 99, step: 1, default: 90, unit: '元' },
      { key: 'div', label: '一位数', min: 2, max: 9, step: 1, default: 4, unit: '' },
    ],
    formula: '被除数 ÷ 除数 = 商 …… 余数',
    tip: '余数要比除数小。90 ÷ 4 = 22 …… 2，买 22 块手帕还剩 2 元。',
  },
  {
    id: 'g3-c8-div-zero',
    chapter: 'c8',
    page: 81,
    source: '例题',
    title: '商中间有 0 的除法',
    prompt:
      '3 天一共捏了 306 个面人，平均每天捏多少个？拖动数据，观察商中间为什么写 0。',
    kind: 'div-pen',
    params: [
      { key: 'h', label: '百位', min: 1, max: 9, step: 1, default: 3, unit: '' },
      { key: 't', label: '十位（0）', min: 0, max: 0, step: 1, default: 0, unit: '' },
      { key: 'o', label: '个位', min: 0, max: 9, step: 1, default: 6, unit: '' },
      { key: 'div', label: '一位数', min: 2, max: 9, step: 1, default: 3, unit: '' },
    ],
    formula: '(百×100 + 十×10 + 个) ÷ 一位数',
    tip: '306 ÷ 3：百位 3 ÷ 3 = 1，十位 0 ÷ 3 = 0，商中间要写 0 占位，再把 6 落下来。',
  },
]
