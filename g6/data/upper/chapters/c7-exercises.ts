import type { LabDef } from '../schema/lab'

/** 七 确定位置 · 练习题 Lab（练习十四） */
export const c7Exercises: LabDef[] = [
  /** 练习十四 第 1 题（书页 109） */
  {
    id: 'g6-c7-ex-route-path',
    chapter: 'c7',
    page: 109,
    source: '练习',
    title: '数对画出行走路线',
    prompt:
      '小丽从电影院到学校的行走路线可以用“（6，2）→（7，2）→（8，2）→（9，2）→（9，3）→（9，4）”表示。请在方格图中画出她的行走路线，并说说这些数对是怎样变化的。',
    kind: 'ex-c7-route-path',
    params: [
      { key: 'x0', label: '起点列（电影院）', min: 3, max: 8, step: 1, default: 6, unit: '' },
      { key: 'k', label: '向东走', min: 1, max: 4, step: 1, default: 3, unit: '格' },
      { key: 'm', label: '向北走', min: 1, max: 4, step: 1, default: 2, unit: '格' },
    ],
    fixed: { y0: 2, cols: 18, rows: 8 },
    formula: '路线：（起点列，2）→（起点列 + k，2）→（起点列 + k，2 + m）',
    tip: '向东走一格，数对第一个数加 1、第二个数不变；向北走一格，第二个数加 1、第一个数不变。路线就是一串依次变化的数对。',
  },
  /** 练习十四 第 8 题（书页 111） */
  {
    id: 'g6-c7-ex-observer-point',
    chapter: 'c7',
    page: 111,
    source: '练习',
    title: '两个观测点找家',
    prompt:
      '（1）小琳家在打谷场的正北方向 200 米处。（2）晓雨家在商店的北偏西 60° 方向 400 米处。请在图中画出两人的家，再说说从小琳家到晓雨家的行走路线。',
    kind: 'ex-c7-observer-point',
    params: [
      { key: 'angle', label: '偏转角度', min: 15, max: 75, step: 5, default: 60, unit: '°' },
      { key: 'dist', label: '晓雨家到商店的距离', min: 100, max: 500, step: 50, default: 400, unit: '米' },
      { key: 'dist2', label: '小琳家到打谷场的距离', min: 100, max: 300, step: 50, default: 200, unit: '米' },
    ],
    fixed: { gx: 4, gy: 3, sx: 9, sy: 3, u: 100 },
    formula: '晓雨家：从商店向北走 距离×cos α 格、向西走 距离×sin α 格；小琳家：从打谷场向正北走 距离 ÷ 100 格',
    tip: '说位置必须说清“以谁为观测点”：晓雨家从商店量（北偏西），小琳家从打谷场量（正北）。100 米是 1 格，先换算出图上几格再画。',
  },
]
