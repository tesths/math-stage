import type { ChapterId } from '@data/schema/lab'
import { chapters } from '@data/chapters/meta'

/** 训练小游戏元数据 */
export interface GameMeta {
  /** 路由 slug，唯一 */
  slug: string
  name: string
  icon: string
  summary: string
  howTo: string
  /** 适用单元 */
  chapters: ChapterId[]
}

export const GAMES: GameMeta[] = [
  {
    slug: 'decimal-mul',
    name: '小数乘法口算',
    icon: '✖️',
    summary: '小数乘小数、乘整数的口算挑战',
    howTo: '随机出小数乘法题（如 0.6×4、2.5×0.3）。在选项中选出正确答案，连对 5 题过关。',
    chapters: ['c1'],
  },
  {
    slug: 'decimal-div',
    name: '小数除法口算',
    icon: '➗',
    summary: '小数除以整数、除以小数的口算挑战',
    howTo: '随机出小数除法题（如 7.2÷3、4.8÷0.6）。在选项中选出正确答案，答对 5 题过关。',
    chapters: ['c1'],
  },
  {
    slug: 'decimal-points',
    name: '积的小数位数',
    icon: '🎯',
    summary: '两个因数的小数位数决定积的小数位数',
    howTo: '给出两个小数相乘，判断积有几位小数。别忘了先去掉末尾的 0 再数位。答对 5 题过关。',
    chapters: ['c1'],
  },
  {
    slug: 'mix-calc',
    name: '分数混合运算',
    icon: '🧩',
    summary: '分数四则混合运算，先乘除后加减',
    howTo: '随机出分数混合运算题，从选项中选择计算结果。答对 5 题过关。',
    chapters: ['c2'],
  },
  {
    slug: 'frac-find',
    name: '求一个数的几分之几',
    icon: '🍰',
    summary: '总数 × 几分之几 = 部分量',
    howTo: '给出总数和占的几分之几，求对应的部分是多少。输入答案，答对 5 题过关。',
    chapters: ['c2'],
  },
  {
    slug: 'taxi-fare',
    name: '出租车计费',
    icon: '🚕',
    summary: '分段计费：起步价 + 超出部分',
    howTo: '模拟出租车计价：3 千米内 10 元，超出每千米 2.2 元。根据行驶路程算出车费，答对 5 题过关。',
    chapters: ['c2'],
  },
  {
    slug: 'binary-quiz',
    name: '二进制的秘密',
    icon: '💻',
    summary: '把十进制数改写成二进制数',
    howTo: '给出一个十进制数（0~31），把它写成二进制。输入答案，答对 5 题过关。',
    chapters: ['c3'],
  },
  {
    slug: 'compare-quiz',
    name: '数的大小比较',
    icon: '⚖️',
    summary: '比较相同计数单位的个数',
    howTo: '给出两个数（整数、小数或分数），判断大小关系。答对 5 题过关。',
    chapters: ['c3'],
  },
  {
    slug: 'ratio-simplify',
    name: '化简比高手',
    icon: '✂️',
    summary: '把比化成最简整数比',
    howTo: '给出一个整数比或小数比，利用比的基本性质化简。从选项中选出最简整数比，答对 5 题过关。',
    chapters: ['c4'],
  },
  {
    slug: 'solve-ratio',
    name: '解比例',
    icon: '🧪',
    summary: '外项积 = 内项积，求出未知数',
    howTo: '给出一个比例，根据外项积等于内项积求出未知数 x。输入答案，答对 5 题过关。',
    chapters: ['c4'],
  },
  {
    slug: 'circle-calc',
    name: '圆的计算',
    icon: '⭕',
    summary: '圆的周长与面积计算',
    howTo: '随机给出半径或直径，求圆的周长或面积（π 取 3.14）。输入答案，答对 5 题过关。',
    chapters: ['c5'],
  },
  {
    slug: 'scale-map',
    name: '比例尺换算',
    icon: '🗺️',
    summary: '图上距离与实际距离的换算',
    howTo: '给出比例尺和图上距离，求实际距离；或给出比例尺和实际距离，求图上距离。答对 5 题过关。',
    chapters: ['c6'],
  },
]

export function unitNoOf(chapter: ChapterId): number {
  return chapters.find((c) => c.id === chapter)!.no
}
