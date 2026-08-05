import { describe, expect, it } from 'vitest'
import {
  THEME,
  buildMeta,
  pageRangeLabel,
  siteHead,
  unitNoText,
} from '../theme'

describe('设计令牌 theme tokens', () => {
  it('全局主色以五年级为主样式（emerald）', () => {
    expect(THEME.primary).toBe('emerald')
    expect(THEME.neutral).toBe('slate')
  })

  it('siteHead 生成统一 HTML head 元数据', () => {
    const head = siteHead('一年级数学例题游戏', '示例描述')
    expect(head.htmlAttrs).toEqual({ lang: 'zh-CN' })
    expect(head.title).toBe('一年级数学例题游戏')
    expect(head.meta).toContainEqual({ name: 'viewport', content: 'width=device-width, initial-scale=1' })
    expect(head.meta).toContainEqual({ name: 'description', content: '示例描述' })
  })

  it('buildMeta 生成 viewport 与 description', () => {
    const meta = buildMeta('desc')
    expect(meta).toHaveLength(2)
    expect(meta[0]).toEqual({ name: 'viewport', content: 'width=device-width, initial-scale=1' })
    expect(meta[1]).toEqual({ name: 'description', content: 'desc' })
  })

  it('unitNoText 输出课本单元标签', () => {
    expect(unitNoText(1)).toBe('第 1 单元')
    expect(unitNoText(5)).toBe('第 5 单元')
  })

  it('pageRangeLabel 输出书页区间文案', () => {
    expect(pageRangeLabel(1, 13)).toBe('书页 1–13')
    expect(pageRangeLabel(30, 50)).toBe('书页 30–50')
  })
})
