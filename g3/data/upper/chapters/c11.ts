import type { LabDef } from '../schema/lab'

/** 八 观察物体（二）（书页 95-103） */
export const c11Labs: LabDef[] = [
  {
    id: 'g3-c11-views-cube',
    chapter: 'c11',
    page: 98,
    source: '例题',
    title: '正方体摆成的物体',
    prompt:
      '用 6 个同样大的正方体摆成长方体，从前面、右面和上面看一看。拖动选择不同摆法，观察三个方向的图形。',
    kind: 'views',
    params: [
      { key: 'shape', label: '摆法', min: 0, max: 3, step: 1, default: 0, unit: '' },
    ],
    formula: '前面/右面/上面看到不同图形',
    tip: '从不同方向看同一个物体，看到的图形可能不同。观察时视线要与物体的面垂直。',
  },
  {
    id: 'g3-c11-views-match',
    chapter: 'c11',
    page: 100,
    source: '例题',
    title: '摆一摆，连一连',
    prompt:
      '用 4 个同样大的正方体摆成物体，从前面、右面和上面看到的各是什么图形？拖动选择摆法并观察。',
    kind: 'views',
    params: [
      { key: 'shape', label: '摆法', min: 0, max: 3, step: 1, default: 0, unit: '' },
    ],
    formula: '不同摆法 → 不同方向看到不同图形',
    tip: '判断从某方向看到的图形，可以想象自己站在那个方向看过去，数一数看到几个小正方形。',
  },
  {
    id: 'g3-c11-views3d',
    chapter: 'c11',
    page: 96,
    source: '例题',
    title: '三维物体三视图（three.js）',
    prompt:
      '把投票箱放在面前，从前面、右面和上面观察。拖动鼠标旋转三维物体，并切换观察方向。',
    kind: 'views3d',
    params: [
      { key: 'view', label: '观察方向', min: 0, max: 2, step: 1, default: 0, unit: '' },
    ],
    formula: '前面 / 右面 / 上面 三个方向',
    tip: '投票箱从前面看到的是长方形（正面），从上面看到的是顶面。三维模型可以拖拽旋转观察。',
  },
]
