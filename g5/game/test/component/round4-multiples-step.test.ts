import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import NumberLab from '@/components/labs/NumberLab.vue'
import { findLabById } from '@data'
import { multiples } from '@/lib/labs/number'

/**
 * 第 4 轮收尾（agent C）：`g5-c6-multiples-3` 补「做一次」的步进操作。
 *
 * 改前：整页只有两个滑块 + 上一个/下一个，没有任何操作按钮——
 * 重截的 `<id>-act.png` 与初始态**逐字节相同**，属于 rubric 里的「静态图当过程」（L3 fail）。
 * 改后：加「再跳一次（+3）」，每点一次点亮一段跳跃弧、把落点放大、给出
 * 「第 2 次跳跃：3 → 6（+3），落在第 2 个倍数 6」这样的中间读数。
 * 数轴上的倍数点仍然一开始就全画出来（基线断言 `.nl-mark` = 5 不能被破坏）。
 */
describe('g5-c6-multiples-3：逐次跳跃的过程态', () => {
  const lab = findLabById('g5-c6-multiples-3')!
  const mountIt = () => mount(NumberLab, { props: { lab, values: { n: 3, k: 5 } } })

  it('初始态：一个跳跃都没点亮，提示从 0 出发', () => {
    const w = mountIt()
    expect(w.findAll('.nl-mark')).toHaveLength(5) // 基线断言保持
    expect(w.findAll('.jump-arc.on')).toHaveLength(0)
    expect(w.find('[data-test="jump-status"]').text()).toContain('还没开始跳')
    expect(w.find('[data-test="jump-next"]').exists()).toBe(true)
  })

  it('点一次：点亮 1 段弧 + 落点放大 + 读数给出 3 → 6（+3）', async () => {
    const w = mountIt()
    const before = w.html()
    await w.find('[data-test="jump-next"]').trigger('click')
    expect(w.findAll('.jump-arc.on')).toHaveLength(1)
    expect(w.findAll('.jump-step-label')).toHaveLength(1)
    expect(w.findAll('.nl-mark.hit')).toHaveLength(1)
    expect(w.find('[data-test="jump-status"]').text()).toContain('3 → 6（+3）')
    expect(w.html()).not.toBe(before) // DOM 真的变了
  })

  it('点到底：跳了 4 次，落在 15，按钮变灰，读数与 3 的倍数一一对应', async () => {
    const w = mountIt()
    const btn = w.find('[data-test="jump-next"]')
    for (let i = 0; i < 4; i++) await btn.trigger('click')
    expect(w.findAll('.jump-arc.on')).toHaveLength(4)
    expect(w.find('[data-test="jump-status"]').text()).toContain('12 → 15（+3）')
    expect(w.find('[data-test="jump-status"]').text()).toContain('第 5 个倍数 15')
    expect(btn.attributes('disabled')).toBeDefined()
    // 每次落点必须等于「n 的第 k 个倍数」，不许是另一套数
    const list = multiples(3, 5)
    expect(list).toEqual([3, 6, 9, 12, 15])
    expect(w.findAll('.factor-chip.primary').map((c) => c.text())).toEqual(['3', '6', '9', '12', '15'])
  })

  it('复位回到初始态；换基准数后跳跃计数清零（不会残留上一组的高亮）', async () => {
    const w = mountIt()
    await w.find('[data-test="jump-next"]').trigger('click')
    await w.find('[data-test="jump-next"]').trigger('click')
    expect(w.findAll('.jump-arc.on')).toHaveLength(2)
    const reset = w.findAll('button').find((b) => b.text() === '复位')!
    await reset.trigger('click')
    expect(w.findAll('.jump-arc.on')).toHaveLength(0)

    await w.find('[data-test="jump-all"]').trigger('click')
    expect(w.findAll('.jump-arc.on')).toHaveLength(4)
    await w.setProps({ values: { n: 4, k: 5 } })
    expect(w.findAll('.jump-arc.on')).toHaveLength(0)
  })
})
