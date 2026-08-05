import type { LabDef } from '../schema/lab'

/** 六 放大与缩小（书页 92-102），含比例尺 */
export const c6Labs: LabDef[] = [
  {
    id: 'g6-c6-scale-shape',
    chapter: 'c6',
    page: 95,
    source: '例题',
    title: '图形的放大与缩小 · 方格纸',
    prompt:
      '把长方形的每条边都放大到原来的 2 倍，就是按 2:1 的比放大；按 1:2 的比缩小，长和宽都是原来的 1/2。放大或缩小前后，大小变了，形状不变。',
    kind: 'scale-shape',
    params: [
      { key: 'n', label: '放大缩小的比（前项）', min: 1, max: 4, step: 1, default: 2 },
      { key: 'd', label: '放大缩小的比（后项）', min: 1, max: 4, step: 1, default: 1 },
      { key: 'shape', label: '图形', min: 0, max: 2, step: 1, default: 0, unit: '0长方形 1直角三角形 2梯形' },
    ],
    formula: '每条边都变为原来的 n/d 倍，角不变',
    tip: '前项 > 后项是放大，前项 < 后项是缩小；对应边长的比是 n:d，形状保持不变。',
  },
  {
    id: 'g6-c6-map-scale',
    chapter: 'c6',
    page: 100,
    source: '例题',
    title: '比例尺 · 图上距离与实际距离',
    prompt:
      '一幅图的图上距离和实际距离的比，叫作这幅图的比例尺。比例尺 1:1000 表示图上距离 1 厘米相当于实际距离 10 米。',
    kind: 'map-scale',
    params: [
      { key: 'scaleDen', label: '比例尺分母', min: 500, max: 10000, step: 500, default: 1000 },
      { key: 'cm', label: '图上距离', min: 1, max: 10, step: 0.5, default: 5, unit: '厘米' },
    ],
    formula: '实际距离 = 图上距离 × 比例尺分母（厘米 → 米 ÷100）',
    tip: '图上距离 : 实际距离 = 比例尺；比例尺 1:8000 说明实际距离是图上距离的 8000 倍。',
  },
]
