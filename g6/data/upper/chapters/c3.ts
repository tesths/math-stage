import type { LabDef } from '../schema/lab'

/** 三 数与运算的再认识（书页 30-41）+ 探索规律"二进制的秘密"（书页 42-43） */
export const c3Labs: LabDef[] = [
  {
    id: 'g6-c3-place-value',
    chapter: 'c3',
    page: 31,
    source: '例题',
    title: '数位与计数单位 · 数的组成',
    prompt:
      '231 = 2×100 + 3×10 + 1×1，3.36 = 3×1 + 3×0.1 + 6×0.01。整数、分数和小数都是用计数单位计数的。切换几个数，看看它们的组成。',
    kind: 'place-value',
    params: [{ key: 'sel', label: '选择数', min: 0, max: 4, step: 1, default: 0, unit: '0=231 1=2000 2=3.36 3=4.05 4=0.24' }],
    formula: '数 = 计数单位 × 计数单位的个数（各位相加）',
    tip: '相邻计数单位之间的进率都是 10；一个数可以看成若干个计数单位相加。',
  },
  {
    id: 'g6-c3-compare-unit',
    chapter: 'c3',
    page: 32,
    source: '例题',
    title: '数的大小比较 · 相同计数单位',
    prompt:
      '1000 > 923 是因为 1000 是 10 个百而 923 不足 10 个百；比较数的大小，就是比较相同计数单位的个数。切换几组数试一试。',
    kind: 'compare-unit',
    params: [
      { key: 'sel', label: '比较组', min: 0, max: 4, step: 1, default: 0, unit: '0整数 1小数A 2小数B 3分数A 4分数B' },
    ],
    formula: '比较相同计数单位的个数 → 转化力整数比较',
    tip: '分数和分母不同要先通分（化成相同的分数单位）；小数比较与整数比较方法一致。',
  },
  {
    id: 'g6-c3-op-consistency',
    chapter: 'c3',
    page: 38,
    source: '例题',
    title: '运算意义的一致性 · 计数单位',
    prompt:
      '20×3 = 2 个十 ×3 = 6 个十 = 60；1200÷3 = 12 个百 ÷3 = 4 个百 = 400。四则运算都要把相同计数单位的个数相加（减、乘、除）。',
    kind: 'op-consistency',
    params: [
      { key: 'sel', label: '示例选择', min: 0, max: 5, step: 1, default: 0, unit: '0乘整数 1乘分数 2除整数 3同单位除 4整数加 5小数加' },
    ],
    formula: '计数单位 × 计数单位的个数',
    tip: '加（减）法：相同计数单位个数相加减；乘法：积的计数单位是两因数计数单位的乘积；除法：同计数单位时可直接用个数相除。',
  },
  {
    id: 'g6-c3-binary',
    chapter: 'c3',
    page: 42,
    source: '探索',
    title: '二进制的秘密 · 满二进一',
    prompt:
      '计算机用二进制记数，按照"满二进一"的规则。十进制数 5 用二进制表示是多少？拖动滑块选择一个十进制数，看看它在计数器上的二进制写法。',
    kind: 'binary',
    params: [{ key: 'dec', label: '十进制数', min: 0, max: 31, step: 1, default: 5 }],
    formula: '二进制 = 十进制不断除以 2，倒序排列余数',
    tip: '二进制数都是由 0 和 1 组成；二进制（10）₂ 读作"一零"，表示十进制数 2。',
  },
]
