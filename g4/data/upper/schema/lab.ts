/**
 * 四年级 Lab 数据 Schema（苏教版四年级上册 · 2022 课标修订）
 *
 * 设计原则：
 * - 一个"Lab" = 一个可调参数的可视化例题（例题/试一试/练一练/练习等）
 * - 数据只声明：所属单元、书页、题源、参数定义、公式展示
 * - 计算与渲染逻辑在 g4/game/src/lib/labs/ 与 components/labs/ 中
 */

export type ChapterId =
  | 'c1' // 两、三位数除以两位数
  | 'c2' // 周长与面积
  | 'c3' // 周长与面积的变化
  | 'c4' // 乘法数量关系
  | 'c5' // 混合运算与数量关系（二）
  | 'c6' // 制订旅游计划
  | 'c7' // 多位数的认识
  | 'c8' // 度量衡的故事
  | 'c9' // 大数的运算

export interface ChapterMeta {
  id: ChapterId
  /** 单元序号 */
  no: number
  title: string
  /** 课本目录序号（一~六，综合实践/探索无） */
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
export type SourceKind = '例题' | '试一试' | '想想做做' | '练一练' | '练习' | '探索' | '综合实践'

/** 可调参数定义（滑块或离散选项） */
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
  /** 离散选项标签，用于替代 0/1 这类不适合滑块的参数 */
  choices?: { value: number; label: string }[]
}

/** 可视化 Lab 类型 */
export type LabKind =
  // 一 两、三位数除以两位数
  | 'div-oral' // 整十数除以整十数（口算）
  | 'div-try' // 用竖式试商（把除数看作整十数）
  | 'div-pen' // 两、三位数除以两位数（竖式）
  | 'div-route' // 连续平均分（两步计算）
  // 二 周长与面积
  | 'peri-rect' // 长方形的周长 C=(a+b)×2
  | 'peri-square' // 正方形的周长 C=a×4
  | 'area-grid' // 用面积单位量面积
  | 'area-rect' // 长方形的面积 S=a×b
  | 'area-square' // 正方形的面积 S=a×a
  | 'area-unit' // 面积单位换算（平方分米/平方厘米/平方米）
  // 三 周长与面积的变化
  | 'peri-area-change' // 周长与面积的变化（拼一拼/画一画）
  // 四 乘法数量关系
  | 'mul-meaning' // 乘法的意义（求几个相同加数的和）
  | 'mul-total' // 总价 = 单价 × 数量
  | 'mul-distance' // 路程 = 速度 × 时间
  | 'mul-solve' // 用乘法数量关系解决问题
  // 六 制订旅游计划
  | 'travel-plan' // 旅游费用估算
  // 五 混合运算与数量关系（二）
  | 'mix-three' // 三步混合运算（先乘除后加减）
  | 'mix-bracket' // 含小括号/中括号的混合运算
  | 'mix-segment' // 线段图分析三步数量关系
  // 七 多位数的认识
  | 'num-count' // 认识计数单位（个/十/百/千/万…）
  | 'num-place' // 数位顺序表（十进制计数法）
  | 'num-multidigit' // 认识多位数（万级/亿级）
  | 'num-approx' // 用"四舍五入"求近似数
  | 'num-idcode' // 数字编码（身份证号码）
  // 八 度量衡的故事
  | 'measure-story' // 度量衡：古今计量单位的换算
  // 九 大数的运算
  | 'big-mul' // 三位数乘两位数（竖式）
  | 'big-calc' // 用计算器探索规律
  | 'big-1yi' // 1亿有多大（推算）

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
