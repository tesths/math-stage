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

// 全局 UI 事件兼容 (happy-dom)
if (typeof globalThis.matchMedia === 'undefined') {
  // @ts-expect-error happy-dom 无实现，注入 stub
  globalThis.matchMedia = vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }))
}

// localStorage stub（happy-dom 有基础实现，这里统一清空保证隔离）
if (typeof globalThis.localStorage !== 'undefined') {
  globalThis.localStorage.clear()
}

// 音频 mock：组件测试不产生真实声音
vi.mock('@/lib/sound', () => ({
  playCorrect: vi.fn(),
  playWrong: vi.fn(),
  playClick: vi.fn(),
  playWin: vi.fn(),
  setMuted: vi.fn(),
  isMuted: () => false,
}))

// three.js 在组件测试中 mock 为无渲染实现（真实渲染由 E2E 验证）
vi.mock('three', () => ({
  WebGLRenderer: class {
    domElement = document.createElement('canvas')
    setSize() {}
    render() {}
    dispose() {}
  },
  Scene: class {
    add() {}
    remove() {}
  },
  PerspectiveCamera: class {
    position = { set() {} }
    lookAt() {}
  },
  AmbientLight: class {},
  DirectionalLight: class {
    position = { set() {} }
  },
  MeshLambertMaterial: class {},
  Mesh: class {
    rotation = { y: 0 }
  },
  BoxGeometry: class {},
  CylinderGeometry: class {},
  SphereGeometry: class {},
}))
vi.mock('jsxgraph', () => ({ JXG: { JSBoard: vi.fn() } }))
