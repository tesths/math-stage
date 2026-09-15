import type { LabDef } from '../schema/lab'

/** 四 比和比例 · 练习题 Lab（练一练 第 1 题 / 练习八 第 4 题） */
export const c4Exercises: LabDef[] = [
  {
    id: 'g6-c4-ex-cube-ratio',
    chapter: 'c4',
    page: 55,
    source: '练习',
    title: '棱长比·面积比·体积比',
    prompt:
      '写出小正方体与大正方体棱长的比、底面积的比、体积的比，并化简。（两个正方体的棱长分别是 4 厘米和 6 厘米。可拖动滑块改变棱长，观察三个比怎样变化。）',
    kind: 'ex-c4-cube-ratio',
    params: [
      { key: 'a', label: '正方体 A 棱长', min: 2, max: 6, step: 1, default: 4, unit: '厘米' },
      { key: 'b', label: '正方体 B 棱长', min: 3, max: 9, step: 1, default: 6, unit: '厘米' },
    ],
    fixed: {},
    formula: '棱长比 = 较小棱长 : 较大棱长 → 底面积比 = 棱长比的平方 → 体积比 = 棱长比的立方（都化成最简整数比）',
    tip: '棱长比 4:6=2:3；底面积 16:36=4:9，正好是 (2:3)²；体积 64:216=8:27，正好是 (2:3)³。面积比是棱长比的平方，体积比是棱长比的立方。',
  },
  {
    id: 'g6-c4-ex-football-ratio',
    chapter: 'c4',
    page: 54,
    source: '练一练',
    title: '足球皮·按比分黑白',
    prompt:
      '一种足球的表面是由 32 块黑色五边形皮和白色六边形皮围成的。黑色皮和白色皮块数的比是 3:5。黑、白两种颜色的皮各有多少块？',
    kind: 'ex-c4-football-ratio',
    params: [
      { key: 'a', label: '黑色皮份数', min: 1, max: 6, step: 1, default: 3, unit: '份' },
      { key: 'b', label: '白色皮份数', min: 1, max: 8, step: 1, default: 5, unit: '份' },
      { key: 'per', label: '每份的块数', min: 1, max: 8, step: 1, default: 4, unit: '块' },
    ],
    fixed: {},
    formula: '总份数 = a + b；总块数 = 每份块数 × 总份数；黑色皮 = 每份 × a；白色皮 = 每份 × b',
    tip: '黑 3 份、白 5 份共 8 份；每份 4 块时一共 8×4=32 块；黑色皮 4×3=12 块、白色皮 4×5=20 块，12+20=32 正好分完。',
  },
]
