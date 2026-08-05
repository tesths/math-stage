import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { sharedNuxtConfig } from '../shared/theme/nuxt-config'
import { siteHead } from '../shared/theme'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ssr: true,
  // 统一入口：Nuxt UI 配置 / 图标 / 主色（emerald）/ 预渲染策略全部来自 shared
  ...sharedNuxtConfig({
    nitro: {
      prerender: {
        // 门户只有首页：不能 crawlLinks（会去爬 /g1/ /g5/ 链接导致 404 报错），显式预渲染 /
        crawlLinks: false,
        routes: ['/'],
      },
    },
    app: {
      baseURL: process.env.BASE_URL ?? '/',
      head: siteHead('小学数学互动学习平台', '人教版一年级 · 苏教版五年级 —— 例题可视化与训练小游戏总入口'),
    },
  }),
  alias: {
    '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
  },
})
