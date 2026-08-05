/**
 * 六年级 Lab 数据 Schema（苏教版六年级上册 · 2022 课标修订）
 *
 * 设计原则（与五年级 g5/data 一致）：
 * - 一个"Lab" = 一个可调参数的可视化例题（例题/试一试/练一练等）
 * - 数据只声明：所属单元、书页、题源、参数定义、公式展示
 * - 计算与渲染逻辑在 g6/game/src/lib/labs/ 与 components/labs/ 中
 */

export type ChapterId =
  | 'c1' // 小数乘法和除法（二）
  | 'c2' // 混合运算与数量关系（三）
  | 'c3' // 数与运算的再认识
  | 'c4' // 比和比例
  | 'c5' // 圆
  | 'c6' // 放大与缩小
  | 'c7' // 确定位置

export interface ChapterMeta {
  id: ChapterId
  /** 单元序号 */
  no: number
  title: string
  /** 课本目录序号（一~七） */
  tocLabel: string
  /** 书页码起止 */
  pageStart: number
  pageEnd: number
  /** 展示用 emoji */
  icon: string
  /** 一句话简介 */
  summary: string
}

/** 题源小节 */
export type SourceKind = '例题' | '试一试' | '练一练' | '练习' | '探索' | '综合实践'

/** 可调参数定义（滑块） */
export interface LabParam {
  /** 参数名（公式里的字母，如 a / b） */
  key: string
  label: string
  min: number
  max: number
  step: number
  default: number
  /** 单位（元/米/千米/格/°…） */
  unit?: string
}

/** 可视化 Lab 类型 */
export type LabKind =
  // 一 小数乘法和除法（二）
  | 'mul-decimal' // 一个数乘小数（方格模型）
  | 'mul-compare' // 积与因数的大小关系
  | 'mul-approx' // 积的近似值
  | 'div-decimal' // 一个数除以小数（转化整数除法）
  | 'div-approx' // 商的近似值
  | 'round-life' // 进一法与去尾法
  // 二 混合运算与数量关系（三）
  | 'frac-mix' // 分数四则混合运算
  | 'estimate-shop' // 估算购物（估大/估小）
  | 'segment' // 求一个数的几分之几（线段图）
  | 'segment-more' // 比一个数多/少几分之几
  | 'work-together' // 工程问题（合作）
  | 'piecewise' // 分段计费（综合与实践）
  // 三 数与运算的再认识
  | 'place-value' // 数位与计数单位
  | 'compare-unit' // 数的大小比较（计数单位一致）
  | 'op-consistency' // 运算意义的一致性（计数单位）
  | 'binary' // 二进制的秘密
  // 四 比和比例
  | 'ratio-intro' // 比的认识
  | 'ratio-value' // 比值与形状
  | 'ratio-simplify' // 化简比
  | 'ratio-distribute' // 按比例分配
  | 'proportion-basic' // 比例的基本性质
  | 'solve-proportion' // 解比例
  | 'golden-ratio' // 神奇的黄金比
  // 五 圆
  | 'circle-feature' // 认识圆（圆心/半径/直径）
  | 'sector' // 扇形与圆心角
  | 'circumference' // 圆的周长
  | 'circle-area' // 圆的面积（剪拼）
  | 'annulus' // 环形面积
  | 'circle-composite' // 组合图形的面积
  // 六 放大与缩小
  | 'scale-shape' // 图形的放大与缩小
  | 'map-scale' // 比例尺
  // 七 确定位置
  | 'coordinate' // 数对
  | 'direction' // 方向与距离

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
