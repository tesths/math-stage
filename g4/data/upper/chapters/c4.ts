import type { LabDef } from '../schema/lab'

/** 四 乘法数量关系（书页 44-56） */
export const c4Labs: LabDef[] = [
  {
    id: 'g4-c4-mul-meaning',
    chapter: 'c4',
    page: 46,
    source: '例题',
    title: '乘法的意义 · 跳绳人数',
    prompt:
      '跳绳的分成 3 组，每组 4 人，一共有多少人？拖动组数和每组人数，观察"求几个相同加数的和"用乘法。',
    kind: 'mul-meaning',
    params: [
      { key: 'groups', label: '组数', min: 1, max: 10, step: 1, default: 3, unit: '组' },
      { key: 'per', label: '每组人数', min: 1, max: 9, step: 1, default: 4, unit: '人' },
    ],
    formula: '4 + 4 + 4 = 4 × 3',
    tip: '求几个相同加数的和，用乘法计算比较简便：4 + 4 + 4 = 4 × 3。易错点：把 3 个 4 和 4 个 3 的算式写反却当成结果不同（结果一样，意义不同）。',
  },
  {
    id: 'g4-c4-mul-total',
    chapter: 'c4',
    page: 49,
    source: '例题',
    title: '总价 = 单价 × 数量',
    prompt:
      '钢笔每支 8 元，买 3 支要付多少元？拖动单价和数量，观察总价与单价、数量之间的数量关系。',
    kind: 'mul-total',
    params: [
      { key: 'price', label: '单价', min: 1, max: 50, step: 1, default: 8, unit: '元' },
      { key: 'count', label: '数量', min: 1, max: 20, step: 1, default: 3, unit: '支' },
    ],
    formula: '总价 = 单价 × 数量',
    tip: '一件商品的价格叫单价，购买的数量叫数量，总价 = 单价 × 数量。易错点：把"数量"当成"单价"，或总价算成单价 + 数量。',
  },
  {
    id: 'g4-c4-mul-distance',
    chapter: 'c4',
    page: 51,
    source: '例题',
    title: '路程 = 速度 × 时间',
    prompt:
      '小明和小刚比谁走得快，要比每分钟走的路程。拖动速度和行驶时间，观察路程、速度、时间的关系。',
    kind: 'mul-distance',
    params: [
      { key: 'v', label: '速度', min: 5, max: 100, step: 5, default: 70, unit: '米/分' },
      { key: 't', label: '时间', min: 1, max: 20, step: 1, default: 4, unit: '分' },
    ],
    formula: '路程 = 速度 × 时间',
    tip: '单位时间里行的路程叫速度，速度可以写作 70 米/分；路程 = 速度 × 时间。易错点：求路程却用除法，或把"米/分"读成"每分米"。',
  },
  {
    id: 'g4-c4-mul-solve',
    chapter: 'c4',
    page: 55,
    source: '例题',
    title: '用乘法数量关系解决问题',
    prompt:
      '小明买 3 本笔记本用 18 元，小军要买 5 本同样的笔记本，要用多少元？拖动本数和单价，先求笔记本的单价。',
    kind: 'mul-solve',
    params: [
      { key: 'price', label: '笔记本单价', min: 1, max: 20, step: 1, default: 6, unit: '元' },
      { key: 'count', label: '要买本数', min: 1, max: 20, step: 1, default: 5, unit: '本' },
    ],
    formula: '总价 = 单价 × 数量',
    tip: '单价不变：先求单价（总价 ÷ 数量），再用单价 × 要买的数量。易错点：拿原来的总价去乘数量。',
  },
]
