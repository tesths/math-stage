import type { LabDef } from '../schema/lab'

/** 六 大数的运算（书页 94-108） */
export const c9Labs: LabDef[] = [
  {
    id: 'g4-c9-big-mul',
    chapter: 'c9',
    page: 96,
    source: '例题',
    title: '三位数乘两位数 · 小区住户',
    prompt:
      '月星小区有 16 幢楼，平均每幢楼住 128 户，一共住了多少户？拖动幢数和每幢户数，观察三位数乘两位数的竖式。',
    kind: 'big-mul',
    params: [
      { key: 'num', label: '每幢户数', min: 100, max: 999, step: 1, default: 128, unit: '户' },
      { key: 'mult', label: '幢数', min: 11, max: 99, step: 1, default: 16, unit: '幢' },
    ],
    formula: '128 × 16 = 128 × 10 + 128 × 6',
    tip: '三位数乘两位数：先用个位上的数乘，再用十位上的数乘，最后把两次的积相加。',
  },
  {
    id: 'g4-c9-big-calc',
    chapter: 'c9',
    page: 101,
    source: '例题',
    title: '用计算器探索规律 · 有趣的乘法',
    prompt:
      '15×15=225，25×25=625，35×35=1225。拖动个位是 5 的乘数，观察"积的末两位都是 25，前面是十位×(十位+1)"的规律。',
    kind: 'big-calc',
    params: [
      { key: 'tens', label: '乘数十位', min: 1, max: 20, step: 1, default: 3, unit: '' },
    ],
    formula: '(十位 n)5 × (十位 n)5 = n×(n+1)×100 + 25',
    tip: '十位是 n 的数（如 35=30+5）乘本身：末两位是 25，前面是 n×(n+1)。如 35×35 = 3×4×100 + 25 = 1225。',
  },
  {
    id: 'g4-c9-big-1yi',
    chapter: 'c9',
    page: 105,
    source: '探索',
    title: '1 亿有多大 · 推算',
    prompt:
      '100 张普通白纸叠起来约 1 厘米厚。拖动纸的张数，推算 1 亿张纸摞起来有多高，和珠穆朗玛峰（约 8848 米）比一比。',
    kind: 'big-1yi',
    params: [
      { key: 'sheets', label: '纸的张数', min: 100, max: 100000000, step: 100, default: 1000000, unit: '张' },
      { key: 'thick', label: '100张厚度', min: 1, max: 3, step: 0.1, default: 1, unit: '厘米' },
    ],
    formula: '高度 = 张数 ÷ 100 × 100张厚度',
    tip: '1 亿张纸摞起来约 10000 米，比珠穆朗玛峰（8848 米）还高，通过实验和推算感受 1 亿有多大。',
  },
]
