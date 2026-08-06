// @vitest-environment nuxt
import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '@/pages/index.vue'
import UnitPage from '@/pages/units/[id].vue'
import { byChapter } from '@data'

vi.mock('animejs', () => ({
  animate: vi.fn(() => ({})),
}))

describe('pages/index', () => {
  it('渲染标题、目录与全部 9 个单元', async () => {
    const w = await mountSuspended(IndexPage)
    expect(w.text()).toContain('一年级数学例题游戏')
    expect(w.text()).toContain('课本目录')
    expect(w.text()).toContain('数学游戏分享')
    expect(w.text()).toContain('0~5的认识和加减法')
    expect(w.findAll('.unit-card').length).toBe(byChapter.length)
    expect(w.findAll('a[href="/units/c1"]').length).toBeGreaterThan(0)
  })

  it('每个单元显示例题数', async () => {
    const w = await mountSuspended(IndexPage)
    const card = w.findAll('.unit-card')[0]
    expect(card!.text()).toContain(`例题 ${byChapter[0]!.examples.length} 道`)
  })

  it('玩法演示区覆盖全部 11 种题型', async () => {
    const w = await mountSuspended(IndexPage)
    expect(w.findAll('.demo-card').length).toBe(11)
    expect(w.text()).toContain('抢10')
    expect(w.text()).toContain('立体图形')
  })
})