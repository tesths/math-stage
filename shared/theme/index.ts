/**
 * 设计令牌：全局主题唯一来源（以五年级 emerald 为主样式）。
 * CSS 变量层见 theme/main.css；此处 TS 常量供 Nuxt 配置与页面文案使用。
 */

/** 全局主题令牌 */
export const THEME = {
  /** 全局主色（= 五年级主样式基准） */
  primary: 'emerald',
  /** 中性色 */
  neutral: 'slate',
  /** 平台站点名（门户标题） */
  siteName: '小学数学互动学习平台',
} as const

export interface HeadMeta {
  htmlAttrs: { lang: string }
  title: string
  meta: { name: string; content: string }[]
}

/** 构建应用统一 HTML head 元数据 */
export function siteHead(title: string, description: string): HeadMeta {
  return {
    htmlAttrs: { lang: 'zh-CN' },
    title,
    meta: buildMeta(description),
  }
}

/** viewport + description 元数据 */
export function buildMeta(description: string): { name: string; content: string }[] {
  return [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: description },
  ]
}

/** 课本单元标签：'第 1 单元' */
export function unitNoText(no: number): string {
  return `第 ${no} 单元`
}

/** 书页区间文案：'书页 30–50' */
export function pageRangeLabel(pageStart: number, pageEnd: number): string {
  return `书页 ${pageStart}–${pageEnd}`
}
