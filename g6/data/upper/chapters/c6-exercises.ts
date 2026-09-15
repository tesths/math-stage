import type { LabDef } from '../schema/lab'

/** 六 放大与缩小 · 练习题 Lab（练习十二 / 练习十三） */
export const c6Exercises: LabDef[] = [
  /** 练习十二 第 6 题（书页 97） */
  {
    id: 'g6-c6-ex-scale-area',
    chapter: 'c6',
    page: 97,
    source: '练习',
    title: '放大缩小后的面积倍数',
    prompt:
      '先画出等腰直角三角形按 3:1 的比放大后的图形，再画出直角梯形按 1:2 的比缩小后的图形。等腰直角三角形放大后的面积是原来的多少倍？直角梯形缩小后的面积是原来的几分之几？',
    kind: 'ex-c6-scale-area',
    params: [
      { key: 'a', label: '原等腰直角三角形直角边长', min: 1, max: 3, step: 1, default: 2, unit: '格' },
      { key: 'n', label: '放大比（前项 : 1）', min: 2, max: 4, step: 1, default: 3, unit: '' },
      { key: 'd', label: '缩小比（1 : 后项）', min: 2, max: 4, step: 1, default: 2, unit: '' },
    ],
    fixed: { trapTop: 4, trapBottom: 8, trapHeight: 6 },
    formula: '放大 n:1 → 面积是原来的 n² 倍；缩小 1:d → 面积是原来的 1/d²',
    tip: '每条边都放大到原来的 n 倍时，底和高同时变 n 倍，面积就是 n×n 倍；按 1:d 缩小时每条边只有 1/d，面积就是 1/d²。',
  },
  /** 练习十三 第 6 题（书页 102） */
  {
    id: 'g6-c6-ex-two-maps',
    chapter: 'c6',
    page: 102,
    source: '练习',
    title: '两种比例尺的图纸对比',
    prompt:
      '有两张不同的图纸，比例尺分别是 1:5000、1:2000。(1) 在这两张图纸上，3 厘米长的线段表示的实际长度各是多少米？(2) 在比例尺是 1:2000 的图纸上有一条 2 厘米长的线段，如果画在比例尺是 1:5000 的图纸上，应该画多长？',
    kind: 'ex-c6-two-maps',
    params: [
      { key: 'denA', label: '图纸 A 的比例尺分母', min: 1000, max: 10000, step: 1000, default: 5000, unit: '' },
      { key: 'denB', label: '图纸 B 的比例尺分母', min: 1000, max: 10000, step: 500, default: 2000, unit: '' },
      { key: 'cm', label: 'B 图上的线段长', min: 1, max: 5, step: 0.5, default: 2, unit: '厘米' },
    ],
    fixed: { cmA: 3 },
    formula: '实际距离 = 图上距离 × 分母；改画：图上距离 = 原图上距离 × 原分母 ÷ 新分母',
    tip: '同一段实际距离，比例尺分母越大，图上画得越短。先算实际距离，再按新比例尺求图上距离。',
  },
]
