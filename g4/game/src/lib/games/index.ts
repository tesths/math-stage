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
    slug: 'div-quiz',
    name: '除法口算',
    icon: '➗',
    summary: '整十数除以整十数口算挑战',
    howTo: '随机出整十数除法口算题（如 60÷20、180÷30）。输入商，答对 5 题过关。',
    chapters: ['c1'],
  },
  {
    slug: 'div-try-quiz',
    name: '试商小达人',
    icon: '🎯',
    summary: '把除数看作整十数来试商',
    howTo: '给出两、三位数除以两位数的算式，把除数看作整十数，选择最接近的试商。答对 5 题过关。',
    chapters: ['c1'],
  },
  {
    slug: 'perimeter-quiz',
    name: '周长挑战',
    icon: '📏',
    summary: '长方形、正方形周长速算',
    howTo: '随机给出长方形（长、宽）或正方形（边长），求周长。选择正确答案，答对 5 题过关。',
    chapters: ['c2'],
  },
  {
    slug: 'area-quiz',
    name: '面积挑战',
    icon: '📐',
    summary: '长方形、正方形面积速算',
    howTo: '随机给出长方形（长、宽）或正方形（边长），求面积。选择正确答案，答对 5 题过关。',
    chapters: ['c2'],
  },
  {
    slug: 'area-unit-quiz',
    name: '面积单位换算',
    icon: '🧩',
    summary: '平方厘米、平方分米、平方米互化',
    howTo: '给出一个面积数和单位，把它换算成目标单位（进率 100）。答对 5 题过关。',
    chapters: ['c2'],
  },
  {
    slug: 'price-quiz',
    name: '购物总价',
    icon: '🛒',
    summary: '总价 = 单价 × 数量',
    howTo: '给出单价和数量，求总价；或给出总价和单价求数量。答对 5 题过关。',
    chapters: ['c4', 'c6'],
  },
  {
    slug: 'speed-quiz',
    name: '速度时间路程',
    icon: '🚗',
    summary: '路程 = 速度 × 时间',
    howTo: '给出速度和时间求路程，或给出路程和时间求速度。答对 5 题过关。',
    chapters: ['c4'],
  },
  {
    slug: 'mix-calc-quiz',
    name: '混合运算快算',
    icon: '🧮',
    summary: '三步混合运算（先乘除后加减）',
    howTo: '随机出三步混合运算题（含小括号）。选择正确的得数，答对 5 题过关。',
    chapters: ['c5'],
  },
  {
    slug: 'approx-quiz',
    name: '四舍五入',
    icon: '🔍',
    summary: '用四舍五入求近似数',
    howTo: '给出一个数，四舍五入到万位（或亿位），选择正确的近似数。答对 5 题过关。',
    chapters: ['c7'],
  },
  {
    slug: 'big-mul-quiz',
    name: '大数乘法',
    icon: '🚀',
    summary: '三位数乘两位数口算',
    howTo: '随机出三位数乘两位数的算式，选择正确的积。答对 5 题过关。',
    chapters: ['c9'],
  },
]

export function unitNoOf(chapter: ChapterId): number {
  return chapters.find((c) => c.id === chapter)!.no
}
