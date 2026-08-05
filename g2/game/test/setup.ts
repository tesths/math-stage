/** vitest setup：happy-dom 环境下的最小配置 */
import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import {
  UAlert,
  UBadge,
  UButton,
  UCard,
  UContainer,
  UHeader,
  UIcon,
  UInput,
} from '@shared/test/stubs/components'

config.global.stubs = {
  ...config.global.stubs,
  UAlert,
  Alert: UAlert,
  UBadge,
  Badge: UBadge,
  UButton,
  Button: UButton,
  Link: UButton,
  NuxtLink: UButton,
  RouterLink: UButton,
  UCard,
  Card: UCard,
  UContainer,
  Container: UContainer,
  UHeader,
  Header: UHeader,
  UIcon,
  Icon: UIcon,
  UInput,
  Input: UInput,
}

// 音频上下文在测试环境不可用，静默
vi.stubGlobal('AudioContext', undefined)

// matchMedia（Nuxt UI 组件可能需要）
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}
