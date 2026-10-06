import type { LabDef } from '../schema/lab'

/** 二 混合运算与数量关系（三）（书页 14-25）+ 综合与实践"生活中的分段计费"（书页 26-29） */
export const c2Labs: LabDef[] = [
  {
    id: 'g6-c2-frac-mix',
    chapter: 'c2',
    page: 15,
    source: '例题',
    title: '分数四则混合运算 · 中国结',
    prompt:
      '把两种中国结各做 18 个，第一种每个用 2/5 米彩绳，第二种每个用 3/5 米。一共要用彩绳多少米？拖动滑块换一组数据，比较两种解法。',
    kind: 'frac-mix',
    params: [
      { key: 'a', label: '第一种占的份数', min: 1, max: 4, step: 1, default: 2 },
      { key: 'b', label: '第二种占的份数', min: 1, max: 4, step: 1, default: 3 },
      { key: 'n', label: '各做的个数', min: 2, max: 20, step: 1, default: 18, unit: '个' },
    ],
    formula: 'a/(a+b)×n + b/(a+b)×n = (a/(a+b) + b/(a+b))×n',
    tip: '分数四则混合运算的运算顺序与整数相同，整数的运算律（乘法分配律等）对分数同样适用。',
  },
  {
    id: 'g6-c2-estimate-shop',
    chapter: 'c2',
    page: 16,
    source: '例题',
    title: '估算购物 · 剩下够不够',
    prompt:
      '妈妈带 100 元到超市购物，买了 1 盒鸡蛋（19.6 元/盒）、2 箱牛奶（30.4 元/箱）。剩下的钱够买 1 袋大米（21.6 元）吗？够买 1 袋面粉（16.8 元）吗？',
    kind: 'estimate-shop',
    params: [{ key: 'budget', label: '带的钱', min: 85, max: 150, step: 5, default: 100, unit: '元' }],
    formula: '估大法：最少剩 = 预算 - 20 - 31×2；估小法：最多剩 = 预算 - 19 - 30×2',
    tip: '要判断"够不够买面粉"把单价估大一点（最少剩）；要判断"够不够买大米"把单价估小一点（最多剩），这样结论才可靠。',
  },
  {
    id: 'g6-c2-segment',
    chapter: 'c2',
    page: 19,
    source: '例题',
    title: '求一个数的几分之几 · 运动员',
    prompt:
      '江南小学六年级 45 人参加运动会，其中男运动员占 2/5。女运动员有多少人？拖动滑块改变总人数和男生所占的几分之几，观察线段图。',
    kind: 'segment',
    params: [
      { key: 'total', label: '总人数', min: 20, max: 100, step: 5, default: 45, unit: '人' },
      { key: 'fn', label: '男生占的分子', min: 1, max: 4, step: 1, default: 2 },
      { key: 'fd', label: '男生占的分母', min: 5, max: 10, step: 1, default: 5 },
    ],
    formula: '女运动员 = 总人数 × (1 - 男生占的几分之几)',
    tip: '先算男运动员占的几分之几对应的部分量，再用总数减去；或直接算女生占 1 - 2/5 = 3/5，再乘总人数。',
  },
  {
    id: 'g6-c2-segment-more',
    chapter: 'c2',
    page: 20,
    source: '例题',
    title: '比一个数多（少）几分之几 · 花期',
    prompt:
      '风信子的花期是 14 天，水仙花的花期比风信子长 2/7。水仙花的花期是多少天？拖动滑块改变原来的数和增减的几分之几。',
    kind: 'segment-more',
    params: [
      { key: 'base', label: '原来的天数', min: 10, max: 30, step: 1, default: 14, unit: '天' },
      { key: 'fn', label: '增减的分子', min: 1, max: 4, step: 1, default: 2 },
      { key: 'fd', label: '增减的分母', min: 5, max: 10, step: 1, default: 7 },
      { key: 'mode', label: '增加还是减少', min: 0, max: 1, step: 1, default: 0, unit: '0增加 1减少' },
    ],
    formula: '结果 = 原来 × (1 ± 增加的几分之几)',
    tip: '先算增加的几天 = 14 × 2/7 = 4 天，水仙花 = 14 + 4 = 18 天；或直接 14 × (1 + 2/7)。',
  },
  {
    id: 'g6-c2-work-together',
    chapter: 'c2',
    page: 23,
    source: '例题',
    title: '工程问题 · 志杰和爸爸',
    prompt:
      '平整一块菜地，志杰单独做需要 6 小时，爸爸单独做需要 3 小时。两人一起做，多少小时可以完成？把总工作量看作 1。',
    kind: 'work-together',
    params: [
      { key: 'a', label: '志杰单独时间', min: 2, max: 12, step: 1, default: 6, unit: '小时' },
      { key: 'b', label: '爸爸单独时间', min: 2, max: 12, step: 1, default: 3, unit: '小时' },
    ],
    formula: '合作时间 = 1 ÷ (1/a + 1/b)',
    tip: '志杰每小时完成 1/6，爸爸每小时完成 1/3，一起每小时完成 1/6 + 1/3 = 1/2，2 小时完成。',
  },
  {
    id: 'g6-c2-piecewise',
    chapter: 'c2',
    page: 26,
    source: '综合实践',
    title: '生活中的分段计费 · 出租车',
    prompt:
      '出租车计费：不超过 3 千米收 10 元，超过 3 千米每千米 2.2 元（不足 1 千米按 1 千米计算）。拖动滑块改变行驶路程，算一算车费。',
    kind: 'piecewise',
    params: [{ key: 'km', label: '行驶路程', min: 0, max: 20, step: 0.5, default: 5, unit: '千米' }],
    formula: '车费 = 10（≤3 千米）+ 2.2 × 超出千米数',
    tip: '分段计费：先算起步价内（3 千米）的 10 元，再算超出部分每千米 2.2 元，最后相加；不足 1 千米按 1 千米计。',
  },
]
