import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { gradePrerenderIgnore, sharedNuxtConfig } from '../../shared/theme/nuxt-config'
import { siteHead } from '../../shared/theme'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: 'src/',
  modules: ['@nuxt/ui'],
  ssr: true,
  // 统一入口：Nuxt UI 配置 / 图标 / 主色（emerald）/ 预渲染策略全部来自 shared
  ...sharedNuxtConfig({
    nitro: {
      prerender: {
        // 顶栏跨年级链接由共享年级注册表生成 ignore 列表，避免新增年级漏改。
        ignore: gradePrerenderIgnore('g5'),
      },
    },
    app: {
      // BASE_URL 供单 Pages 项目子路径部署（如 /g5/）；本地默认 /
      baseURL: process.env.BASE_URL ?? '/',
      head: siteHead('五年级数学例题可视化', '根据苏教版五年级上册数学书例题制作的可调参数可视化与训练小游戏'),
    },
  }),
  alias: {
    '@data': fileURLToPath(new URL('../data/upper', import.meta.url)),
    '@shared': fileURLToPath(new URL('../../shared', import.meta.url)),
  },
})
