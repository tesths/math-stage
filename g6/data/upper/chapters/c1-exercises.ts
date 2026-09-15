import type { LabDef } from '../schema/lab'

/** 一 小数乘法和除法（二）· 练习题 Lab（练习一 / 练习二） */
export const c1Exercises: LabDef[] = [
  /** 练习二 第 15 题 */
  {
    id: 'g6-c1-ex-div11-cycle',
    chapter: 'c1',
    page: 13,
    source: '练习',
    title: '除以 11 的循环小数',
    prompt:
      '先用计算器算出 3÷11、4÷11，找出规律后直接写出 5÷11、6÷11、7÷11、8÷11 的商，并求它们的近似值（保留两位小数）。拖动滑块改变被除数，看商的小数部分怎样循环。',
    kind: 'ex-c1-div11-cycle',
    params: [
      { key: 'n', label: '被除数', min: 1, max: 10, step: 1, default: 3, unit: '' },
      { key: 'digits', label: '保留位数', min: 1, max: 3, step: 1, default: 2, unit: '' },
    ],
    fixed: { divisor: 11 },
    formula: 'n ÷ 11 = 0.9n9n…（循环节是 9n 两位数）；近似值保留 digits 位小数',
    tip: 'n÷11 的循环节正好是 9n：3÷11=0.2727…，4÷11=0.3636…。除到小数部分后余数重复出现，商就重复出现，这样的小数是循环小数，重复的数字就是循环节。',
  },
  /** 练习一 第 7 题 */
  {
    id: 'g6-c1-ex-pgram-area',
    chapter: 'c1',
    page: 5,
    source: '练习',
    title: '平行四边形面积估算',
    prompt:
      '一块平行四边形塑料板，底是 3.2 分米，高是 1.84 分米。它的面积大约是多少平方分米？（先估计，再计算，得数保留一位小数。）',
    kind: 'ex-c1-pgram-area',
    params: [
      { key: 'base', label: '底（分米）', min: 2, max: 5, step: 0.1, default: 3.2, unit: '分米' },
      { key: 'height', label: '高（分米）', min: 1, max: 3, step: 0.01, default: 1.84, unit: '分米' },
      { key: 'digits', label: '保留位数', min: 1, max: 2, step: 1, default: 1, unit: '' },
    ],
    fixed: {},
    formula: '面积 = 底 × 高，得数保留 digits 位小数',
    tip: '先估计：3.2≈3、1.84≈2，3×2=6；再算 3.2×1.84=5.888，保留一位小数是 5.9。估算能帮我们判断计算结果是否合理。',
  },
]
