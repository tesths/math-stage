import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import DefaultLayout from '@/layouts/default.vue'

describe('layouts/default', () => {
  it('渲染头部、插槽与页脚', () => {
    const w = shallowMount(DefaultLayout, {
      slots: { default: '<p class="page-content">例题内容</p>' },
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
        },
      },
    })
    expect(w.find('main .page-content').text()).toBe('例题内容')
    expect(w.find('footer').exists()).toBe(true)
  })
})