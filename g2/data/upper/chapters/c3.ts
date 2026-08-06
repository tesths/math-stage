import type { LabDef } from '../schema/lab'

/** 奇妙的七巧板（书页 33-38，综合与实践） */
export const c3Labs: LabDef[] = [
  {
    id: 'g2-c3-tangram',
    chapter: 'c3',
    page: 34,
    source: '综合实践',
    title: '七巧板拼图',
    prompt:
      '七巧板由 7 块板组成，正好拼成一个正方形。用几块板可以拼成三角形、长方形、正方形或有趣的图案。切换图案看一看。',
    kind: 'tangram',
    params: [{ key: 'sel', label: '图案', min: 0, max: 3, step: 1, default: 0, unit: '' }],
    formula: '7 块板 → 一个正方形 → 拼出各种图形',
    tip: '①号板和②号板完全一样；③号板和⑤号板可以拼成④号板。',
  },
]
