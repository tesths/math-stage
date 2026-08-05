import type { LabDef } from '../schema/lab'

/** 二 两、三位数乘一位数（书页 17-30） */
export const c3Labs: LabDef[] = [
  {
    id: 'g3-c3-mul-oral',
    chapter: 'c3',
    page: 18,
    source: '例题',
    title: '口算整十整百数乘一位数',
    prompt:
      '东林村在 3 条主干道路各安装了 40 盏路灯，一共安装多少盏？拖动整十/整百数与一位数，观察用"几个十"口算。',
    kind: 'mul-oral',
    params: [
      { key: 'base', label: '因数（整十整百）', min: 2, max: 900, step: 10, default: 40, unit: '' },
      { key: 'count', label: '一位数', min: 2, max: 9, step: 1, default: 3, unit: '' },
    ],
    formula: '整十整百数 × 一位数',
    tip: '4 个十乘 3 得 12 个十，就是 120。先算 4 × 3，再在末尾添上 0 的个数。',
  },
  {
    id: 'g3-c3-mul-estimate',
    chapter: 'c3',
    page: 19,
    source: '例题',
    title: '乘法估算',
    prompt:
      '王叔叔带 120 元，够买 4 个每个 28 元的节能灯泡吗？拖动单价和数量，用"四舍五入"估算判断。',
    kind: 'mul-oral',
    params: [
      { key: 'price', label: '单价', min: 11, max: 99, step: 1, default: 28, unit: '元' },
      { key: 'count', label: '数量', min: 2, max: 9, step: 1, default: 4, unit: '个' },
      { key: 'money', label: '带的钱', min: 40, max: 400, step: 10, default: 120, unit: '元' },
    ],
    formula: '单价（四舍五入）× 数量 ≤ 带的钱',
    tip: '把 28 看作接近的整十数 30，30 × 4 = 120，28 × 4 < 120，够买。',
  },
  {
    id: 'g3-c3-mul-pen',
    chapter: 'c3',
    page: 21,
    source: '例题',
    title: '笔算两位数乘一位数',
    prompt:
      '鹅有 14 只，鸡的只数是鹅的 3 倍。拖动十位、个位和乘数，观察竖式"用一位数依次去乘"的过程。',
    kind: 'mul-pen',
    params: [
      { key: 'tens', label: '十位', min: 1, max: 9, step: 1, default: 1, unit: '' },
      { key: 'ones', label: '个位', min: 0, max: 9, step: 1, default: 4, unit: '' },
      { key: 'multi', label: '一位数', min: 2, max: 9, step: 1, default: 3, unit: '' },
    ],
    formula: '(十位×10 + 个位) × 一位数',
    tip: '用一位数依次去乘个位、十位上的数；哪一位乘得的数满几十，就向前一位进几。',
  },
  {
    id: 'g3-c3-mul-carry',
    chapter: 'c3',
    page: 24,
    source: '例题',
    title: '连续进位的笔算乘法',
    prompt:
      '每块地种植 234 棵葡萄，3 块地一共种植多少棵？拖动百位、十位、个位和乘数，观察连续进位的竖式。',
    kind: 'mul-pen',
    params: [
      { key: 'h', label: '百位', min: 1, max: 9, step: 1, default: 2, unit: '' },
      { key: 't', label: '十位', min: 0, max: 9, step: 1, default: 3, unit: '' },
      { key: 'o', label: '个位', min: 0, max: 9, step: 1, default: 4, unit: '' },
      { key: 'multi', label: '一位数', min: 2, max: 9, step: 1, default: 3, unit: '' },
    ],
    formula: '(百×100 + 十×10 + 个) × 一位数',
    tip: '3 个 234：4 × 3 = 12 满十进 1，十位 3 × 3 + 1 = 10 再进 1，百位 2 × 3 + 1 = 7。',
  },
  {
    id: 'g3-c3-mul-zero',
    chapter: 'c3',
    page: 27,
    source: '例题',
    title: '中间或末尾有 0 的乘法',
    prompt:
      '每个大棚种植 102 棵茄子（或 120 棵番茄）。拖动数据，观察中间/末尾有 0 时怎样简便计算。',
    kind: 'mul-pen',
    params: [
      { key: 'h', label: '百位', min: 1, max: 9, step: 1, default: 1, unit: '' },
      { key: 'mid', label: '十位（中间 0）', min: 0, max: 0, step: 1, default: 0, unit: '' },
      { key: 'o', label: '个位', min: 0, max: 9, step: 1, default: 2, unit: '' },
      { key: 'multi', label: '一位数', min: 2, max: 9, step: 1, default: 4, unit: '' },
    ],
    formula: '(百×100 + 十×10 + 个) × 一位数',
    tip: '十位是 0：0 × 4 = 0，直接在积的十位写 0；末尾有 0 可以先算前面，再在末尾添 0。',
  },
]
