import type { LabDef } from '../schema/lab'

/** 三 周长与面积的变化（书页 43-44） */
export const c3Labs: LabDef[] = [
  {
    id: 'g4-c3-peri-area-change',
    chapter: 'c3',
    page: 43,
    source: '探索',
    title: '周长与面积的变化',
    prompt:
      '用 36 个小正方形拼成不同的长方形或正方形。拖动行数，观察不同拼法下周长与面积的变化，发现"长和宽越接近，周长越短"。',
    kind: 'peri-area-change',
    params: [{ key: 'rows', label: '行数', min: 1, max: 6, step: 1, default: 4, unit: '行' }],
    formula: '面积一定，周长随长宽变化',
    tip: '面积相同的长方形中，长和宽越接近，周长越短；拼成正方形时周长最短。',
  },
]
