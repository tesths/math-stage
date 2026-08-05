import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { sharedNuxtConfig } from '../shared/theme/nuxt-config'
import { siteHead } from '../shared/theme'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: 'src/',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ssr: true,
  // 统一入口：Nuxt UI 配置 / 图标 / 主色（emerald）/ 预渲染策略全部来自 shared
  ...sharedNuxtConfig({
    nitro: {
      prerender: {
        // 顶栏有跨年级切换链接（/g5/），本应用没有该路由，crawler 会 404 报错 —— 忽略
        ignore: ['**/g5/**'],
      },
    },
    app: {
      // BASE_URL 供单 Pages 项目子路径部署（如 /g1/）；本地默认 /
      baseURL: process.env.BASE_URL ?? '/',
      head: siteHead('一年级数学例题游戏', '根据人教版一年级上册数学书例题制作的可视化小游戏'),
    },
  }),
  alias: {
    '@data': fileURLToPath(new URL('../data', import.meta.url)),
    '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
  },
})
