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
      {
        key: 'shape',
        label: '摆法',
        min: 0,
        max: 3,
        step: 1,
        default: 0,
        choices: [
          { value: 0, label: '2×3×1 长方体' },
          { value: 1, label: 'L 形' },
          { value: 2, label: '阶梯形' },
          { value: 3, label: '田字形' },
        ],
      },
    ],
    formula: '前面/右面/上面看到不同图形',
    tip:
      '从不同方向看同一个物体，看到的图形可能不同：前面看到"长×高"，右面看到"宽×高"，上面看到"长×宽"。观察时视线要与那个面垂直。易错点：把"右面看到的格数"直接说成"前面看到的格数"。',
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
      {
        key: 'shape',
        label: '摆法',
        min: 0,
        max: 3,
        step: 1,
        default: 0,
        choices: [
          { value: 0, label: '2×3×1 长方体' },
          { value: 1, label: 'L 形' },
          { value: 2, label: '阶梯形' },
          { value: 3, label: '田字形' },
        ],
      },
    ],
    formula: '不同摆法 → 不同方向看到不同图形',
    tip:
      '判断从某方向看到的图形，就想象自己站在那个方向看过去，数一数能看到几个小正方形（被前面的方块挡住的不算）。易错点：不同的摆法可能得到同一个视图。',
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
      {
        key: 'view',
        label: '观察方向',
        min: 0,
        max: 2,
        step: 1,
        default: 0,
        choices: [
          { value: 0, label: '从前面看' },
          { value: 1, label: '从右面看' },
          { value: 2, label: '从上面看' },
        ],
      },
    ],
    formula: '前面 / 右面 / 上面 三个方向',
    tip:
      '投票箱（3×2×2 的长方体）从前面看到 3×2 的长方形，从右面看到 2×2，从上面看到 3×2。三维模型可以拖拽旋转，但三视图不随视角改变。易错点：把旋转看模型当成"三视图也变了"。',
  },
]
