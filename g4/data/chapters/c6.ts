import type { LabDef } from '../schema/lab'

/** 六 制订旅游计划（书页 64-66） */
export const c6Labs: LabDef[] = [
  {
    id: 'g4-c6-travel-plan',
    chapter: 'c6',
    page: 65,
    source: '综合实践',
    title: '制订旅游计划 · 费用估算',
    prompt:
      '制订家庭旅游计划时，要估算交通、住宿、门票和餐费。拖动人数与各项费用，观察旅游总费用的估算过程。',
    kind: 'travel-plan',
    params: [
      { key: 'person', label: '出游人数', min: 1, max: 6, step: 1, default: 3, unit: '人' },
      { key: 'transport', label: '往返交通/人', min: 50, max: 2000, step: 50, default: 400, unit: '元' },
      { key: 'ticket', label: '门票/人', min: 10, max: 500, step: 10, default: 150, unit: '元' },
      { key: 'hotel', label: '住宿/晚', min: 50, max: 2000, step: 50, default: 300, unit: '元' },
      { key: 'days', label: '住宿晚数', min: 1, max: 7, step: 1, default: 2, unit: '晚' },
    ],
    formula: '总费用 = 交通 + 门票 + 住宿（元）',
    tip: '估算旅游费用要全面考虑交通、住宿、门票、餐费，并适当多估一些。',
  },
]
