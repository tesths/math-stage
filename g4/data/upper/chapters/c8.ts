import type { LabDef } from '../schema/lab'

/** 八 度量衡的故事（书页 89-93） */
export const c8Labs: LabDef[] = [
  {
    id: 'g4-c8-measure-story',
    chapter: 'c8',
    page: 90,
    source: '综合实践',
    title: '度量衡 · 古今计量单位',
    prompt:
      '秦始皇统一度量衡后：1 尺约 23 厘米、1 升约 200 毫升、1 斤约 250 克。拖动古代单位数值，观察与现代单位的换算。',
    kind: 'measure-story',
    params: [
      { key: 'chi', label: '古代尺数', min: 1, max: 20, step: 1, default: 5, unit: '尺' },
      { key: 'sheng', label: '古代升数', min: 1, max: 20, step: 1, default: 3, unit: '升' },
      { key: 'jin', label: '古代斤数', min: 1, max: 20, step: 1, default: 4, unit: '斤' },
    ],
    formula: '1 尺 ≈ 23 厘米；1 升 ≈ 200 毫升；1 斤 ≈ 250 克',
    tip: '「度量衡」分别指计量长短（度）、容量（量）、轻重（衡）；统一度量衡便于商品流通。易错点：把古代的 1 尺当成现在的 1 米。',
  },
]
