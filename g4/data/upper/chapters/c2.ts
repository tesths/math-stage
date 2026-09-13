import type { LabDef } from '../schema/lab'

/** 二 周长与面积（书页 17-41） */
export const c2Labs: LabDef[] = [
  {
    id: 'g4-c2-peri-rect',
    chapter: 'c2',
    page: 24,
    source: '例题',
    title: '长方形的周长',
    prompt:
      '长方形儿童画长 36 厘米、宽 24 厘米，做画框需要多长的装饰条？拖动长和宽，观察 C=(a+b)×2 的推导。',
    kind: 'peri-rect',
    params: [
      { key: 'a', label: '长', min: 1, max: 20, step: 1, default: 12, unit: '厘米' },
      { key: 'b', label: '宽', min: 1, max: 16, step: 1, default: 8, unit: '厘米' },
    ],
    formula: 'C = (长 + 宽) × 2',
    tip: '长方形的周长 = (长 + 宽) × 2；两条长加两条宽。',
  },
  {
    id: 'g4-c2-peri-square',
    chapter: 'c2',
    page: 25,
    source: '例题',
    title: '正方形的周长',
    prompt: '正方形儿童画边长 25 厘米，做画框需要多少厘米的装饰条？拖动边长，观察 C = a × 4。',
    kind: 'peri-square',
    params: [{ key: 'a', label: '边长', min: 1, max: 20, step: 1, default: 12, unit: '厘米' }],
    formula: 'C = a × 4',
    tip: '正方形的周长 = 边长 × 4，用字母表示 C = a × 4。',
  },
  {
    id: 'g4-c2-area-grid',
    chapter: 'c2',
    page: 29,
    source: '例题',
    title: '用面积单位量面积',
    prompt:
      '用 1 平方厘米的小正方形铺满长方形。拖动长和宽，数一数沿长铺几个、沿宽铺几排，发现面积 = 每排个数 × 排数。',
    kind: 'area-grid',
    params: [
      { key: 'a', label: '长', min: 1, max: 10, step: 1, default: 8, unit: '格' },
      { key: 'b', label: '宽', min: 1, max: 8, step: 1, default: 5, unit: '格' },
    ],
    formula: '面积 = 每排个数 × 排数',
    tip: '小正方形的个数 = 每排小正方形的个数 × 排数，这就是长方形的面积。',
  },
  {
    id: 'g4-c2-area-rect',
    chapter: 'c2',
    page: 31,
    source: '例题',
    title: '长方形的面积',
    prompt:
      '长方形借书卡长 8 厘米、宽 5 厘米，面积是多少平方厘米？拖动长和宽，观察 S = a × b。',
    kind: 'area-rect',
    params: [
      { key: 'a', label: '长', min: 1, max: 20, step: 1, default: 8, unit: '厘米' },
      { key: 'b', label: '宽', min: 1, max: 16, step: 1, default: 5, unit: '厘米' },
    ],
    formula: 'S = a × b',
    tip: '长方形的面积 = 长 × 宽，用字母表示 S = a × b。',
  },
  {
    id: 'g4-c2-area-square',
    chapter: 'c2',
    page: 32,
    source: '例题',
    title: '正方形的面积',
    prompt: '正方形是长和宽相等的长方形。拖动边长，观察 S = a × a。',
    kind: 'area-square',
    params: [{ key: 'a', label: '边长', min: 1, max: 20, step: 1, default: 6, unit: '厘米' }],
    formula: 'S = a × a',
    tip: '正方形的面积 = 边长 × 边长，用字母表示 S = a × a。',
  },
  {
    id: 'g4-c2-area-unit',
    chapter: 'c2',
    page: 36,
    source: '例题',
    title: '面积单位换算',
    prompt:
      '1 平方分米 = 100 平方厘米，1 平方米 = 100 平方分米。选择相邻单位组和换算方向，观察整数组换算。',
    kind: 'area-unit',
    params: [
      { key: 'v', label: '大单位份数', min: 1, max: 50, step: 1, default: 3, unit: '份' },
      {
        key: 'pair',
        label: '单位组',
        min: 0,
        max: 1,
        step: 1,
        default: 0,
        choices: [
          { value: 0, label: '平方分米 ↔ 平方厘米' },
          { value: 1, label: '平方米 ↔ 平方分米' },
        ],
      },
      {
        key: 'dir',
        label: '方向',
        min: 0,
        max: 1,
        step: 1,
        default: 0,
        choices: [
          { value: 0, label: '大化小' },
          { value: 1, label: '小化大' },
        ],
      },
    ],
    formula: '1 平方分米 = 100 平方厘米；1 平方米 = 100 平方分米',
    tip: '相邻面积单位之间的进率是 100：用 n 个大单位和 100n 个相邻小单位互化，结果都是整数。',
  },
]
