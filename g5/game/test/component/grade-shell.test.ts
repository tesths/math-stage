import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GradeShell from '@shared/components/GradeShell.vue'

describe('共享布局 GradeShell', () => {
  it('五年级：顶栏标题为五年级应用名', () => {
    const w = mount(GradeShell, { props: { gradeId: 'g5' } })
    expect(w.find('.uheader-title').text()).toBe('五年级数学例题可视化')
  })

  it('五年级：切换链接指向一年级部署路径 /g1/（原生 a）', () => {
    const w = mount(GradeShell, { props: { gradeId: 'g5' } })
    const link = w.find('a[href="/g1/"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('一年级')
  })

  it('一年级：切换链接指向五年级部署路径 /g5/，且箭头为向右', () => {
    const w = mount(GradeShell, { props: { gradeId: 'g1' } })
    const link = w.find('a[href="/g5/"]')
    expect(link.exists()).toBe(true)
    expect(link.find('.i-heroicons-arrow-right-circle').exists()).toBe(true)
  })

  it('回门户链接指向根路径 /', () => {
    const w = mount(GradeShell, { props: { gradeId: 'g5' } })
    const home = w.find('a[href="/"]')
    expect(home.exists()).toBe(true)
    expect(home.text()).toContain('首页')
  })

  it('站内导航按钮渲染 label 与路由', () => {
    const w = mount(GradeShell, {
      props: {
        gradeId: 'g5',
        nav: [{ label: '训练游戏', to: '/games', icon: 'i-heroicons-cube' }],
      },
    })
    const btn = w.find('.ubutton[data-to="/games"]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('训练游戏')
  })

  it('页脚展示当前年级配套文案', () => {
    const w = mount(GradeShell, { props: { gradeId: 'g5' } })
    expect(w.find('footer').text()).toContain('苏教版五年级上册')
    const w1 = mount(GradeShell, { props: { gradeId: 'g1' } })
    expect(w1.find('footer').text()).toContain('一年级上册')
  })

  it('主区插槽内容渲染', () => {
    const w = mount(GradeShell, {
      props: { gradeId: 'g5' },
      slots: { default: '<p class="slot-content">正文</p>' },
    })
    expect(w.find('.slot-content').text()).toBe('正文')
  })
})
