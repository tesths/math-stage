/**
 * 二年级 Lab 数据 Schema（苏教版二年级上册 · 2022 课标修订，2025 新编）
 *
 * 设计原则（与五年级 g5 / 六年级 g6 一致）：
 * - 一个"Lab" = 一个可调参数的可视化例题（例题/试一试/想想做做/练习等）
 * - 数据只声明：所属单元、书页、题源、参数定义、公式展示
 * - 计算与渲染逻辑在 g2/game/src/lib/labs/ 与 components/labs/ 中
 */

export type ChapterId =
  | 'c1' // 一 1~6的表内乘法
  | 'c2' // 二 1~6的表内除法
  | 'c3' // 奇妙的七巧板（综合与实践）
  | 'c4' // 三 7~9的表内乘除法
  | 'c5' // 生活中的方向（综合与实践）
  | 'c6' // 四 认识三位数
  | 'c7' // 五 两位数加、减两位数
  | 'c8' // 欢乐购物街（综合与实践：认识人民币）
  | 'c9' // 六 有余数的除法
  | 'c10' // 期末复习

export interface ChapterMeta {
  id: ChapterId
  /** 单元序号 */
  no: number
  title: string
  /** 课本目录序号（一~六）；综合与实践/复习单元无序号为空 */
  tocLabel?: string
  /** 书页码起止（书页 = PDF页 - 8） */
  pageStart: number
  pageEnd: number
  /** 展示用 emoji */
  icon: string
  /** 一句话简介 */
  summary: string
}

/** 题源小节 */
export type SourceKind = '例题' | '试一试' | '想想做做' | '练习' | '复习' | '综合实践'

/** 可调参数定义（滑块） */
export interface LabParam {
  /** 参数名（公式里的字母，如 a / b / n） */
  key: string
  label: string
  min: number
  max: number
  step: number
  default: number
  /** 单位（个/份/元/角/°…） */
  unit?: string
}

/** 可视化 Lab 类型 */
export type LabKind =
  // 一 1~6的表内乘法
  | 'groups' // 认识乘法：几个几相加 → 乘法
  | 'mult-table' // 乘法口诀（5/6 或 7/8/9，口诀自动生成）
  // 二 1~6的表内除法
  | 'divide-share' // 平均分：总数 ÷ 份数 = 每份
  | 'divide-group' // 每几个一份：总数 ÷ 每份 = 份数
  | 'quotient' // 用乘法口诀求商
  // 三 7~9的表内乘除法
  | 'table-calc' // 表内乘除混合计算（复习）
  // 奇妙的七巧板
  | 'tangram' // 七巧板拼图
  // 生活中的方向
  | 'direction' // 辨认东、南、西、北
  // 四 认识三位数
  | 'place-value' // 三位数的组成（计数器）
  | 'compare' // 三位数比大小
  | 'abacus' // 算盘拨珠
  // 五 两位数加、减两位数
  | 'twodigit-add' // 两位数加法（进位）
  | 'twodigit-sub' // 两位数减法（退位）
  // 欢乐购物街
  | 'money' // 认识人民币与换算
  | 'money-calc' // 购物付钱与找零
  // 六 有余数的除法
  | 'remainder' // 分物有余数
  | 'remainder-rule' // 余数比除数小

export interface LabDef {
  id: string
  chapter: ChapterId
  /** 书页码 */
  page: number
  source: SourceKind
  title: string
  /** 题干文字 */
  prompt: string
  kind: LabKind
  /** 可调参数 */
  params: LabParam[]
  /** 隐藏常量（不显示为滑块，但参与计算） */
  fixed?: Record<string, number>
  /** 展示用公式模板（组件实时代入数值） */
  formula: string
  /** 教学提示 */
  tip?: string
}

/** 参数表类型：key → 当前值 */
export type ParamValues = Record<string, number>
