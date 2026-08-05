import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { sharedNuxtConfig } from '../../shared/theme/nuxt-config'
import { siteHead } from '../../shared/theme'

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
        // 顶栏有跨年级切换链接（/g1/ 等），本应用没有这些路由，crawler 会 404 报错 —— 忽略
        ignore: ['**/g1/**', '**/g2/**', '**/g3/**', '**/g5/**', '**/g6/**'],
      },
    },
    app: {
      // BASE_URL 供单 Pages 项目子路径部署（如 /g4/）；本地默认 /
      baseURL: process.env.BASE_URL ?? '/',
      head: siteHead('四年级数学例题可视化', '根据苏教版四年级上册数学书例题制作的可调参数可视化与训练小游戏'),
    },
  }),
  alias: {
    '@data': fileURLToPath(new URL('../data', import.meta.url)),
    '@shared': fileURLToPath(new URL('../../shared', import.meta.url)),
  },
})
