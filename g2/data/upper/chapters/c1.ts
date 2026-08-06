import type { LabDef } from '../schema/lab'

/** 一 1~6的表内乘法（书页 1-18） */
export const c1Labs: LabDef[] = [
  {
    id: 'g2-c1-groups-mult',
    chapter: 'c1',
    page: 2,
    source: '例题',
    title: '认识乘法 · 几个几',
    prompt:
      '跳舞的有 4 个 2 人，2+2+2+2=8；看花的有 3 个 5 盆，5+5+5=15。拖动"每组几个"和"组数"，观察几个几相加怎样写成乘法。',
    kind: 'groups',
    params: [
      { key: 'each', label: '每组几个', min: 2, max: 6, step: 1, default: 4, unit: '个' },
      { key: 'groups', label: '组数', min: 2, max: 6, step: 1, default: 2, unit: '组' },
    ],
    formula: '求几个相同加数的和，用乘法计算',
    tip: '求几个相同加数的和，可以用加法计算，也可以用乘法计算比较简便。',
  },
  {
    id: 'g2-c1-mult-table-5',
    chapter: 'c1',
    page: 10,
    source: '例题',
    title: '5 的乘法口诀',
    prompt:
      '每节车厢坐 5 人，2 节、3 节、4 节、5 节车厢各坐多少人？五个五个地数：5，10，15，20，25。拖动滑块数一数，编出 5 的乘法口诀。',
    kind: 'mult-table',
    params: [{ key: 'n', label: '几个 5', min: 1, max: 5, step: 1, default: 2, unit: '个' }],
    fixed: { base: 5 },
    formula: '几个5 → 5 × n = 得数',
    tip: '一五得五、二五一十、三五十五、四五二十、五五二十五。',
  },
  {
    id: 'g2-c1-mult-table-6',
    chapter: 'c1',
    page: 12,
    source: '例题',
    title: '6 的乘法口诀',
    prompt:
      '每次坐 6 人，坐 2 次、3 次、4 次、5 次、6 次各坐多少人？先看图填一填，再接着编出 6 的乘法口诀。',
    kind: 'mult-table',
    params: [{ key: 'n', label: '几个 6', min: 1, max: 6, step: 1, default: 3, unit: '个' }],
    fixed: { base: 6 },
    formula: '几个6 → 6 × n = 得数',
    tip: '一六得六、二六十二、三六十八、四六二十四、五六三十、六六三十六。',
  },
]
