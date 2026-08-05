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
    slug: 'mult-table',
    name: '九九乘法表',
    icon: '✖️',
    summary: '1~9 的乘法口算挑战',
    howTo: '随机出表内乘法题（如 6×7）。在选项中选出正确答案，连对 5 题过关。',
    chapters: ['c1', 'c4'],
  },
  {
    slug: 'divide-quiz',
    name: '除法口算',
    icon: '➗',
    summary: '用乘法口诀求商的练习',
    howTo: '随机出表内除法题（如 56÷8）。想乘法口诀求商，答对 5 题过关。',
    chapters: ['c2', 'c4'],
  },
  {
    slug: 'mix-calc',
    name: '表内乘除混合',
    icon: '🧮',
    summary: '乘法除法一起来，看谁算得快',
    howTo: '随机出表内乘除混合算式（× 或 ÷）。在选项中选出正确答案，答对 5 题过关。',
    chapters: ['c4', 'c10'],
  },
  {
    slug: 'divide-share',
    name: '平均分挑战',
    icon: '🍬',
    summary: '平均分：总数 ÷ 份数 = 每份几个',
    howTo: '给出物品总数和要平均分成几份，求每份几个。答对 5 题过关。',
    chapters: ['c2'],
  },
  {
    slug: 'place-value',
    name: '三位数拼一拼',
    icon: '🧱',
    summary: '几个百、几个十、几个一组成三位数',
    howTo: '给出百位、十位、个位上的数，把它们组成三位数。输入答案，答对 5 题过关。',
    chapters: ['c6'],
  },
  {
    slug: 'compare-quiz',
    name: '三位数比大小',
    icon: '⚖️',
    summary: '比较三位数的大小',
    howTo: '给出两个三位数，判断大于、小于还是等于。答对 5 题过关。',
    chapters: ['c6'],
  },
  {
    slug: 'abacus',
    name: '算盘读数',
    icon: '🔢',
    summary: '看懂算盘上表示的数',
    howTo: '展示算盘拨珠，读出它表示的数。记住上珠 1 颗表示 5。答对 5 题过关。',
    chapters: ['c6'],
  },
  {
    slug: 'twodigit-calc',
    name: '两位数加减',
    icon: '➕',
    summary: '两位数加、减两位数的口算',
    howTo: '随机出两位数加或减两位数的题目（注意进位和退位）。输入答案，答对 5 题过关。',
    chapters: ['c7'],
  },
  {
    slug: 'money-change',
    name: '欢乐购物',
    icon: '🛒',
    summary: '付钱与找零计算',
    howTo: '给出商品价格和付的钱，求应找回多少钱（人民币元作单位）。答对 5 题过关。',
    chapters: ['c8'],
  },
  {
    slug: 'remainder-quiz',
    name: '有余数除法',
    icon: '🍯',
    summary: '有余数的除法：商和余数',
    howTo: '随机出有余数的除法题（如 10÷3）。输入商和余数（中间用空格或英文逗号隔开），答对 5 题过关。',
    chapters: ['c9'],
  },
  {
    slug: 'direction-quiz',
    name: '辨认方向',
    icon: '🧭',
    summary: '东、南、西、北与前后左右',
    howTo: '给出面对的方向，判断后面、左边或右边是什么方向。答对 5 题过关。',
    chapters: ['c5'],
  },
  {
    slug: 'tangram-quiz',
    name: '七巧板拼图',
    icon: '🧩',
    summary: '哪几块板可以拼成这个图形',
    howTo: '给出目标图形，从七巧板的板块中选出能拼成它的组合。答对 5 题过关。',
    chapters: ['c3'],
  },
]

export function unitNoOf(chapter: ChapterId): number {
  return chapters.find((c) => c.id === chapter)!.no
}
