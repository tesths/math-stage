import type { LabDef } from '../schema/lab'

/** 附录 倍的认识（书页 111-118） */
export const c12Labs: LabDef[] = [
  {
    id: 'g3-c12-times-concept',
    chapter: 'c12',
    page: 112,
    source: '例题',
    title: '倍的含义',
    prompt:
      '玩跳棋的每组 2 人，有 3 组，一共 6 人，可以看作 2 的 3 倍。拖动每组人数和组数，观察"几个几"。',
    kind: 'times',
    params: [
      { key: 'each', label: '每组人数', min: 2, max: 9, step: 1, default: 2, unit: '人' },
      { key: 'groups', label: '组数', min: 1, max: 9, step: 1, default: 3, unit: '组' },
    ],
    formula: '几个几 = 每份数 × 份数',
    tip: '几个几相加就是"几的几倍"：3 个 2 是 2 的 3 倍，写成 2 × 3 = 6。',
  },
  {
    id: 'g3-c12-times-mul',
    chapter: 'c12',
    page: 113,
    source: '例题',
    title: '求一个数的几倍是多少',
    prompt:
      '下围棋的有 4 人，下象棋的人数是下围棋的 2 倍。拖动人数和倍数，用乘法求几倍是多少。',
    kind: 'times-mul',
    params: [
      { key: 'base', label: '围棋人数', min: 2, max: 20, step: 1, default: 4, unit: '人' },
      { key: 'times', label: '几倍', min: 2, max: 9, step: 1, default: 2, unit: '' },
    ],
    formula: '几倍是多少 = 每份数 × 倍数',
    tip: '求一个数的几倍是多少，就是求几个几是多少，用乘法：4 × 2 = 8（人）。',
  },
  {
    id: 'g3-c12-times-div',
    chapter: 'c12',
    page: 115,
    source: '例题',
    title: '求一个数是另一个数的几倍',
    prompt:
      '黄枫叶 6 片，绿枫叶 3 片，黄枫叶的片数是绿枫叶的几倍？拖动两种树叶的数量，用除法求倍数。',
    kind: 'times-div',
    params: [
      { key: 'total', label: '黄枫叶', min: 2, max: 30, step: 1, default: 6, unit: '片' },
      { key: 'base', label: '绿枫叶', min: 1, max: 15, step: 1, default: 3, unit: '片' },
    ],
    formula: '几倍 = 一个数 ÷ 另一个数',
    tip: '求一个数是另一个数的几倍，就是求一个数里面有几个另一个数，用除法：6 ÷ 3 = 2（倍）。',
  },
  {
    id: 'g3-c12-times-mix',
    chapter: 'c12',
    page: 116,
    source: '练习',
    title: '倍的混合练习',
    prompt:
      '妈妈今年 32 岁，爸爸比妈妈大 3 岁，小阳 7 岁。拖动数据，分别求爸爸年龄和倍的关系。',
    kind: 'times-div',
    params: [
      { key: 'mom', label: '妈妈年龄', min: 24, max: 60, step: 1, default: 32, unit: '岁' },
      { key: 'more', label: '爸爸比妈妈大', min: 1, max: 10, step: 1, default: 3, unit: '岁' },
      { key: 'son', label: '小阳年龄', min: 1, max: 12, step: 1, default: 7, unit: '岁' },
    ],
    formula: '爸爸 = 妈妈 + 大；爸爸 ÷ 小阳 = 几倍',
    tip: '先求爸爸年龄：32 + 3 = 35 岁；再求爸爸年龄是小阳的几倍：35 ÷ 7 = 5（倍）。',
  },
]
