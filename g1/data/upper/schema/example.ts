/**
 * 例题数据 Schema（统一类型定义）
 *
 * 设计原则：
 * - 一个"例题" = 一道可交互的题（一个 GameQuestion）
 * - 题型由 type 区分，载荷由对应 config 表达
 * - 所有判定逻辑在 game/lib/engine/ 中，数据只声明题目内容
 */

export type ChapterId =
  | 'c1'
  | 'c2'
  | 'c3'
  | 'c4'
  | 'c5'
  | 'c6'
  | 'c7'
  | 'c8'
  | 'c9'

export interface ChapterMeta {
  id: ChapterId
  /** 单元序号 */
  no: number
  title: string
  /** 课本目录中的序号（一/二/三/四/五；游戏与活动类单元无序号为空） */
  tocLabel?: string
  /** 书页码起止 */
  pageStart: number
  pageEnd: number
  /** 展示用 emoji */
  icon: string
  /** 一句话简介 */
  summary: string
}

export type GameType =
  | 'count' // 数一数：物品数量 → 选数字
  | 'write' // 拨一拨/写数：认识数字（含计数器）
  | 'split' // 分与合
  | 'addsub' // 加减法（实物合并/去掉）
  | 'compare' // 比多少/比大小（> < =）
  | 'position' // 方位：上/下/左/右/前/后
  | 'ordinal' // 序数：第几个
  | 'shape3d' // 立体图形辨认
  | 'numberline' // 数轴/数的组成（11~19）
  | 'sequence' // 顺数/倒数
  | 'ten' // 抢10卡片

export interface BaseQuestion {
  id: string
  chapter: ChapterId
  /** 书页码 */
  page: number
  /** 题源小节：例题（主情景）/ 试一试 / 想想做做 / 练习（含练习X与练习与应用）/ 活动（游戏·复习活动） */
  source: SourceKind
  title: string
  /** 题干文字 */
  prompt: string
}

/** 题源小节类型（对应课本小标题） */
export type SourceKind = '例题' | '试一试' | '想想做做' | '练习' | '活动'

/** 可选视觉配置（见 docs/example-visual-upgrade-spec.md §3.1） */
export interface VisualSpec {
  /** 同一 kind 下的具体视觉分支，如 compare: pairing；count: two-hands */
  variant?: string
  /** 课本情境关键词，如 balls、hands、bricks、paper、stars，不写展示文案 */
  scene?: string
  /** 截图/计数中使用的量词，如 根、个、箱 */
  unitLabel?: string
}

export interface CountConfig {
  /** 物品 emoji 串，长度即数量 */
  emoji: string
  /** 数量 = emoji.length */
  answer: number
  /** 候选选项 */
  options: number[]
  /** 可选视觉配置 */
  visual?: VisualSpec
}

export interface WriteConfig {
  /** 要认识的数 0~19 */
  number: number
  /** 提示语（如 1个十和3个一） */
  hint: string
  /** 选项：数字写法 */
  options: number[]
  answer: number
}

export interface SplitConfig {
  /** 总数（2~19） */
  total: number
  /** 已知一部分 */
  given: number
  /** 另一部分 = total - given */
  answer: number
  /** 是否可拖拽（视觉模式） */
  draggable?: boolean
}

export interface AddSubConfig {
  a: number
  b: number
  op: '+' | '-'
  /** 加法: a+b；减法: a-b（非负） */
  answer: number
  /** 实物 emoji，用于可视化合并/去掉 */
  emoji: string
  options: number[]
}

export interface CompareConfig {
  a: number
  b: number
  answer: '>' | '<' | '='
  /** 默认显示对象（比多少用） */
  emoji?: string
  /** 上排对象；缺省时使用 emoji */
  leftEmoji?: string
  /** 下排对象；缺省时使用 emoji */
  rightEmoji?: string
  /** 上排标签，如 绿花、苹果 */
  leftLabel?: string
  /** 下排标签，如 红花、橘子 */
  rightLabel?: string
}

export interface PositionConfig {
  /** 方位场景物品，位置索引固定 */
  items: string[]
  /** 要判断的物品（必须存在于 items） */
  target: string
  /** 判定的方位词 */
  position: '上' | '下' | '左' | '右' | '前' | '后'
  answer: string
}

export interface OrdinalConfig {
  items: string[]
  /** 目标物品（存在性由 validate 检查） */
  target: string
  answer: number
}

export interface Shape3DConfig {
  shape: '长方体' | '正方体' | '圆柱' | '球'
  options: string[]
  answer: string
}

export interface NumberLineConfig {
  value: number
  answer: number
  options: number[]
}

export interface SequenceConfig {
  from: number
  to: number
  answer: number[]
}

export interface TenConfig {
  /** 目标数，默认10 */
  target: number
  cards: number[]
  /** 选出的卡片值（数量 2 或 3 张） */
  answer: number[]
}

export type GameConfig =
  | ({ type: 'count' } & CountConfig)
  | ({ type: 'write' } & WriteConfig)
  | ({ type: 'split' } & SplitConfig)
  | ({ type: 'addsub' } & AddSubConfig)
  | ({ type: 'compare' } & CompareConfig)
  | ({ type: 'position' } & PositionConfig)
  | ({ type: 'ordinal' } & OrdinalConfig)
  | ({ type: 'shape3d' } & Shape3DConfig)
  | ({ type: 'numberline' } & NumberLineConfig)
  | ({ type: 'sequence' } & SequenceConfig)
  | ({ type: 'ten' } & TenConfig)

export interface GameQuestion extends BaseQuestion {
  type: GameType
  config: GameConfig
}
