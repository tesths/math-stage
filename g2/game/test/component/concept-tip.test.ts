import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ConceptTip from '@shared/components/ConceptTip.vue'
import { allLabs, findLabById } from '@data'

describe('ConceptTip 接入 g2 全部 Lab（L4：每道例题都有一条概念 + 易错点）', () => {
  it('22 个 Lab 全部带 tip，且都写了「概念 + 易错点」两段', () => {
    const labs = allLabs
    expect(labs.length).toBe(22)
    for (const lab of labs) {
      const tip = (lab.tip ?? '').trim()
      expect(tip.length, `${lab.id} 缺 tip`).toBeGreaterThan(20)
      expect(tip, `${lab.id} 没有易错点`).toContain('易错点')
    }
  })

  it('tip 里点到的页码与 Lab 自己的书页一致（不串页）', () => {
    for (const lab of allLabs) {
      const w = mount(ConceptTip, { props: { tip: lab.tip, page: lab.page, source: lab.source } })
      expect(w.find('[data-test="concept-tip"]').text()).toContain(`课本第 ${lab.page} 页`)
      expect(w.text()).toContain(lab.source)
    }
  })

  it('默认收起：学生先想再看（不抢先给结论）', () => {
    const lab = findLabById('g2-c3-tangram')!
    const w = mount(ConceptTip, { props: { tip: lab.tip, page: lab.page, source: lab.source } })
    expect(w.find('[data-test="concept-text"]').exists()).toBe(false)
    expect(w.find('[data-test="concept-toggle"]').text()).toBe('先想一想，再看提示')
  })

  it('点开才显示 tip 正文，正文里能读到概念与易错点', async () => {
    const lab = findLabById('g2-c3-tangram')!
    const w = mount(ConceptTip, { props: { tip: lab.tip, page: lab.page, source: lab.source } })
    await w.find('[data-test="concept-toggle"]').trigger('click')
    const text = w.find('[data-test="concept-text"]').text()
    expect(text).toContain('③号和⑤号')
    expect(text).toContain('易错点')
    await w.find('[data-test="concept-toggle"]').trigger('click')
    expect(w.find('[data-test="concept-text"]').exists()).toBe(false)
  })

  it('每个 Lab 展开后都不为空、不超长（长到手机一屏放不下就没人读）', async () => {
    for (const lab of allLabs) {
      const w = mount(ConceptTip, { props: { tip: lab.tip, page: lab.page, source: lab.source } })
      await w.find('[data-test="concept-toggle"]').trigger('click')
      const text = w.find('[data-test="concept-text"]').text()
      expect(text.length).toBeLessThan(260)
    }
  })
})
