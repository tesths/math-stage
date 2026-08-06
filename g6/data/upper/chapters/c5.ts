import type { LabDef } from '../schema/lab'

/** 五 圆（书页 68-87） */
export const c5Labs: LabDef[] = [
  {
    id: 'g6-c5-circle-feature',
    chapter: 'c5',
    page: 70,
    source: '例题',
    title: '认识圆 · 圆心半径直径',
    prompt:
      '连接圆心和圆上任意一点的线段是半径 r，通过圆心并且两端都在圆上的线段是直径 d。同一个圆的半径都相等，d = 2r。',
    kind: 'circle-feature',
    params: [{ key: 'r', label: '半径', min: 1, max: 8, step: 1, default: 4, unit: '厘米' }],
    formula: '直径 d = 2 × 半径 r',
    tip: '圆由曲线围成，没有顶点；同一个圆的半径有无数条，都相等，直径是半径的 2 倍。',
  },
  {
    id: 'g6-c5-sector',
    chapter: 'c5',
    page: 72,
    source: '例题',
    title: '扇形与圆心角',
    prompt:
      '由一条弧和经过这条弧两端的两条半径围成的图形是扇形。顶点在圆心的角是圆心角。在同一个圆中，圆心角越大，扇形越大。',
    kind: 'sector',
    params: [{ key: 'angle', label: '圆心角', min: 30, max: 360, step: 15, default: 90, unit: '°' }],
    formula: '扇形占圆的比例 = 圆心角 ÷ 360°',
    tip: '圆心角越大，它所对的弧越长，扇形越大；圆心角 90° 的扇形是圆的四分之一。',
  },
  {
    id: 'g6-c5-circumference',
    chapter: 'c5',
    page: 77,
    source: '例题',
    title: '圆的周长 · 圆周率',
    prompt:
      '一个圆形喷水池的半径是 14 米，它的周长是多少米？圆的周长与直径的比值是一个固定数——圆周率 π ≈ 3.14。',
    kind: 'circumference',
    params: [{ key: 'r', label: '半径', min: 1, max: 30, step: 1, default: 14, unit: '米' }],
    formula: 'C = 2 × π × r = 2 × 3.14 × 半径',
    tip: 'C = πd 或 C = 2πr；π 是无限不循环小数，解决问题时一般取 3.14。',
  },
  {
    id: 'g6-c5-circle-area',
    chapter: 'c5',
    page: 80,
    source: '例题',
    title: '圆的面积 · 剪拼成近似长方形',
    prompt:
      '把圆平均分成若干份，可以拼成一个近似的长方形：长方形的长相当于圆周长的一半（πr），宽相当于半径 r，所以 S = πr²。',
    kind: 'circle-area',
    params: [
      { key: 'r', label: '半径', min: 1, max: 20, step: 1, default: 5, unit: '米' },
      { key: 'slices', label: '平均分的份数', min: 4, max: 32, step: 4, default: 8 },
    ],
    formula: 'S = π × r × r = 3.14 × 半径²',
    tip: '平均分的份数越多，拼成的图形越接近长方形；圆的面积 = 长方形面积 = πr × r = πr²。',
  },
  {
    id: 'g6-c5-annulus',
    chapter: 'c5',
    page: 81,
    source: '例题',
    title: '环形面积 · 外圆减内圆',
    prompt:
      '零件横截面是一个圆环形，外圆半径 10 厘米，内圆半径 6 厘米。外圆面积减去内圆面积就是圆环形的面积。',
    kind: 'annulus',
    params: [
      { key: 'R', label: '外圆半径', min: 5, max: 15, step: 1, default: 10, unit: '厘米' },
      { key: 'r', label: '内圆半径', min: 1, max: 14, step: 1, default: 6, unit: '厘米' },
    ],
    formula: 'S = π×R² - π×r² = π×(R² - r²)',
    tip: '圆环面积 = 外圆面积 - 内圆面积；也可用 π × (R² - r²) 简便计算。',
  },
  {
    id: 'g6-c5-circle-composite',
    chapter: 'c5',
    page: 81,
    source: '试一试',
    title: '组合图形的面积 · 窗户',
    prompt:
      '一扇窗户由一个正方形和一个半圆形组合而成。正方形的边长是 2 米，求这扇窗户的面积。把组合图形分割成学过的图形分别求面积再相加。',
    kind: 'circle-composite',
    params: [{ key: 'side', label: '正方形边长', min: 2, max: 10, step: 1, default: 2, unit: '米' }],
    formula: 'S = 正方形面积 + 半圆面积 = side² + π×(side÷2)²÷2',
    tip: '半圆的直径等于正方形的边长，半径 = side ÷ 2；先算正方形面积，再算半圆面积，最后相加。',
  },
]
