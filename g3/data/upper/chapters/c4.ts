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
    tip:
      '相邻质量单位之间的进率都是 1000：1 千克 = 1000 克，1 吨 = 1000 千克。称较轻的物体用克，称大宗重物用吨。易错点：把 1 吨写成 100 千克（当成 100 进率）。',
  },
  {
    id: 'g3-c4-equivalent',
    chapter: 'c4',
    page: 31,
    source: '综合实践',
    title: '等量代换（曹冲称象）',
    prompt:
      '曹冲先把大象牵上小船，在水面处刻一条线；再换成石头，一块一块地放，直到水面正好回到刻线。拖动每块石头的质量，观察要放几块才和大象一样重。',
    kind: 'equivalent',
    params: [
      { key: 'mass', label: '大象质量', min: 500, max: 4000, step: 100, default: 2000, unit: '千克' },
      { key: 'each', label: '每块石头', min: 50, max: 400, step: 50, default: 200, unit: '千克' },
    ],
    formula: '石块总质量 = 每块质量 × 块数 = 大象质量',
    tip:
      '船下沉到同一刻线，说明石头总质量 = 大象质量，这就是等量代换：大象的质量换成了能称的石头。易错点：不能反过来用"石头总质量"去定义大象有多重——块数是由象重和每块质量算出来的。',
  },
]
