import type { LabDef } from '../schema/lab'

/** 七 数量关系的分析（一）（书页 88-94） */
export const c10Labs: LabDef[] = [
  {
    id: 'g3-c10-segment-total',
    chapter: 'c10',
    page: 89,
    source: '例题',
    title: '线段图：还剩多少',
    prompt:
      '一共采摘 300 箱水果，上午运走 120 箱，下午运走 160 箱，还剩多少箱？拖动数据，观察线段图和数量关系。',
    kind: 'segment',
    params: [
      { key: 'total', label: '总数', min: 100, max: 1000, step: 10, default: 300, unit: '箱' },
      { key: 'part1', label: '上午运走', min: 10, max: 500, step: 10, default: 120, unit: '箱' },
      { key: 'part2', label: '下午运走', min: 10, max: 500, step: 10, default: 160, unit: '箱' },
    ],
    formula: '剩下的 = 总数 − 运走的和',
    tip: '剩下的箱数 = 总箱数 − 上午运走的箱数 − 下午运走的箱数；也可以先求运走的和。',
  },
  {
    id: 'g3-c10-segment-more',
    chapter: 'c10',
    page: 90,
    source: '想想做做',
    title: '线段图：多几、少几',
    prompt:
      '篮球有 50 个，排球比篮球多 15 个，足球比排球多 20 个。拖动数据，观察"多几"的线段图。',
    kind: 'segment',
    params: [
      { key: 'base', label: '篮球个数', min: 10, max: 100, step: 1, default: 50, unit: '个' },
      { key: 'more1', label: '排球多几个', min: 1, max: 50, step: 1, default: 15, unit: '个' },
      { key: 'more2', label: '足球多几个', min: 1, max: 50, step: 1, default: 20, unit: '个' },
    ],
    formula: '排球 = 篮球 + 多；足球 = 排球 + 多',
    tip: '求比一个数多几的数，用加法；线段图能清楚地看出每一步的数量关系。',
  },
  {
    id: 'g3-c10-rows',
    chapter: 'c10',
    page: 91,
    source: '例题',
    title: '变换队形',
    prompt:
      '144 人表演武术操，原来每行 6 人，后来每行多排 2 人，一共排多少行？拖动数据，观察从问题想起分析数量关系。',
    kind: 'segment',
    params: [
      { key: 'total', label: '总人数', min: 60, max: 300, step: 1, default: 144, unit: '人' },
      { key: 'per', label: '原来每行', min: 4, max: 12, step: 1, default: 6, unit: '人' },
      { key: 'more', label: '每行多排', min: 1, max: 6, step: 1, default: 2, unit: '人' },
    ],
    formula: '后来的行数 = 总人数 ÷ (原来每行 + 多排)',
    tip: '从问题想起：要求一共排多少行，要用总人数除以后来每行的人数。总人数没有变。',
  },
  {
    id: 'g3-c10-times-word',
    chapter: 'c10',
    page: 90,
    source: '练习',
    title: '两步计算实际问题',
    prompt:
      '三年级作品 39 幅，四年级作品是三年级的 2 倍，五年级作品比四年级少 13 幅。五年级有多少幅？',
    kind: 'segment',
    params: [
      { key: 'base', label: '三年级', min: 10, max: 100, step: 1, default: 39, unit: '幅' },
      { key: 'times', label: '四年级是几倍', min: 2, max: 5, step: 1, default: 2, unit: '' },
      { key: 'less', label: '五年级少几幅', min: 1, max: 50, step: 1, default: 13, unit: '幅' },
    ],
    formula: '五年级 = 三年级 × 倍数 − 少',
    tip: '先求四年级作品：39 × 2 = 78 幅，再求五年级：78 − 13 = 65 幅。',
  },
]
