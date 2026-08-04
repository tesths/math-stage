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
    slug: 'area-race',
    name: '面积速算',
    icon: '📐',
    summary: '平行四边形、三角形、梯形随机出题，看谁算得快',
    howTo: '系统随机出一道求面积的题（给出底、高等数据）。在三个选项中选出正确答案，连对 5 题过关。',
    chapters: ['c3'],
  },
  {
    slug: 'decimal-quiz',
    name: '小数乘除口算',
    icon: '🧮',
    summary: '小数乘整数、除以整数的口算挑战',
    howTo: '随机出小数乘除口算题（如 0.6×3、9.6÷3）。输入答案，答对 5 题过关。',
    chapters: ['c4'],
  },
  {
    slug: 'decimal-point',
    name: '小数点搬家',
    icon: '➡️',
    summary: '小数乘 10、100、1000，小数点向右移',
    howTo: '给出一个小数和一个倍数（×10/×100/×1000），选择小数点移动后的结果。答对 5 题过关。',
    chapters: ['c4'],
  },
  {
    slug: 'factor-hunt',
    name: '因数大冒险',
    icon: '🔍',
    summary: '找出一个数的所有因数',
    howTo: '给出一个数，从候选数字中选出它的所有因数（可以多选）。全部选对过关。',
    chapters: ['c6'],
  },
  {
    slug: 'prime-dash',
    name: '质数快抢',
    icon: '💎',
    summary: '判断一个数是质数还是合数',
    howTo: '屏幕上出现一个数，快速判断它是质数还是合数。限时 45 秒，答对越多得分越高。',
    chapters: ['c6'],
  },
  {
    slug: 'gcdlcm-quiz',
    name: '公因数公倍数',
    icon: '🤝',
    summary: '求两个数的最大公因数或最小公倍数',
    howTo: '给出两个数，题目问最大公因数或最小公倍数，从选项中选择答案。答对 5 题过关。',
    chapters: ['c6'],
  },
  {
    slug: 'move-quiz',
    name: '平移旋转辨识',
    icon: '🎯',
    summary: '看图判断图形是怎样运动的',
    howTo: '观察两个图形，判断从图①到图②是平移还是旋转，以及方向/格数/角度。答对 5 题过关。',
    chapters: ['c1'],
  },
  {
    slug: 'coin-flip',
    name: '抛硬币统计',
    icon: '🪙',
    summary: '抛硬币 100 次，统计正反面出现的次数',
    howTo: '点击抛硬币（可单次或连抛 10 次），累计 100 次后看统计结果：正反面次数接近总数的一半。',
    chapters: ['c5'],
  },
  {
    slug: 'unit-convert',
    name: '面积单位换算',
    icon: '📏',
    summary: '平方米、公顷、平方千米的换算',
    howTo: '给出一个面积数和单位，把它换算成目标单位（平方米/公顷/平方千米）。答对 5 题过关。',
    chapters: ['c3'],
  },
  {
    slug: 'views-quiz',
    name: '三视图配对',
    icon: '🧊',
    summary: '看三维积木，选出从前面/右面/上面看到的图形',
    howTo: '三维积木模型，题目问从某个方向看是什么图形，从四个候选中选择正确的投影图。答对 5 题过关。',
    chapters: ['c8'],
  },
]

export function unitNoOf(chapter: ChapterId): number {
  return chapters.find((c) => c.id === chapter)!.no
}
