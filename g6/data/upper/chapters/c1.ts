import type { LabDef } from '../schema/lab'

/** 一 小数乘法和除法（二）（书页 1-13） */
export const c1Labs: LabDef[] = [
  {
    id: 'g6-c1-mul-decimal',
    chapter: 'c1',
    page: 2,
    source: '例题',
    title: '一个数乘小数 · 方格模型',
    prompt:
      '黄瓜苗育苗区是长 0.6 米、宽 0.4 米的长方形。0.6 × 0.4 等于多少？拖动滑块改变长和宽，在方格图中数一数积是多少。',
    kind: 'mul-decimal',
    params: [
      { key: 'a', label: '长（米）', min: 0.1, max: 0.9, step: 0.1, default: 0.6, unit: '米' },
      { key: 'b', label: '宽（米）', min: 0.1, max: 0.9, step: 0.1, default: 0.4, unit: '米' },
    ],
    formula: '积 = 0.1×0.1 方格的个数 ÷ 100',
    tip: '0.6×0.4 把两个因数各 ×10 变成整数乘法 6×4=24，再 ÷100，即把积缩小 100 倍，得到 0.24。',
  },
  {
    id: 'g6-c1-mul-compare',
    chapter: 'c1',
    page: 6,
    source: '练习',
    title: '积与因数的大小比较',
    prompt:
      '先计算，再比较第一个乘数和积的大小：4.9×1.01、4.9×1、4.9×0.99。你有什么发现？拖动滑块试一试。',
    kind: 'mul-compare',
    params: [
      { key: 'base', label: '第一个乘数', min: 0.5, max: 9.5, step: 0.1, default: 4.9 },
      { key: 'factor', label: '另一个乘数', min: 0.5, max: 1.5, step: 0.01, default: 1.01 },
    ],
    formula: '积 = 第一个乘数 × 另一个乘数',
    tip: '另一个乘数大于 1，积大于第一个乘数；等于 1，积相等；小于 1，积小于第一个乘数。',
  },
  {
    id: 'g6-c1-mul-approx',
    chapter: 'c1',
    page: 4,
    source: '例题',
    title: '积的近似值 · 苹果',
    prompt:
      '苹果的单价是 6.25 元/千克，购买 1.5 千克苹果要付多少元？（得数保留一位小数）拖动滑块改变单价、数量与保留位数。',
    kind: 'mul-approx',
    params: [
      { key: 'price', label: '单价（元/千克）', min: 0.5, max: 9.95, step: 0.05, default: 6.25, unit: '元' },
      { key: 'count', label: '数量（千克）', min: 0.5, max: 9.5, step: 0.5, default: 1.5, unit: '千克' },
      { key: 'digits', label: '保留位数', min: 1, max: 2, step: 1, default: 1 },
    ],
    formula: '总价 = 单价 × 数量（四舍五入到指定位数）',
    tip: '求积的近似值，先按小数乘法算出积，再按"四舍五入"法保留需要的位数。',
  },
  {
    id: 'g6-c1-div-decimal',
    chapter: 'c1',
    page: 7,
    source: '例题',
    title: '一个数除以小数 · 转化',
    prompt:
      '红彩带长 0.6 米，剪成 0.3 米的小段可以剪几段？一个数除以小数，可以把被除数和除数的小数点同时向右移动相同的位数，转化成整数除法。',
    kind: 'div-decimal',
    params: [{ key: 'sel', label: '例题选择', min: 0, max: 2, step: 1, default: 0, unit: '0红彩带 1绿彩带 2微型' }],
    fixed: {},
    formula: '转化：除数变成整数，被除数小数点同步右移',
    tip: '如 0.6÷0.3 转化为 6÷3；1.2÷0.24 转化为 120÷24；0.34÷0.017 转化为 340÷17。',
  },
  {
    id: 'g6-c1-div-approx',
    chapter: 'c1',
    page: 9,
    source: '例题',
    title: '商的近似值 · 海狮游速',
    prompt:
      '海狮的游速是 40 千米/时，大约是每分多少米？（得数保留两位小数）求商的近似值，一般先算出比需要保留的位数多一位的商，再四舍五入。',
    kind: 'div-approx',
    params: [{ key: 'speed', label: '游速（千米/时）', min: 30, max: 90, step: 5, default: 40, unit: '千米/时' }],
    formula: '每分米数 = 千米/时 × 1000 ÷ 60（保留两位小数）',
    tip: '40 千米/时 = 40000 米/时，1 时 = 60 分，40000÷60 ≈ 666.67 米/分。',
  },
  {
    id: 'g6-c1-round-life',
    chapter: 'c1',
    page: 10,
    source: '例题',
    title: '合理取近似值 · 进一去尾',
    prompt:
      '每支自动铅笔 3.5 元，300 元最多可以买多少支？取近似值时，要根据实际问题合理灵活地思考：有时用"进一法"，有时用"去尾法"。',
    kind: 'round-life',
    params: [
      { key: 'method', label: '取近似值的方法', min: 0, max: 1, step: 1, default: 0, unit: '0去尾 1进一' },
      { key: 'total', label: '总钱数/总量', min: 100, max: 500, step: 5, default: 300, unit: '元' },
    ],
    formula: '结果 = 商（去尾法取整数部分 / 进一法加 1）',
    tip: '求"最多买几支"用去尾法，求"至少准备几个"用进一法，不能简单四舍五入。',
  },
]
