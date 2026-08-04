import type { LabDef } from '../schema/lab'

/** 五 可能性（书页 65-73） */
export const c5Labs: LabDef[] = [
  {
    id: 'g5-c5-spinner-rotate',
    chapter: 'c5',
    page: 72,
    source: '练习',
    title: '可能性 · 转盘实验',
    prompt: '转动转盘，指针可能停在哪种颜色区域？调整各颜色区域的大小，观察“可能性最大/最小”的变化。',
    kind: 'spinner',
    params: [
      { key: 'red', label: '红色区域', min: 0, max: 100, step: 5, default: 50, unit: '%' },
      { key: 'blue', label: '蓝色区域', min: 0, max: 100, step: 5, default: 30, unit: '%' },
      { key: 'yellow', label: '黄色区域', min: 0, max: 100, step: 5, default: 20, unit: '%' },
    ],
    formula: '可能性大小与区域面积有关：占的面积越大，指针停在那里的可能性越大',
    tip: '区域面积越大，指针停在该区域的可能性越大；各区域面积相等时可能性相等。',
  },
  {
    id: 'g5-c5-marble-bag',
    chapter: 'c5',
    page: 68,
    source: '例题',
    title: '可能性 · 摸球实验',
    prompt: '盒子里有红球和黄球，任意摸出一个。调整两种球的数量，点击“摸一次”或“摸 30 次”，统计摸球结果。',
    kind: 'marble',
    params: [
      { key: 'red', label: '红球个数', min: 1, max: 9, step: 1, default: 4, unit: '个' },
      { key: 'yellow', label: '黄球个数', min: 1, max: 9, step: 1, default: 6, unit: '个' },
    ],
    formula: '摸到红球的可能性 = 红球个数 ÷ 球的总个数',
    tip: '球的总数不变时，哪种颜色的球多，摸到它的可能性就大；摸的次数越多，统计结果越接近理论可能性。',
  },
]
