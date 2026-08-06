import { describe, expect, it } from 'vitest'
import {
  sharedAppConfig,
  sharedCss,
  gradePrerenderIgnore,
  sharedIcon,
  sharedNuxtConfig,
  sharedPrerender,
  sharedUi,
  sharedVite,
} from '../theme/nuxt-config'

describe('共享 Nuxt 配置片段 nuxt-config', () => {
  it('UI 离线字体与图标按需扫描（含共享组件图标清单）', () => {
    expect(sharedUi).toEqual({ fonts: false })
    expect(sharedIcon).toEqual({
      clientBundle: {
        scan: true,
        icons: ['heroicons:home', 'heroicons:arrow-left-circle', 'heroicons:arrow-right-circle'],
      },
    })
  })

  it('主色统一为五年级 emerald（主样式基准）', () => {
    expect(sharedAppConfig).toEqual({ ui: { colors: { primary: 'emerald', neutral: 'slate' } } })
  })

  it('三方库统一优化依赖', () => {
    expect(sharedVite.optimizeDeps.include).toEqual(['three', 'jsxgraph', 'animejs'])
  })

  it('CSS 入口统一从 shared 注入', () => {
    expect(sharedCss).toEqual(['@shared/theme/app.css'])
  })

  it('预渲染策略：crawlLinks 全量 + 容忍跨年级 404', () => {
    expect(sharedPrerender).toEqual({ crawlLinks: true, failOnError: false })
  })

  it('按当前年级生成跨年级 prerender ignore 列表', () => {
    expect(gradePrerenderIgnore('g4')).toEqual([
      '**/g1/**',
      '**/g2/**',
      '**/g3/**',
      '**/g5/**',
      '**/g6/**',
    ])
    expect(gradePrerenderIgnore('g1')).toEqual(['**/g2/**', '**/g3/**', '**/g4/**', '**/g5/**', '**/g6/**'])
  })

  it('sharedNuxtConfig 组装共享片段并合并扩展项', () => {
    const cfg = sharedNuxtConfig({
      app: { head: { title: '五年级数学例题可视化' } },
      ssr: false,
    })
    expect(cfg.ui).toEqual({ fonts: false })
    expect(cfg.icon).toEqual(sharedIcon)
    expect(cfg.css).toEqual(sharedCss)
    expect(cfg.appConfig).toEqual(sharedAppConfig)
    expect(cfg.vite).toEqual(sharedVite)
    expect(cfg.nitro?.prerender).toEqual({ crawlLinks: true, failOnError: false })
    expect(cfg.ssr).toBe(false)
    expect(cfg.app?.head).toEqual({ title: '五年级数学例题可视化' })
  })

  it('sharedNuxtConfig 合并额外 prerender 配置（如跨年级 ignore）', () => {
    const cfg = sharedNuxtConfig({
      nitro: { preset: 'cloudflare-pages', prerender: { ignore: ['**/g1/**'] } },
    })
    expect(cfg.nitro?.preset).toBe('cloudflare-pages')
    expect(cfg.nitro?.prerender).toEqual({
      crawlLinks: true,
      failOnError: false,
      ignore: ['**/g1/**'],
    })
  })

  it('sharedNuxtConfig 不传参时仅返回共享片段', () => {
    const cfg = sharedNuxtConfig()
    expect(cfg).toEqual({
      ui: sharedUi,
      css: sharedCss,
      icon: sharedIcon,
      appConfig: sharedAppConfig,
      vite: sharedVite,
      nitro: { prerender: sharedPrerender },
    })
  })
})
