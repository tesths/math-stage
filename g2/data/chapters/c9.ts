import type { LabDef } from '../schema/lab'

/** 六 有余数的除法（书页 91-97） */
export const c9Labs: LabDef[] = [
  {
    id: 'g2-c9-remainder',
    chapter: 'c9',
    page: 92,
    source: '例题',
    title: '分物有余数',
    prompt:
      '10 瓶蜂蜜，每只小熊分 3 瓶，可以分给 3 只小熊，还剩 1 瓶。10 ÷ 3 = 3 …… 1。拖动总数和每份几个，观察商和余数。',
    kind: 'remainder',
    params: [
      { key: 'total', label: '总数', min: 8, max: 30, step: 1, default: 10, unit: '个' },
      { key: 'per', label: '每份几个', min: 2, max: 6, step: 1, default: 3, unit: '个' },
    ],
    formula: '总数 ÷ 每份几个 = 份数 …… 余数',
    tip: '剩下的瓶数比每只小熊分得的瓶数少，余数都比除数小。',
  },
  {
    id: 'g2-c9-remainder-rule',
    chapter: 'c9',
    page: 93,
    source: '试一试',
    title: '余数比除数小',
    prompt:
      '用 9、10、11、12 根小棒摆三角形（每 3 根一个）：9÷3=3，10÷3=3……1，11÷3=3……2，12÷3=4。拖动除数，看看余数最大是几。',
    kind: 'remainder-rule',
    params: [{ key: 'd', label: '除数', min: 2, max: 7, step: 1, default: 3, unit: '' }],
    formula: '最大余数 = 除数 - 1',
    tip: '余数都比除数小，余数最大是除数减 1。',
  },
]
