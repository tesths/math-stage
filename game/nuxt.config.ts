import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: 'src/',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ssr: true,
  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: true,
    },
  },
  ui: {
    fonts: false,
  },
  icon: {
    clientBundle: {
      scan: true,
    },
  },
  app: {
    // BASE_URL 供单 Pages 项目子路径部署（如 /g1/）；本地默认 /
    baseURL: process.env.BASE_URL ?? '/',
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '一年级数学例题游戏',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '根据人教版一年级上册数学书例题制作的可视化小游戏' },
      ],
    },
  },
  appConfig: {
    ui: {
      colors: {
        primary: 'orange',
        neutral: 'slate',
      },
    },
  },
  alias: {
    '@data': fileURLToPath(new URL('../data', import.meta.url)),
  },
  vite: {
    optimizeDeps: {
      include: ['three', 'jsxgraph', 'animejs'],
    },
  },
})