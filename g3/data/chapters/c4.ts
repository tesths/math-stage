import type { LabDef } from '../schema/lab'

/** 曹冲称象的故事（综合与实践：千克/克/吨，书页 31-35） */
export const c4Labs: LabDef[] = [
  {
    id: 'g3-c4-weight',
    chapter: 'c4',
    page: 34,
    source: '综合实践',
    title: '克、千克和吨',
    prompt:
      '称比较轻的物体用克（g），称多数物体用千克（kg），称大宗重物用吨（t）。拖动数值，观察相邻质量单位间的进率。',
    kind: 'weight',
    params: [
      { key: 'value', label: '数值', min: 1, max: 9, step: 1, default: 3, unit: '千克' },
      { key: 'unit', label: '目标单位', min: 0, max: 2, step: 1, default: 1, unit: '' },
    ],
    formula: '1 吨 = 1000 千克 = 1000000 克',
    tip: '相邻质量单位之间的进率都是 1000：1 千克 = 1000 克，1 吨 = 1000 千克。',
  },
  {
    id: 'g3-c4-equivalent',
    chapter: 'c4',
    page: 31,
    source: '综合实践',
    title: '等量代换（曹冲称象）',
    prompt:
      '曹冲把大象放进小船，再放石头到相同的水位线。拖动石头的数量和每块质量，观察"石头质量总和 = 大象质量"。',
    kind: 'equivalent',
    params: [
      { key: 'stones', label: '石块数量', min: 1, max: 12, step: 1, default: 5, unit: '块' },
      { key: 'each', label: '每块质量', min: 10, max: 100, step: 10, default: 40, unit: '千克' },
    ],
    formula: '大象质量 = 每块质量 × 石块数量',
    tip: '把小船下沉到相同位置，说明石头的总质量等于大象的质量，这就是等量代换。',
  },
]
