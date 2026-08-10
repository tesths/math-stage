import type { NuxtConfig } from 'nuxt/config'
import { GRADES, type GradeId } from '../grades'

/**
 * 共享 Nuxt 配置片段：六个年级应用 + 门户统一入口。
 * 引入方式：在各自 nuxt.config.ts 中 spread 到 defineNuxtConfig。
 */

/** 全平台统一 CSS 入口：tailwind + Nuxt UI + shared 覆盖层 */
export const sharedCss = ['@shared/theme/app.css']

/** Nuxt UI 离线字体（不拉 Google Fonts） */
export const sharedUi = { fonts: false }

/** 站内 NuxtLink 链接统一输出带尾斜杠，与预渲染文件形态一致，消除 Cloudflare 308 永久重定向与旧缓存隐患 */
export const sharedLinkDefaults = {
  experimental: {
    defaults: {
      nuxtLink: { trailingSlash: 'append' },
    },
  },
} satisfies Pick<Partial<NuxtConfig>, 'experimental'>

/** 图标按需扫描（离线图标解析）；共享组件在 srcDir 外，需显式列出其图标 */
export const sharedIcon = {
  clientBundle: {
    scan: true,
    icons: ['heroicons:home', 'heroicons:arrow-left-circle', 'heroicons:arrow-right-circle'],
  },
}

/** 统一主色（以五年级 emerald 为主样式）与中性色 */
export const sharedAppConfig = {
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'slate',
    },
  },
}

/** 统一 Vite 优化依赖（各应用一致的三方库） */
export const sharedVite = {
  optimizeDeps: {
    include: ['three', 'jsxgraph', 'animejs'],
  },
}

/** 统一预渲染策略：crawlLinks 全量预渲染 + 容忍跨年级链接 404 */
export const sharedPrerender = {
  crawlLinks: true,
  failOnError: false,
}

/** 当前年级构建时，crawler 应忽略其他年级的子路径链接 */
export function gradePrerenderIgnore(currentGrade: GradeId): string[] {
  return GRADES.filter((g) => g.id !== currentGrade).map((g) => `**${g.base}**`)
}

/** 应用共享片段（不含 app/baseURL —— 各应用按部署环境设置）；extra.nitro 会与共享策略合并 */
export function sharedNuxtConfig(extra: Partial<NuxtConfig> = {}): Partial<NuxtConfig> {
  const { nitro, ...rest } = extra
  return {
    ui: sharedUi,
    css: sharedCss,
    icon: sharedIcon,
    appConfig: sharedAppConfig,
    vite: sharedVite,
    experimental: sharedLinkDefaults.experimental,
    nitro: {
      ...nitro,
      prerender: {
        ...sharedPrerender,
        ...(nitro?.prerender ?? {}),
      },
    },
    ...rest,
  }
}
