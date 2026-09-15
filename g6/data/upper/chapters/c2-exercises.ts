import type { LabDef } from '../schema/lab'

/** 二 混合运算与数量关系（三）· 练习题可视化（练习三 第 14 题 / 练习四 第 16 题） */
export const c2Exercises: LabDef[] = [
  {
    id: 'g6-c2-ex-overlap-club',
    chapter: 'c2',
    page: 22,
    source: '练习',
    title: '既喜欢跳舞又唱歌',
    prompt:
      '六年级一班有 48 人，其中 2/3 喜欢跳舞，3/4 喜欢唱歌，没有人既不喜欢跳舞又不喜欢唱歌。既喜欢跳舞又喜欢唱歌的有多少人？',
    kind: 'ex-c2-overlap-club',
    params: [
      { key: 'total', label: '全班人数', min: 24, max: 120, step: 12, default: 48, unit: '人' },
      { key: 'dn', label: '喜欢跳舞的分子（分母 3）', min: 2, max: 3, step: 1, default: 2 },
      { key: 'sn', label: '喜欢唱歌的分子（分母 4）', min: 2, max: 4, step: 1, default: 3 },
    ],
    fixed: { danceDen: 3, singDen: 4 },
    formula: '重叠人数 = 总人数 × (dn/3 + sn/4 − 1)',
    tip: '把全班看作单位“1”：喜欢跳舞的与喜欢唱歌的人数相加，把“两样都喜欢”的人算了两遍，所以重叠人数 = 两部分之和 − 全班人数。',
  },
  {
    id: 'g6-c2-ex-egg-crate',
    chapter: 'c2',
    page: 18,
    source: '练习',
    title: '一筐鸡蛋卖多少元',
    prompt:
      '一筐鸡蛋连筐重 8 千克。卖出一半鸡蛋后，连筐重 4.5 千克。如果鸡蛋每千克 12.8 元，这筐鸡蛋一共能卖多少元？',
    kind: 'ex-c2-egg-crate',
    params: [
      { key: 'crate', label: '空筐重', min: 0.5, max: 2, step: 0.5, default: 1, unit: '千克' },
      { key: 'withEggs', label: '连筐重', min: 4, max: 12, step: 0.5, default: 8, unit: '千克' },
      { key: 'price', label: '鸡蛋单价', min: 8, max: 20, step: 0.4, default: 12.8, unit: '元/千克' },
    ],
    fixed: { soldRatio: 0.5 },
    formula: '鸡蛋总重 = 连筐重 − 空筐重；卖后连筐重 = 空筐重 + 鸡蛋总重 × 0.5；收入 = 鸡蛋总重 × 单价',
    tip: '筐重两次称重都在里面，相减就抵消了：8−4.5=3.5 千克正好是卖出的一半鸡蛋，全部是 3.5×2=7 千克，再乘 12.8。',
  },
]
