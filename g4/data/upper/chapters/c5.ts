import type { LabDef } from '../schema/lab'

/** 五 混合运算与数量关系（二）（书页 57-63） */
export const c5Labs: LabDef[] = [
  {
    id: 'g4-c5-mix-three',
    chapter: 'c5',
    page: 59,
    source: '例题',
    title: '三步混合运算 · 合唱组人数',
    prompt:
      '书法组 18 人，绘画组是书法组的 2 倍，合唱组比书法组和绘画组的总人数少 6 人。拖动各组人数，观察"先乘除后加减"。',
    kind: 'mix-three',
    params: [
      { key: 'calligraphy', label: '书法组', min: 1, max: 30, step: 1, default: 18, unit: '人' },
      { key: 'times', label: '绘画组倍数', min: 1, max: 5, step: 1, default: 2, unit: '倍' },
      { key: 'less', label: '合唱组少几人', min: 1, max: 20, step: 1, default: 6, unit: '人' },
    ],
    formula: '18 + 18 × 2 − 6',
    tip: '没有括号的算式里既有乘除法又有加减法，要先算乘除法，再算加减法。易错点：从左往右依次算，先算了加法。',
  },
  {
    id: 'g4-c5-mix-bracket',
    chapter: 'c5',
    page: 61,
    source: '例题',
    title: '含括号的混合运算 · 买模型',
    prompt:
      '王老师带 600 元买了 4 个飞机模型（每个 126 元），剩下的钱买舰船模型（每个 48 元）能买几个？',
    kind: 'mix-bracket',
    params: [
      { key: 'money', label: '带的钱', min: 100, max: 1000, step: 50, default: 600, unit: '元' },
      { key: 'plane', label: '飞机模型单价', min: 10, max: 200, step: 1, default: 126, unit: '元' },
      { key: 'pcount', label: '飞机模型个数', min: 1, max: 6, step: 1, default: 4, unit: '个' },
      { key: 'ship', label: '舰船模型单价', min: 10, max: 100, step: 1, default: 48, unit: '元' },
    ],
    formula: '（600 − 126 × 4）÷ 48',
    tip: '有小括号要先算小括号里面的；既有小括号又有中括号，先算小括号，再算中括号。易错点：漏写、漏算括号，导致先算了括号外面的乘法。',
  },
  {
    id: 'g4-c5-mix-segment',
    chapter: 'c5',
    page: 62,
    source: '例题',
    title: '线段图分析数量关系 · 苹果箱数',
    prompt:
      '水果店运进 20 箱梨，橘子比梨少 12 箱，苹果是梨和橘子总箱数的 3 倍。拖动数据，用线段图分析三步数量关系。',
    kind: 'mix-segment',
    params: [
      { key: 'pear', label: '梨的箱数', min: 5, max: 60, step: 1, default: 20, unit: '箱' },
      { key: 'less', label: '橘子比梨少', min: 1, max: 20, step: 1, default: 12, unit: '箱' },
      { key: 'times', label: '苹果倍数', min: 1, max: 6, step: 1, default: 3, unit: '倍' },
    ],
    formula: '苹果 =（梨 + 橘子）× 3',
    tip: '先求橘子的箱数（梨 − 少），再求梨和橘子的总箱数，最后乘倍数求苹果箱数。易错点：把"少"当成负数，或直接把梨 × 倍数。',
  },
]
