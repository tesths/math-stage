import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ssr: true,
  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      // 门户只有首页：不能 crawlLinks（会去爬 /g1/ /g5/ 链接导致 404 报错），显式预渲染 /
      crawlLinks: false,
      routes: ['/'],
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
    baseURL: process.env.BASE_URL ?? '/',
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '小学数学互动学习平台',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '人教版一年级 · 苏教版五年级 —— 例题可视化与训练小游戏总入口' },
      ],
    },
  },
  appConfig: {
    ui: {
      colors: {
        primary: 'sky',
        neutral: 'slate',
      },
    },
  },
})
