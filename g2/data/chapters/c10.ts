import type { LabDef } from '../schema/lab'

/** 期末复习（书页 98-104） */
export const c10Labs: LabDef[] = [
  {
    id: 'g2-c10-review-calc',
    chapter: 'c10',
    page: 99,
    source: '复习',
    title: '期末 · 表内乘除复习',
    prompt:
      '根据一句乘法口诀能写几道乘法和除法算式？拖动两个因数，选乘法或除法，用口诀快速算出得数，再想想还能写出哪些算式。',
    kind: 'table-calc',
    params: [
      { key: 'a', label: '因数 a', min: 2, max: 9, step: 1, default: 5, unit: '' },
      { key: 'b', label: '因数 b', min: 2, max: 9, step: 1, default: 7, unit: '' },
      { key: 'mode', label: '运算', min: 0, max: 1, step: 1, default: 0, unit: '0乘1除' },
    ],
    formula: '一句口诀 → 乘法 + 除法',
    tip: '例如"五七三十五"：5×7=35，35÷5=7，35÷7=5。',
  },
]
