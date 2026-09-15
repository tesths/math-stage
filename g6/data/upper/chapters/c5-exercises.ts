import type { LabDef } from '../schema/lab'

/** 五 圆 · 练习题 Lab（练习与应用 / 探索与实践） */
export const c5Exercises: LabDef[] = [
  /** 练习与应用 第 8 题（书页 85） */
  {
    id: 'g6-c5-ex-wheel-roll',
    chapter: 'c5',
    page: 85,
    source: '练习',
    title: '车轮滚动的路程',
    prompt:
      '小浩爸爸从家出发骑自行车到学校用了 10 分钟。这辆自行车车轮的外直径大约是 70 厘米。按车轮每分钟转 100 圈计算，从小浩家到学校大约有多少米？',
    kind: 'ex-c5-wheel-roll',
    params: [
      { key: 'd', label: '车轮直径', min: 40, max: 80, step: 5, default: 70, unit: '厘米' },
      { key: 'n', label: '每分钟转的圈数', min: 50, max: 150, step: 10, default: 100, unit: '圈' },
      { key: 't', label: '骑行时间', min: 5, max: 30, step: 5, default: 10, unit: '分钟' },
    ],
    fixed: {},
    formula: '路程 = 车轮周长 × 总圈数 = π × d × n × t（厘米 → 米要 ÷100）',
    tip: '车轮转一圈车就前进一个周长 C=πd；先求周长，再乘每分钟圈数与时间，注意把厘米化成米。',
  },
  /** 探索与实践 第 16 题（书页 86） */
  {
    id: 'g6-c5-ex-circle-packing',
    chapter: 'c5',
    page: 86,
    source: '探索',
    title: '长方形纸剪圆片',
    prompt:
      '用一张长 15 厘米、宽 8 厘米的长方形纸剪直径是 2 厘米的圆形纸片，最多能剪多少个？',
    kind: 'ex-c5-circle-packing',
    params: [
      { key: 'L', label: '长方形纸的长', min: 10, max: 20, step: 1, default: 15, unit: '厘米' },
      { key: 'W', label: '长方形纸的宽', min: 4, max: 12, step: 1, default: 8, unit: '厘米' },
      { key: 'd', label: '圆片的直径', min: 1, max: 4, step: 0.5, default: 2, unit: '厘米' },
    ],
    fixed: {},
    formula: '最多剪的个数 = ⌊长 ÷ 直径⌋ × ⌊宽 ÷ 直径⌋',
    tip: '圆片要一行一行整齐地排，两个方向相除后都要去掉余数（去尾法）；余下的边角料拼不出整圆，所以不能按面积相除算个数。',
  },
]
