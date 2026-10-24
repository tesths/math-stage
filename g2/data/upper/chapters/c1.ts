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
      // 默认值对齐课本 p2「2+2+2+2」：4 组、每组 2 个（4 个 2 相加）
      { key: 'each', label: '每组几个', min: 2, max: 6, step: 1, default: 2, unit: '个' },
      { key: 'groups', label: '组数', min: 2, max: 6, step: 1, default: 4, unit: '组' },
    ],
    formula: '求几个相同加数的和，用乘法计算',
    tip: '求几个相同加数的和，用乘法表示比较简便：4 个 2 相加写成 2×4，乘号两边的数叫乘数，得数叫积。易错点：4 个 2 的图是「4 组、每组 2 个」，写成算式是先写 2 再写 4，别把组数当被加的加数。',
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
    tip: '几个 5 相加得几，用口诀直接说得数：一五得五、二五一十、三五十五、四五二十、五五二十五；每多一个 5，得数就多 5。易错点：积是整十时要读「一十」（二五一十），不能读成「二五得十」。',
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
    tip: '6 的乘法口诀规律与 5 的一样：几个 6 相加，得数就是 6 乘几；每多一个 6，得数多 6。易错点：三六十八的得数是 18，不是 12——先数清「几个 6」再报得数。',
  },
]
