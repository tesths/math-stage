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
      '一天有 24 小时，钟面上的时针一天要转两圈。拖动时刻或点「开始走一圈」，看同一根指针在内圈读几时、在外圈读几时。',
    kind: 'time24',
    params: [
      { key: 'hour', label: '24 时制时刻', min: 0, max: 23, step: 1, default: 20, unit: '时' },
      { key: 'min', label: '分钟', min: 0, max: 59, step: 1, default: 0, unit: '分' },
    ],
    formula: '24 时记时法 ↔ 12 时记时法',
    tip:
      '同一根指针，内圈读出 1~12 时、外圈读出 13~24 时：外圈 = 内圈 + 12。20 时就是晚上 8 时（8 + 12 = 20），0 时是晚上 12 时（新一天的开始）。易错点：20 时不能写成"晚上 20 时"，也不能算成 20 − 12 = 8 就丢掉"晚上"。',
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
