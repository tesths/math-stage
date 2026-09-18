import type { LabDef } from '../schema/lab'

/** 一天的时间（综合与实践，书页 11-16） */
export const c2Labs: LabDef[] = [
  {
    id: 'g3-c2-time24',
    chapter: 'c2',
    page: 12,
    source: '例题',
    title: '24 时记时法',
    prompt:
      '一天有 24 小时。拖动小时数，观察 24 时记时法与上午/下午普通记时法的对应关系。',
    kind: 'time24',
    params: [
      { key: 'hour', label: '24 时制时刻', min: 0, max: 23, step: 1, default: 20, unit: '时' },
      { key: 'min', label: '分钟', min: 0, max: 55, step: 5, default: 0, unit: '分' },
    ],
    formula: '24 时记时法 ↔ 12 时记时法',
    tip: '0~12 时是一天的前半段，13~23 时减去 12 就是 12 时记时法。20 时就是晚上 8 时。',
  },
  {
    id: 'g3-c2-elapsed',
    chapter: 'c2',
    page: 13,
    source: '例题',
    title: '经过时间的计算',
    prompt:
      '博物馆周二至周五 9:00~17:00 开放。拖动开门和关门时刻，观察"结束 − 开始 = 经过时间"。',
    kind: 'elapsed',
    params: [
      { key: 'start', label: '开门时刻', min: 6, max: 12, step: 1, default: 9, unit: '时' },
      { key: 'end', label: '关门时刻', min: 12, max: 22, step: 1, default: 17, unit: '时' },
    ],
    formula: '经过时间 = 结束 − 开始',
    tip: '经过时间可以用钟面数一数，也可以分段计算再相加，还可以直接相减：17 − 9 = 8（时）。',
  },
]
