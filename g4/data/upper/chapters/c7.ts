import type { LabDef } from '../schema/lab'

/** 五 多位数的认识（书页 67-88） */
export const c7Labs: LabDef[] = [
  {
    id: 'g4-c7-num-count',
    chapter: 'c7',
    page: 69,
    source: '例题',
    title: '认识计数单位 · 一千一千地数',
    prompt:
      '9999 添上 1 是一万。拖动数量，观察"10 个一千是一万、10 个一万是十万"的十进制关系。',
    kind: 'num-count',
    params: [
      { key: 'v', label: '数量', min: 1000, max: 100000, step: 1000, default: 10000, unit: '' },
    ],
    formula: '10 个一千 = 一万',
    tip: '10 个一千是一万，10 个一万是十万，10 个十万是一百万，10 个一百万是一千万。',
  },
  {
    id: 'g4-c7-num-place',
    chapter: 'c7',
    page: 81,
    source: '例题',
    title: '数位顺序表 · 十进制计数法',
    prompt:
      '数字写在不同的数位上，就表示不同的计数单位。拖动要观察的数字，认识个级、万级、亿级的数位与计数单位。',
    kind: 'num-place',
    params: [
      { key: 'digit', label: '要观察的数字', min: 1, max: 9, step: 1, default: 3, unit: '' },
      { key: 'place', label: '数位', min: 1, max: 12, step: 1, default: 4, unit: '个位起第几位' },
    ],
    formula: '每相邻两个计数单位之间的进率都是 10',
    tip: '十进制计数法：每相邻两个计数单位之间的进率都是 10。',
  },
  {
    id: 'g4-c7-num-multidigit',
    chapter: 'c7',
    page: 75,
    source: '例题',
    title: '认识多位数 · 地球的数据',
    prompt:
      '地球赤道周长约四万千米、太阳中心温度约一千六百万摄氏度。拖动计数单位，观察万级、亿级数的组成。',
    kind: 'num-multidigit',
    params: [
      { key: 'wan', label: '万级个数', min: 0, max: 9999, step: 1, default: 1600, unit: '万' },
      { key: 'yi', label: '亿级个数', min: 0, max: 99, step: 1, default: 0, unit: '亿' },
    ],
    formula: '数 = 亿级 × 亿 + 万级 × 万',
    tip: '从右边起每四个数位是一级：个级表示多少个一，万级表示多少个万，亿级表示多少个亿。',
  },
  {
    id: 'g4-c7-num-approx',
    chapter: 'c7',
    page: 81,
    source: '例题',
    title: '用"四舍五入"求近似数',
    prompt:
      '384204 的千位上是 4，接近 38 万；386685 的千位上是 6，接近 39 万。拖动数值，观察四舍五入到万位的近似数。',
    kind: 'num-approx',
    params: [
      { key: 'v', label: '数值', min: 100000, max: 999999, step: 1, default: 384204, unit: '' },
    ],
    formula: '四舍五入到万位',
    tip: '求近似数用四舍五入法：保留到某一位，把这一位右边各数位舍去；若舍去部分最高位≥5，就向前一位进 1。',
  },
  {
    id: 'g4-c7-num-idcode',
    chapter: 'c7',
    page: 83,
    source: '例题',
    title: '数字编码 · 身份证号码',
    prompt:
      '身份证号码有 18 位：前 6 位是行政区划代码，第 7~14 位是出生日期码。拖动出生年月日，观察编码的组成。',
    kind: 'num-idcode',
    params: [
      { key: 'year', label: '出生年份', min: 2000, max: 2024, step: 1, default: 2016, unit: '年' },
      { key: 'month', label: '出生月份', min: 1, max: 12, step: 1, default: 2, unit: '月' },
      { key: 'day', label: '出生日', min: 1, max: 28, step: 1, default: 18, unit: '日' },
    ],
    formula: '第 7~14 位 = 出生日期（YYYYMMDD）',
    tip: '身份证号码第 7~14 位是出生日期码，用 8 位数字表示年月日，月、日用两位数。',
  },
]
