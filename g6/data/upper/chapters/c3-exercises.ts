import type { LabDef } from '../schema/lab'

/** 三 数与运算的再认识 · 练习题可视化（练习六 第 5、9 题） */
export const c3Exercises: LabDef[] = [
  {
    id: 'g6-c3-ex-div-to-mul',
    chapter: 'c3',
    page: 41,
    source: '练习',
    title: '除法转化成乘法',
    prompt:
      '先算一算，再说一说：4.8÷0.1 = 4.8×(  )，2.6÷2 = 2.6×(  )，1.5÷0.25 = 1.5×(  )，5.4÷10 = 5.4×(  )，3.6÷0.5 = 3.6×(  )，8÷4 = 8×(  )。拖动滑块换一组除数、再改一改被除数，看看除以一个数是不是都等于乘这个数的倒数。',
    kind: 'ex-c3-div-to-mul',
    params: [
      {
        key: 'divIdx',
        label: '除数（0=÷0.1 1=÷2 2=÷0.25 3=÷10 4=÷0.5 5=÷4）',
        min: 0,
        max: 5,
        step: 1,
        default: 0,
        unit: '',
      },
      { key: 'a', label: '被除数', min: 1, max: 12, step: 0.1, default: 4.8, unit: '' },
    ],
    fixed: {},
    formula: 'a ÷ b = a × (1/b)，其中 b × (1/b) = 1',
    tip: '除以一个不为 0 的数，等于乘这个数的倒数：b 与 1/b 相乘正好得 1，所以两条算式结果一定相同。',
  },
  {
    id: 'g6-c3-ex-frac-split',
    chapter: 'c3',
    page: 40,
    source: '练习',
    title: '和（差）是 7/12 的两个分数',
    prompt:
      '两个分数相加的和是 7/12，这两个分数可能各是几分之几？如果两个分数相减的差是 7/12 呢？拖动滑块把 7 个 1/12 分成两部分（或从更多份里去掉几份），看看一共有几种写法。',
    kind: 'ex-c3-frac-split',
    params: [
      { key: 'mode', label: '0 = 和是 7/12，1 = 差是 7/12', min: 0, max: 1, step: 1, default: 0, unit: '' },
      { key: 'a', label: '第一个分数（或减数）占几份', min: 1, max: 5, step: 1, default: 3, unit: '个 1/12' },
    ],
    fixed: { fd: 12, target: 7 },
    formula: 'a/12 + (7−a)/12 = 7/12 ；(a+7)/12 − a/12 = 7/12',
    tip: '同分母分数相加减，计数单位相同，只要把计数单位的个数相加减：7/12 就是 7 个 1/12，拆成 a 个与 (7−a) 个就是一组答案，答案不唯一。',
  },
]
