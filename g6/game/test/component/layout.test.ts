import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DefaultLayout from '@/layouts/default.vue'
import GradeShell from '@shared/components/GradeShell.vue'

describe('layouts/default（六年级）', () => {
  it('使用共享 GradeShell 布局（标题为六年级应用名）', () => {
    const w = mount(DefaultLayout, {
      slots: { default: '<p class="page-content">正文</p>' },
    })
    expect(w.findComponent(GradeShell).exists()).toBe(true)
    expect(w.find('.uheader-title').text()).toBe('六年级数学可视化')
    expect(w.find('main .page-content').text()).toBe('正文')
  })

  it('顶栏切换链接指向一年级 /g1/ 与五年级 /g5/ 部署路径（原生 a）', () => {
    const w = mount(DefaultLayout)
    expect(w.find('a[href="/g1/"]').exists()).toBe(true)
    expect(w.find('a[href="/g5/"]').exists()).toBe(true)
  })

  it('站内导航渲染训练游戏按钮', () => {
    const w = mount(DefaultLayout)
    const btn = w.find('.ubutton[data-to="/games"]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('训练游戏')
  })

  it('回门户链接指向根路径 /', () => {
    const w = mount(DefaultLayout)
    expect(w.find('a[href="/"]').exists()).toBe(true)
  })

  it('页脚展示六年级配套文案', () => {
    const w = mount(DefaultLayout)
    expect(w.find('footer').text()).toContain('苏教版六年级上册')
  })
})
