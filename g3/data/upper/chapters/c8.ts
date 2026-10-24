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
    tip: '整十、整百数除以一位数：先算前面的数，再看末尾有几个 0 就在商的末尾添几个 0。易错点：600 ÷ 2 算成 30。',
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
    tip: '从被除数的最高位除起，一位不够看两位；除到哪一位，商就写在哪一位的上面，每次余数都要比除数小。易错点：商写到错位（42 ÷ 3 的 1 写在个位上）。',
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
    tip: '三位数除以一位数：先除百位，百位不够就百位十位一起除；每步余下的数要和下一位合起来继续除。易错点：把余数丢掉不往下落。',
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
    tip: '余数必须比除数小：90 ÷ 4 = 22 余 2，用「商 × 除数 + 余数 = 被除数」验算。易错点：余数比除数还大（说明商小了）。',
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
    tip: '哪一位上不够商 1，就要在那一位上写 0 占位（306 ÷ 3 的十位）。易错点：漏写商中间的 0，把 102 写成 12。',
  },
]
