import type { ExerciseLabKind, LabKind, ParamValues } from '@data/schema/lab'
import type { LabResult } from '../types'
import { computeC1 } from './c1'
import { computeC2 } from './c2'
import { computeC3 } from './c3'
import { computeC4 } from './c4'
import { computeC5 } from './c5'
import { computeC6 } from './c6'
import { computeC7 } from './c7'

/**
 * 练习题 Lab 求值入口。
 *
 * 约定：一条练习题 = 一种 kind（见 `@data/schema/lab` 的 ExerciseLabKind）。
 * 每个单元一个计算模块（computeC1 … computeC7），本文件只做 kind → 模块的分派。
 */
export const EXERCISE_KINDS: ExerciseLabKind[] = [
  'ex-c1-div11-cycle',
  'ex-c1-pgram-area',
  'ex-c2-overlap-club',
  'ex-c2-egg-crate',
  'ex-c3-div-to-mul',
  'ex-c3-frac-split',
  'ex-c4-cube-ratio',
  'ex-c4-football-ratio',
  'ex-c5-wheel-roll',
  'ex-c5-circle-packing',
  'ex-c6-scale-area',
  'ex-c6-two-maps',
  'ex-c7-route-path',
  'ex-c7-observer-point',
]

/** 类型守卫：区分「练习题 kind」与原有 33 种「例题 kind」 */
export function isExerciseKind(kind: LabKind): kind is ExerciseLabKind {
  return (EXERCISE_KINDS as readonly string[]).includes(kind)
}

export function computeExerciseLab(kind: ExerciseLabKind, p: ParamValues): LabResult {
  switch (kind) {
    case 'ex-c1-div11-cycle':
    case 'ex-c1-pgram-area':
      return computeC1(kind, p)
    case 'ex-c2-overlap-club':
    case 'ex-c2-egg-crate':
      return computeC2(kind, p)
    case 'ex-c3-div-to-mul':
    case 'ex-c3-frac-split':
      return computeC3(kind, p)
    case 'ex-c4-cube-ratio':
    case 'ex-c4-football-ratio':
      return computeC4(kind, p)
    case 'ex-c5-wheel-roll':
    case 'ex-c5-circle-packing':
      return computeC5(kind, p)
    case 'ex-c6-scale-area':
    case 'ex-c6-two-maps':
      return computeC6(kind, p)
    case 'ex-c7-route-path':
    case 'ex-c7-observer-point':
      return computeC7(kind, p)
  }
}
