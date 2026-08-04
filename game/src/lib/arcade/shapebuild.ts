import type { ShapeName } from './shaperiddle'

export interface ShapePart {
  shape: ShapeName
  count: number
}

export interface BuildPlan {
  name: string
  art: string
  parts: ShapePart[]
}

/** 可用立体图形集合 */
export const SHAPES: ShapeName[] = ['长方体', '正方体', '圆柱', '球']

/** 图形拼搭图纸（造型 → 所需立体图形） */
export const BUILD_PLANS: BuildPlan[] = [
  {
    name: '小房子',
    art: '🏠',
    parts: [
      { shape: '长方体', count: 2 },
      { shape: '圆柱', count: 1 },
      { shape: '球', count: 1 },
    ],
  },
  {
    name: '小汽车',
    art: '🚗',
    parts: [
      { shape: '长方体', count: 1 },
      { shape: '圆柱', count: 2 },
    ],
  },
  {
    name: '彩虹塔',
    art: '🗼',
    parts: [
      { shape: '正方体', count: 1 },
      { shape: '圆柱', count: 2 },
      { shape: '球', count: 1 },
    ],
  },
]

export function planOf(name: string): BuildPlan {
  return BUILD_PLANS.find((p) => p.name === name) ?? BUILD_PLANS[0]!
}