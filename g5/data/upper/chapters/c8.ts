import type { LabDef } from '../schema/lab'

/** 八 观察物体（三）（书页 112-118）+ 探索规律：钉子板上的多边形（书页 110-111） */
export const c8Labs: LabDef[] = [
  {
    id: 'g5-c8-views3d-blocks',
    chapter: 'c8',
    page: 113,
    source: '例题',
    title: '观察物体 · 三视图',
    prompt:
      '用 5 个同样大的正方体摆成一个物体。拖动观察视角（从前面 / 右面 / 上面看），并用三维旋转查看立体形状。',
    kind: 'views3d',
    params: [
      {
        key: 'view',
        label: '观察方向',
        min: 0,
        max: 2,
        step: 1,
        default: 0,
        options: [
          { label: '从前面看', value: 0 },
          { label: '从右面看', value: 1 },
          { label: '从上面看', value: 2 },
        ],
      },
    ],
    formula: '从不同方向看同一个物体，看到的图形可能不同',
    tip: '从前面、右面、上面三个方向观察物体，根据看到的三个图形可以确定物体的形状（三视图）。',
  },
  {
    id: 'g5-c8-views3d-move',
    chapter: 'c8',
    page: 115,
    source: '练一练',
    title: '观察物体 · 移动正方体',
    prompt: '移动一个正方体，使从右面看到的图形不变，可以怎样移？用三维视图从不同方向检查。',
    kind: 'views3d',
    params: [
      {
        key: 'view',
        label: '观察方向',
        min: 0,
        max: 2,
        step: 1,
        default: 1,
        options: [
          { label: '从前面看', value: 0 },
          { label: '从右面看', value: 1 },
          { label: '从上面看', value: 2 },
        ],
      },
    ],
    formula: '移动正方体时，只要不改变某个方向的“投影轮廓”，那个方向看到的图形就不变',
    tip: '同一个三视图可以由不同的摆法得到：沿“观察方向”前后挪动正方体，不改变它在那个方向上的投影轮廓，看到的图形就不变。',
  },
]

/** 探索规律：钉子板上的多边形（书页 110-111），挂在 c6（因数与倍数）后 */
export const pinboardLabs: LabDef[] = [
  {
    id: 'g5-pinboard-area',
    chapter: 'c7',
    page: 110,
    source: '探索',
    title: '探索规律 · 钉子板上的多边形（第 110–111 页）',
    prompt:
      '这是紧接第七单元练习十三之后的「探索规律」活动（课本第 110–111 页）：在钉子板上围一个多边形，面积与边上钉子数、内部钉子数有什么关系？拖动多边形顶点，观察 S = n÷2 + b − 1。',
    kind: 'pinboard',
    params: [
      {
        key: 'shape',
        label: '多边形',
        min: 0,
        max: 4,
        step: 1,
        default: 0,
        options: [
          { label: '长方形', value: 0 },
          { label: '三角形', value: 1 },
          { label: 'L 形', value: 2 },
          { label: '五边形', value: 3 },
          { label: '凹多边形', value: 4 },
        ],
      },
    ],
    formula: 'S = n ÷ 2 + b - 1（n 为边上钉子数，b 为内部钉子数）',
    tip: '皮克定理：多边形面积 S = n/2 + b - 1，其中 n 是多边形边上的钉子数，b 是内部的钉子数。',
  },
]
