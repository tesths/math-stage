import type { LabDef } from '../schema/lab'

/**
 * 三 多边形的面积（书页 30-50）
 *
 * 数据与课本印刷内容对齐（OCR 证据：书页 31 = PDF p033，书页 34 = p036，书页 35-36 = p037-038）：
 * - 书页 31：街西公园是平行四边形，一条边长 60 米；「一排一排地数，每排 6 个 100 平方米，4 排共 2400 平方米」，
 *   即模型为 6 格 × 4 格，每格边长 10 米、面积 100 平方米 → 24 格 = 2400 平方米。
 * - 书页 34：三角形面积推导 + 试一试「底 7 分米、高约 6 分米」。
 * - 书页 35-36：梯形面积推导用 1 cm 方格，「（4＋6）×3÷2 = 15（cm²）」+ 练一练「上底 36 米、下底 54 米、高 40 米」。
 */
export const c3Labs: LabDef[] = [
  {
    id: 'g5-c3-area-parallelogram',
    chapter: 'c3',
    page: 31,
    source: '例题',
    title: '平行四边形的面积',
    prompt:
      '街西公园是平行四边形，底 60 米（6 格）、高 40 米（4 格），图上每格边长 10 米、面积 100 平方米。先数方格，再剪一剪、拼一拼，看看它的面积怎样算。',
    kind: 'area',
    params: [
      { key: 'a', label: '底', min: 3, max: 10, step: 1, default: 6, unit: '格' },
      { key: 'h', label: '高', min: 2, max: 8, step: 1, default: 4, unit: '格' },
      { key: 'slant', label: '斜边水平偏移', min: 0, max: 3, step: 1, default: 1, unit: '格' },
    ],
    fixed: { shape: 0 },
    formula: 'S = a × h',
    tip: '沿高剪下一个直角三角形，向右平移「一个底」的长度，正好补在左边的缺口上，拼成长方形：长 = 底，宽 = 高。斜边越倾斜，整格越少，但不满整格的部分正好补足，面积不变。',
    units: { length: '米', cellSize: 10 },
  },
  {
    id: 'g5-c3-area-triangle',
    chapter: 'c3',
    page: 34,
    source: '例题',
    title: '三角形的面积',
    prompt:
      '两个完全一样的三角形可以拼成一个平行四边形（方格纸每格边长 1 分米）。试一试：一块三角形交通标志牌，底 7 分米、高 6 分米，涂油漆的面积是多少平方分米？',
    kind: 'area',
    params: [
      { key: 'a', label: '底', min: 3, max: 12, step: 1, default: 7, unit: '分米' },
      { key: 'h', label: '高', min: 2, max: 10, step: 1, default: 6, unit: '分米' },
    ],
    fixed: { shape: 1 },
    formula: 'S = a × h ÷ 2',
    tip: '两个完全一样的三角形拼成平行四边形：底和高都不变，三角形的面积是这个平行四边形的一半，所以 S = a × h ÷ 2。',
    units: { length: '分米', cellSize: 1 },
  },
  {
    id: 'g5-c3-area-trapezoid',
    chapter: 'c3',
    page: 35,
    source: '例题',
    title: '梯形的面积',
    prompt:
      '方格纸每格边长 1 厘米，梯形的上底 4 厘米、下底 6 厘米、高 3 厘米。两个完全一样的梯形能拼成平行四边形，拼成的平行四边形的底就是上底与下底的和。',
    kind: 'area',
    params: [
      { key: 'a', label: '上底', min: 1, max: 8, step: 1, default: 4, unit: '厘米' },
      { key: 'b', label: '下底', min: 2, max: 12, step: 1, default: 6, unit: '厘米' },
      { key: 'h', label: '高', min: 1, max: 8, step: 1, default: 3, unit: '厘米' },
    ],
    fixed: { shape: 2 },
    formula: 'S = (a + b) × h ÷ 2',
    tip: '任意两个完全一样的梯形都能拼成平行四边形：平行四边形的底 = 上底 + 下底，高不变，一个梯形的面积是它的一半：(4＋6)×3÷2 = 15 平方厘米。',
    units: { length: '厘米', cellSize: 1 },
  },
  {
    id: 'g5-c3-area-mcfield',
    chapter: 'c3',
    page: 36,
    source: '练一练',
    title: '梯形麦田面积',
    prompt: '一块梯形麦田，上底 36 米，下底 54 米，高 40 米。这块麦田的面积是多少平方米？',
    kind: 'area',
    params: [
      { key: 'a', label: '上底', min: 10, max: 60, step: 1, default: 36, unit: '米' },
      { key: 'b', label: '下底', min: 20, max: 80, step: 1, default: 54, unit: '米' },
      { key: 'h', label: '高', min: 10, max: 60, step: 10, default: 40, unit: '米' },
    ],
    fixed: { shape: 2 },
    formula: 'S = (a + b) × h ÷ 2',
    tip: '单位是米时面积单位是平方米：(36＋54)×40÷2 = 1800 平方米；1 公顷 = 10000 平方米。',
    units: { length: '米' },
  },
  {
    id: 'g5-c3-hectare-square',
    chapter: 'c3',
    page: 40,
    source: '例题',
    title: '公顷与平方千米',
    prompt: '边长 100 米的正方形土地面积是 1 公顷。拖动边长，观察面积在平方米 / 公顷 / 平方千米之间的换算。',
    kind: 'hectare',
    params: [
      { key: 'side', label: '正方形边长', min: 1, max: 1000, step: 1, default: 100, unit: '米' },
    ],
    formula: 'S = 边长 × 边长（平方米）',
    tip: '1 公顷 = 10000 平方米（边长 100 米）；1 平方千米 = 100 公顷 = 1000000 平方米（边长 1000 米）。',
    units: { length: '米' },
  },
  {
    id: 'g5-c3-hectare-field',
    chapter: 'c3',
    page: 42,
    source: '例题',
    title: '组合图形的面积',
    prompt:
      '华丰公园里池塘的平面示意图：上边 100 米、左边高 90 米、右上竖边 40 米、下底 140 米。它的占地面积是多少平方米？是多少公顷？',
    kind: 'composite',
    params: [
      { key: 'top', label: '上边', min: 40, max: 160, step: 10, default: 100, unit: '米' },
      { key: 'left', label: '左边高', min: 40, max: 160, step: 10, default: 90, unit: '米' },
      { key: 'right', label: '右上竖边', min: 10, max: 120, step: 10, default: 40, unit: '米' },
      { key: 'bottom', label: '下底', min: 60, max: 220, step: 10, default: 140, unit: '米' },
    ],
    formula: 'S = 长方形 + 梯形（也可 长方形 + 三角形，或 大长方形 − 补上的梯形）',
    tip: '三种割补方法结果相同：100×40 + (100+140)×50÷2 = 10000 平方米 = 1 公顷；添补法：140×90 − (90+40)×40÷2 = 10000。',
    units: { length: '米' },
  },
]
