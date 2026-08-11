/**
 * 年级注册表：全平台唯一的年级元数据源。
 * 新增年级只需在此加一条记录（门户卡片 / 顶栏切换 / 页脚文案自动生效）。
 * 注意：跨应用导航必须用原生 <a href>（部署路径），不能用 NuxtLink/UButton。
 */
export type GradeId = 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6'
export type GradeAccent = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

export interface GradeFeature {
  icon: string
  text: string
}

export interface GradeInfo {
  /** 部署路径段，如 'g1' */
  id: GradeId
  /** 年级序号 1~6 */
  no: number
  /** 部署子路径，如 '/g1/' */
  base: string
  /** 显示名，如 '一年级' */
  label: string
  /** 应用标题（顶栏 / HTML title） */
  title: string
  /** 课标版本标签，如 '人教版 · 2022 版课标' */
  standard: string
  /** 课本全名 */
  book: string
  /** 门户卡片副标题 */
  tagline: string
  /** 门户卡片 emoji */
  icon: string
  /** 门户卡片徽章 / 按钮语义色；primary 由 Nuxt UI 全局主题映射为 emerald */
  accent: GradeAccent
  /** 门户卡片简介 */
  description: string
  /** 门户卡片特性列表 */
  features: GradeFeature[]
  /** 门户卡片按钮文案 */
  cta: string
  /** 应用页脚文案 */
  footer: string
}

const G1: GradeInfo = {
  id: 'g1',
  no: 1,
  base: '/g1/',
  label: '一年级',
  title: '一年级数学例题游戏',
  standard: '苏教版 · 2022 版课标',
  book: '《义务教育教科书·数学》苏教版一年级上册',
  tagline: '数感启蒙 · 例题答题游戏',
  icon: '🧮',
  accent: 'warning',
  description: '苏教版一年级上册 · 78 道例题答题游戏 + 20 个课本主题小游戏',
  features: [
    { icon: '🔢', text: '9 个单元 · 78 道例题小游戏' },
    { icon: '🎮', text: '20 个课本主题游戏（抢10 / 数独 / 火柴棒…）' },
    { icon: '🧸', text: '数一数 / 加减法 / 图形 / 位置' },
  ],
  cta: '进入一年级',
  footer: '《义务教育教科书·数学》苏教版一年级上册 配套互动演示',
}

const G2: GradeInfo = {
  id: 'g2',
  no: 2,
  base: '/g2/',
  label: '二年级',
  title: '二年级数学例题可视化',
  standard: '苏教版 · 2022 版课标',
  book: '《义务教育教科书·数学》苏教版二年级上册',
  tagline: '例题可视化 · 参数实验室',
  icon: '🍎',
  accent: 'primary',
  description: '苏教版二年级上册 · 22 个可调参数例题 Lab + 12 个训练小游戏',
  features: [
    { icon: '✖️', text: '10 个单元 · 22 个可调参数 Lab' },
    { icon: '🧩', text: '七巧板 / 算盘 / 计数器 / 方向板 / 人民币' },
    { icon: '🎯', text: '12 个训练游戏（九九乘法 / 找零 / 辨认方向…）' },
  ],
  cta: '进入二年级',
  footer: '《义务教育教科书·数学》苏教版二年级上册 配套互动演示 · 例题可视化可拖动参数实时计算',
}

const G3: GradeInfo = {
  id: 'g3',
  no: 3,
  base: '/g3/',
  label: '三年级',
  title: '三年级数学例题可视化',
  standard: '苏教版 · 2022 版课标',
  book: '《义务教育教科书·数学》苏教版三年级上册',
  tagline: '例题可视化 · 参数实验室',
  icon: '🐸',
  accent: 'primary',
  description: '苏教版三年级上册 · 41 个可调参数例题 Lab + 16 个训练小游戏',
  features: [
    { icon: '🧮', text: '12 个单元 · 41 个可调参数 Lab' },
    { icon: '🧊', text: 'three.js 三视图 · 竖式动画 · 线段图 · 钟面 / 尺子' },
    { icon: '🎯', text: '16 个训练游戏（混合运算 / 口算 / 倍的认识 / 间隔排列…）' },
  ],
  cta: '进入三年级',
  footer: '《义务教育教科书·数学》苏教版三年级上册 配套互动演示 · 例题可视化可拖动参数实时计算',
}

const G4: GradeInfo = {
  id: 'g4',
  no: 4,
  base: '/g4/',
  label: '四年级',
  title: '四年级数学例题可视化',
  standard: '苏教版 · 2022 版课标',
  book: '《义务教育教科书·数学》苏教版四年级上册',
  tagline: '例题可视化 · 参数实验室',
  icon: '📏',
  accent: 'primary',
  description: '苏教版四年级上册 · 28 个可调参数例题 Lab + 10 个训练小游戏',
  features: [
    { icon: '📏', text: '9 个单元 · 28 个可调参数 Lab' },
    { icon: '🔢', text: '除法竖式 / 周长面积 / 多位数 / 大数运算' },
    { icon: '🎯', text: '10 个训练游戏（试商 / 周长 / 面积 / 四舍五入…）' },
  ],
  cta: '进入四年级',
  footer: '《义务教育教科书·数学》苏教版四年级上册 配套互动演示 · 例题可视化可拖动参数实时计算',
}

const G5: GradeInfo = {
  id: 'g5',
  no: 5,
  base: '/g5/',
  label: '五年级',
  title: '五年级数学例题可视化',
  standard: '苏教版 · 2022 版课标',
  book: '《义务教育教科书·数学》苏教版五年级上册',
  tagline: '例题可视化 · 参数实验室',
  icon: '📐',
  accent: 'primary',
  description: '苏教版五年级上册 · 33 个可调参数例题 Lab + 10 个训练小游戏',
  features: [
    { icon: '📐', text: '8 个单元 · 33 个可调参数 Lab' },
    { icon: '🧊', text: 'three.js 三视图 · chart.js 统计图 · 面积剪拼动画' },
    { icon: '🎯', text: '10 个训练游戏（面积速算 / 质数快抢 / 三视图配对…）' },
  ],
  cta: '进入五年级',
  footer: '《义务教育教科书·数学》苏教版五年级上册 配套互动演示 · 例题可视化可拖动参数实时计算',
}

const G6: GradeInfo = {
  id: 'g6',
  no: 6,
  base: '/g6/',
  label: '六年级',
  title: '六年级数学例题可视化',
  standard: '苏教版 · 2022 版课标',
  book: '《义务教育教科书·数学》苏教版六年级上册',
  tagline: '例题可视化 · 参数实验室',
  icon: '📚',
  accent: 'primary',
  description: '苏教版六年级上册 · 33 个可调参数例题 Lab + 12 个训练小游戏',
  features: [
    { icon: '📚', text: '7 个单元 · 33 个可调参数 Lab' },
    { icon: '⭕', text: '圆 / 比和比例 / 二进制 / 放大缩小 / 确定位置' },
    { icon: '🎯', text: '12 个训练游戏（小数乘除 / 解比例 / 出租车计费…）' },
  ],
  cta: '进入六年级',
  footer: '《义务教育教科书·数学》苏教版六年级上册 配套互动演示 · 例题可视化可拖动参数实时计算',
}

/** 全部年级（按序号升序），新增年级在此追加 */
export const GRADES: readonly GradeInfo[] = [G1, G2, G3, G4, G5, G6]

/** 按部署路径段查找年级 */
export function gradeById(id: string): GradeInfo | undefined {
  return GRADES.find((g) => g.id === id)
}

/** 按部署路径查找年级（容忍末尾斜杠缺失，如 '/g1'） */
export function gradeByBase(base: string): GradeInfo | undefined {
  const norm = base.endsWith('/') ? base : `${base}/`
  return GRADES.find((g) => g.base === norm)
}

/** 除当前年级外的其他年级（保持序号顺序，供顶栏切换渲染）；未知 id 返回空 */
export function otherGrades(id: string): GradeInfo[] {
  if (!isKnownGrade(id)) return []
  return GRADES.filter((g) => g.id !== id)
}

/** 是否为已知年级 id */
export function isKnownGrade(id: string): boolean {
  return GRADES.some((g) => g.id === id)
}

/** 年级序号（未知返回 0） */
export function gradeNoOf(id: string): number {
  return gradeById(id)?.no ?? 0
}
