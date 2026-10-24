import type { LabDef } from '../schema/lab'

/** 五 两位数加、减两位数（书页 74-85） */
export const c7Labs: LabDef[] = [
  {
    id: 'g2-c7-twodigit-add',
    chapter: 'c7',
    page: 79,
    source: '例题',
    title: '两位数加法（进位）',
    prompt:
      '买 34 个蓝色羽毛球和 28 个白色羽毛球，一共 34 + 28 = ? 个位 4 + 8 得 12，满十向十位进 1。拖动数字，观察怎样计算。',
    kind: 'twodigit-add',
    params: [
      { key: 'ta', label: '第一个数十位', min: 1, max: 5, step: 1, default: 3, unit: '十' },
      { key: 'oa', label: '第一个数个位', min: 0, max: 9, step: 1, default: 4, unit: '个' },
      { key: 'tb', label: '第二个数十位', min: 1, max: 5, step: 1, default: 2, unit: '十' },
      { key: 'ob', label: '第二个数个位', min: 0, max: 9, step: 1, default: 8, unit: '个' },
    ],
    formula: '十位相加 + 个位相加（满十进一）',
    tip: '笔算两位数加法：相同数位对齐，从个位加起；个位相加满十，向十位进 1，十位相加时要把进上来的 1 也算进去。易错点：忘加进位的 1 是最常见的错。',
  },
  {
    id: 'g2-c7-twodigit-sub',
    chapter: 'c7',
    page: 81,
    source: '例题',
    title: '两位数减法（退位）',
    prompt:
      '原来有 54 个羽毛球，买走 36 个，还剩 54 - 36 = ? 个位 4 减 6 不够减，从十位退 1 当 10。拖动数字，观察怎样计算。',
    kind: 'twodigit-sub',
    params: [
      { key: 'ta', label: '被减数十位', min: 3, max: 9, step: 1, default: 5, unit: '十' },
      { key: 'oa', label: '被减数个位', min: 0, max: 9, step: 1, default: 4, unit: '个' },
      { key: 'tb', label: '减数十位', min: 1, max: 5, step: 1, default: 3, unit: '十' },
      { key: 'ob', label: '减数个位', min: 0, max: 9, step: 1, default: 6, unit: '个' },
    ],
    formula: '十位相减 - 个位相减（不够退一当十）',
    tip: '笔算两位数减法：相同数位对齐，从个位减起；个位不够减，从十位退 1 当 10，再和个位上的数合起来减。易错点：退位后十位要少 1，别沿用原来的十位数。',
  },
]
