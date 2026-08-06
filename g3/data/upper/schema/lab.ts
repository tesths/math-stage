/**
 * 三年级 Lab 数据 Schema（苏教版三年级上册 · 2022 课标修订）
 *
 * 设计原则（与二/五/六年级 g2/g5/g6 一致）：
 * - 一个"Lab" = 一个可调参数的可视化例题（例题/试一试/想想做做/练习等）
 * - 数据只声明：所属单元、书页、题源、参数定义、公式展示
 * - 计算与渲染逻辑在 g3/game/src/lib/labs/ 与 components/labs/ 中
 */

export type ChapterId =
  | 'c1' // 一 混合运算与数量关系（一）
  | 'c2' // 一天的时间（综合与实践）
  | 'c3' // 二 两、三位数乘一位数
  | 'c4' // 曹冲称象的故事（综合与实践：千克/克/吨）
  | 'c5' // 三 数据的收集与整理 / 了解你的好朋友（综合与实践）
  | 'c6' // 四 毫米、分米和千米
  | 'c7' // 五 平移、旋转和轴对称
  | 'c8' // 六 两、三位数除以一位数
  | 'c9' // 间隔排列（探索规律）
  | 'c10' // 七 数量关系的分析（一）
  | 'c11' // 八 观察物体（二）
  | 'c12' // 附录 倍的认识

export interface ChapterMeta {
  id: ChapterId
  /** 单元序号 */
  no: number
  title: string
  /** 课本目录序号（一~八/附录）；综合与实践/探索规律无序号 */
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
export type SourceKind = '例题' | '试一试' | '想想做做' | '练习' | '复习' | '探索' | '综合实践'

/** 可调参数定义（滑块） */
export interface LabParam {
  /** 参数名（公式里的字母，如 a / b / n） */
  key: string
  label: string
  min: number
  max: number
  step: number
  default: number
  /** 单位（元/米/千克/格/°…） */
  unit?: string
}

/** 可视化 Lab 类型 */
export type LabKind =
  // 一 混合运算与数量关系（一）
  | 'mix-calc' // 乘加/除加混合运算（先乘除后加减）
  | 'bracket' // 小括号的作用（运算顺序对比）
  // 一天的时间
  | 'time24' // 24 时记时法与普通记时法互转
  | 'elapsed' // 经过时间的计算
  // 二 两、三位数乘一位数
  | 'mul-oral' // 口算乘法（整十、整百数乘一位数）
  | 'mul-pen' // 笔算乘法（竖式逐步）
  | 'mul-zero' // 中间或末尾有 0 的乘法
  // 曹冲称象的故事
  | 'weight' // 质量单位：克、千克、吨
  | 'equivalent' // 等量代换（曹冲称象）
  // 三 数据的收集与整理
  | 'tally' // 画"正"字记录与统计
  | 'stat' // 统计表与统计图
  // 四 毫米、分米和千米
  | 'length-convert' // 长度单位换算（毫米/厘米/分米/米/千米）
  // 五 平移、旋转和轴对称
  | 'translate' // 图形的平移
  | 'rotate' // 图形的旋转
  | 'axis' // 轴对称图形
  // 六 两、三位数除以一位数
  | 'div-oral' // 口算除法（整十、整百数除以一位数）
  | 'div-pen' // 笔算除法（竖式逐步）
  | 'div-zero' // 商中间有 0 的除法
  | 'remainder' // 有余数的除法
  // 间隔排列
  | 'interval' // 间隔排列的规律
  // 七 数量关系的分析（一）
  | 'segment' // 线段图分析数量关系
  // 八 观察物体（二）
  | 'views' // 正方体三视图（前面/右面/上面）
  | 'views3d' // three.js 三视图（可拖拽）
  // 附录 倍的认识
  | 'times' // 倍的含义
  | 'times-mul' // 求一个数的几倍是多少（乘法）
  | 'times-div' // 求一个数是另一个数的几倍（除法）

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
