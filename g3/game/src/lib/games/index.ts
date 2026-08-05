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
    slug: 'mix-quiz',
    name: '混合运算快算',
    icon: '➕',
    summary: '乘加乘减、除加除减，含小括号的运算顺序挑战',
    howTo: '系统随机出一道混合运算题（可能带小括号）。在选项中选出正确答案，连对 5 题过关。',
    chapters: ['c1'],
  },
  {
    slug: 'time24-quiz',
    name: '24 时记时法',
    icon: '🕐',
    summary: '普通记时法与 24 时记时法互转',
    howTo: '给出一个时刻，把它转换成 24 时记时法或普通记时法（上午/下午/晚上）。答对 5 题过关。',
    chapters: ['c2'],
  },
  {
    slug: 'elapsed-quiz',
    name: '经过时间',
    icon: '⏱️',
    summary: '计算开始到结束经过了多长时间',
    howTo: '给出开始时刻和结束时刻，计算中间经过了几小时（或几小时几分）。答对 5 题过关。',
    chapters: ['c2'],
  },
  {
    slug: 'mul-oral-game',
    name: '乘法口算冲刺',
    icon: '🏃',
    summary: '整十、整百数乘一位数的口算',
    howTo: '随机出整十整百数乘一位数的口算题（如 20×4、300×6）。从选项中选择答案，答对 5 题过关。',
    chapters: ['c3'],
  },
  {
    slug: 'mul-pen-quiz',
    name: '竖式乘法填空',
    icon: '✍️',
    summary: '两、三位数乘一位数的笔算',
    howTo: '给出竖式乘法题（两三位数×一位数），输入正确的结果。答对 5 题过关。',
    chapters: ['c3'],
  },
  {
    slug: 'weight-quiz',
    name: '质量单位换算',
    icon: '⚖️',
    summary: '千克、克、吨之间的换算',
    howTo: '给出一个质量和单位，把它换算成克或千克。从选项中选择，答对 5 题过关。',
    chapters: ['c4'],
  },
  {
    slug: 'tally-quiz',
    name: '统计正字挑战',
    icon: '正',
    summary: '画"正"字记录与统计表合计',
    howTo: '给出几个类别的"正"字记录，求出合计人数或某类别人数。答对 5 题过关。',
    chapters: ['c5'],
  },
  {
    slug: 'length-quiz',
    name: '长度单位换算',
    icon: '📏',
    summary: '毫米、厘米、分米、米、千米的换算',
    howTo: '给出一个长度和单位，把它换算成目标单位。从选项中选择，答对 5 题过关。',
    chapters: ['c6'],
  },
  {
    slug: 'motion-quiz',
    name: '平移旋转辨识',
    icon: '🎯',
    summary: '判断图形的运动是平移还是旋转',
    howTo: '给出生活现象或图形运动描述，判断是平移还是旋转。答对 5 题过关。',
    chapters: ['c7'],
  },
  {
    slug: 'axis-quiz',
    name: '轴对称判断',
    icon: '🦋',
    summary: '判断图形是否是轴对称图形',
    howTo: '给出一个图形（如字母、数字、汉字或生活图形），判断它是否是轴对称图形。答对 5 题过关。',
    chapters: ['c7'],
  },
  {
    slug: 'div-oral-game',
    name: '除法口算冲刺',
    icon: '🏁',
    summary: '整十、整百数除以一位数的口算',
    howTo: '随机出整十整百数除以一位数的口算题（如 60÷3、400÷5）。从选项中选择，答对 5 题过关。',
    chapters: ['c8'],
  },
  {
    slug: 'div-pen-quiz',
    name: '竖式除法填空',
    icon: '➗',
    summary: '两、三位数除以一位数的笔算',
    howTo: '给出除法竖式题（两三位数÷一位数，可能有余数），选择正确结果。答对 5 题过关。',
    chapters: ['c8'],
  },
  {
    slug: 'interval-quiz',
    name: '间隔排列推理',
    icon: '🔗',
    summary: '两端相同/不同时两种物体的个数关系',
    howTo: '根据间隔排列的条件（两端相同或不同，或围成一圈），判断两种物体的个数。答对 5 题过关。',
    chapters: ['c9'],
  },
  {
    slug: 'segment-quiz',
    name: '数量关系挑战',
    icon: '🧮',
    summary: '两步计算的实际问题（线段图）',
    howTo: '给出一个两步计算的应用题，从选项中选出正确答案。答对 5 题过关。',
    chapters: ['c10'],
  },
  {
    slug: 'views-quiz',
    name: '三视图配对',
    icon: '🧊',
    summary: '判断从前面/右面/上面看到的图形',
    howTo: '给出一堆积木的俯视图描述，判断从某个方向看到的小正方形个数。答对 5 题过关。',
    chapters: ['c11'],
  },
  {
    slug: 'times-quiz',
    name: '倍的挑战',
    icon: '💪',
    summary: '倍的认识：求几倍是多少、求几倍关系',
    howTo: '随机出求一个数的几倍、或求一个数是另一个数的几倍的问题。从选项中选择，答对 5 题过关。',
    chapters: ['c12'],
  },
]

export function unitNoOf(chapter: ChapterId): number {
  return chapters.find((c) => c.id === chapter)!.no
}
