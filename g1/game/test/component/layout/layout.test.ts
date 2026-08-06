import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DefaultLayout from '@/layouts/default.vue'
import GradeShell from '@shared/components/GradeShell.vue'

describe('layouts/default（一年级）', () => {
  it('使用共享 GradeShell 布局（标题为一年级应用名）', () => {
    const w = mount(DefaultLayout, {
      slots: { default: '<p class="page-content">例题内容</p>' },
    })
    expect(w.findComponent(GradeShell).exists()).toBe(true)
    expect(w.find('.uheader-title').text()).toBe('一年级数学例题游戏')
    expect(w.find('main .page-content').text()).toBe('例题内容')
  })

  it('顶栏切换链接指向五年级部署路径 /g5/（原生 a）', () => {
    const w = mount(DefaultLayout)
    const link = w.find('a[href="/g5/"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('五年级')
  })

  it('回门户链接指向根路径 /', () => {
    const w = mount(DefaultLayout)
    expect(w.find('a[href="/"]').exists()).toBe(true)
  })

  it('页脚展示一年级配套文案', () => {
    const w = mount(DefaultLayout)
    expect(w.find('footer').text()).toContain('一年级上册')
  })
})
