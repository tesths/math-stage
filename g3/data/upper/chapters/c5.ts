import type { LabDef } from '../schema/lab'

/** 三 数据的收集与整理 / 了解你的好朋友（综合与实践，书页 36-49） */
export const c5Labs: LabDef[] = [
  {
    id: 'g3-c5-tally',
    chapter: 'c5',
    page: 37,
    source: '综合实践',
    title: '画"正"字记录数据',
    prompt:
      '班级联欢会要买水果，调查每个同学最喜欢的一种水果。拖动各种水果的人数，用"正"字记录并填统计表。',
    kind: 'tally',
    params: [
      { key: 'apple', label: '苹果', min: 0, max: 30, step: 1, default: 9, unit: '人' },
      { key: 'orange', label: '橘子', min: 0, max: 30, step: 1, default: 6, unit: '人' },
      { key: 'banana', label: '香蕉', min: 0, max: 30, step: 1, default: 4, unit: '人' },
      { key: 'grape', label: '葡萄', min: 0, max: 30, step: 1, default: 2, unit: '人' },
    ],
    formula: '合计 = 各项人数之和',
    tip: '一个「正」字 5 画，每画表示 1 人；用「正」字整理数据又快又不容易漏。易错点：把「正」字当成 4 画。',
  },
  {
    id: 'g3-c5-stat',
    chapter: 'c5',
    page: 38,
    source: '想想做做',
    title: '统计表与统计图',
    prompt:
      '小春调查了全班同学最喜欢的童话故事种类。拖动四种童话的人数，观察统计表与条形统计图。',
    kind: 'stat',
    params: [
      { key: 'campus', label: '校园童话', min: 0, max: 20, step: 1, default: 10, unit: '人' },
      { key: 'animal', label: '动物童话', min: 0, max: 20, step: 1, default: 7, unit: '人' },
      { key: 'scifi', label: '科幻童话', min: 0, max: 20, step: 1, default: 15, unit: '人' },
      { key: 'detective', label: '侦探童话', min: 0, max: 20, step: 1, default: 8, unit: '人' },
    ],
    formula: '合计 = 四类人数之和',
    tip: '统计表能看清各项人数，条形统计图能一眼比出多少；合计 = 各项之和。易错点：合计只加了几项就填。',
  },
]
