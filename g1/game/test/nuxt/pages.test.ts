// @vitest-environment nuxt
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createRouter, createMemoryHistory, type RouteRecordRaw } from 'vue-router'
import UnitPage from '@/pages/units/[id].vue'
import PlayPage from '@/pages/play/[id].vue'
import { byChapter } from '@data'

function routerFor(path: string, routeRecords: RouteRecordRaw[]) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: routeRecords,
  })
  void router.push(path)
  return router
}

describe('pages/units/[id]', () => {
  it('渲染单元信息与例题列表', async () => {
    const c1 = byChapter[0]!
    const w = await mountSuspended(UnitPage, {
      router: routerFor(`/units/${c1.meta.id}`, [
        { path: '/', component: { template: '<div />' } },
        { path: '/units/:id', component: UnitPage },
      ]),
    })
    expect(w.text()).toContain(c1.meta.title)
    expect(w.findAll('.ex-card').length).toBe(c1.examples.length)
    expect(w.text()).toContain(`例题 ${c1.examples.length} 道`)
  })

  it('未知单元返回 404', async () => {
    let thrown: Error | null = null
    try {
      await mountSuspended(UnitPage, {
        router: routerFor('/units/xx', [{ path: '/units/:id', component: UnitPage }]),
      })
    } catch (e) {
      thrown = e as Error
    }
    expect(thrown).toBeTruthy()
  })
})

describe('pages/play/[id]', () => {
  it('渲染题目与游戏交互区', async () => {
    const ex = byChapter[0]!.examples[0]!
    const w = await mountSuspended(PlayPage, {
      router: routerFor(`/play/${ex.id}`, [
        { path: '/', component: { template: '<div />' } },
        { path: '/play/:id', component: PlayPage },
      ]),
    })
    expect(w.text()).toContain(ex.title)
    expect(w.text()).toContain('返回单元')
    expect(w.text()).toContain('下一题')
    expect(w.find('.answer-pad').exists()).toBe(true)
  })

  it('未知题目返回 404', async () => {
    let thrown: Error | null = null
    try {
      await mountSuspended(PlayPage, {
        router: routerFor('/play/xx', [{ path: '/play/:id', component: PlayPage }]),
      })
    } catch (e) {
      thrown = e as Error
    }
    expect(thrown).toBeTruthy()
  })
})