/**
 * 五年级 Lab 数据 Schema（苏教版五年级上册 · 2022 课标修订）
 *
 * 设计原则：
 * - 一个"Lab" = 一个可调参数的可视化例题（例题/试一试/练一练等）
 * - 数据只声明：所属单元、书页、题源、参数定义、公式展示
 * - 计算与渲染逻辑在 g5/game/src/lib/labs/ 与 components/labs/ 中
 */

export type ChapterId =
  | 'c1' // 图形的运动
  | 'c2' // 统计表和条形统计图（二）
  | 'c3' // 多边形的面积
  | 'c4' // 小数乘法和除法（一）
  | 'c5' // 可能性
  | 'c6' // 因数与倍数
  | 'c7' // 用字母表示数量关系（一）
  | 'c8' // 观察物体（三）

export interface ChapterMeta {
  id: ChapterId
  /** 单元序号 */
  no: number
  title: string
  /** 课本目录序号（一~八） */
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
  /** 参数名（公式里的字母，如 a / h） */
  key: string
  label: string
  min: number
  max: number
  step: number
  default: number
  /** 单位（米/厘米/千米/格/°…） */
  unit?: string
  /**
   * 离散选项：参数本质是「选一个」而不是「拖一个量」时给出按钮组。
   * 有 options 时页面渲染按钮（不再显示滑块与 unit 里那串「0右 1下 2左 3上」），
   * 学生看到的是「向右 / 向下 / 向左 / 向上」而不是数字。
   */
  options?: { label: string; value: number }[]
}

/** 可视化 Lab 类型 */
export type LabKind =
  // 一 图形的运动
  | 'translate' // 图形的平移（方向 + 格数）
  | 'rotate' // 图形的旋转（角度 + 方向）
  | 'axis' // 轴对称
  // 二 统计表和条形统计图（二）
  | 'stats-table' // 复式统计表（chart.js 分组条形图）
  | 'stats-chart' // 复式条形统计图（chart.js）
  // 三 多边形的面积
  | 'area' // 平行四边形 / 三角形 / 梯形（shape 参数区分）
  | 'hectare' // 公顷与平方千米
  | 'composite' // 组合图形的面积
  // 四 小数乘法和除法（一）
  | 'decimal-mul' // 小数乘整数
  | 'decimal-div' // 小数除以整数
  | 'decimal-point' // 小数点移动引起大小变化
  // 五 可能性
  | 'spinner' // 转盘可能性
  | 'marble' // 摸球实验
  // 六 因数与倍数
  | 'factors' // 因数可视化
  | 'multiples' // 倍数数轴
  | 'prime' // 质数与合数（筛法）
  | 'gcdlcm' // 公因数与公倍数
  // 七 用字母表示数量关系（一）
  | 'frog' // 青蛙歌
  | 'square' // 正方形的周长与面积
  | 'speed' // 路程 = 速度 × 时间
  // 探索规律
  | 'pinboard' // 钉子板上的多边形（皮克定理）
  // 八 观察物体（三）
  | 'views3d' // three.js 三视图

/**
 * 可视化量纲声明。
 * - `length`：图形上长度量的真实单位（米 / 分米 / 厘米 / 千米…），用于结果文案与尺寸标注。
 * - `cellSize`：方格模型中「每格代表的真实长度」。有值时结果同时给出「格数」与真实面积，
 *   避免把 6 格 × 4 格 直接说成 24 平方米这类单位误导（课本原题是 60 米 × 40 米 = 2400 平方米）。
 */
export interface LabUnits {
  length: string
  cellSize?: number
}

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
  /** 隐藏常量（不显示为滑块，但参与计算），如小数点移动的基数/方向、面积图形形状代码 */
  fixed?: Record<string, number>
  /** 展示用公式模板（组件实时代入数值） */
  formula: string
  /** 教学提示 */
  tip?: string
  /** 量纲声明（真实单位 / 每格代表的长度） */
  units?: LabUnits
}

/** 参数表类型：key → 当前值 */
export type ParamValues = Record<string, number>
