import type { Component } from 'vue'
import type { LabKind } from '@data/schema/lab'
import DecimalLab from '@/components/labs/DecimalLab.vue'
import MixCalcLab from '@/components/labs/MixCalcLab.vue'
import SegmentLab from '@/components/labs/SegmentLab.vue'
import NumberLab from '@/components/labs/NumberLab.vue'
import RatioLab from '@/components/labs/RatioLab.vue'
import CircleLab from '@/components/labs/CircleLab.vue'
import ScaleLab from '@/components/labs/ScaleLab.vue'
import PositionLab from '@/components/labs/PositionLab.vue'
import ExerciseC1Lab from '@/components/labs/exercises/ExerciseC1Lab.vue'
import ExerciseC2Lab from '@/components/labs/exercises/ExerciseC2Lab.vue'
import ExerciseC3Lab from '@/components/labs/exercises/ExerciseC3Lab.vue'
import ExerciseC4Lab from '@/components/labs/exercises/ExerciseC4Lab.vue'
import ExerciseC5Lab from '@/components/labs/exercises/ExerciseC5Lab.vue'
import ExerciseC6Lab from '@/components/labs/exercises/ExerciseC6Lab.vue'
import ExerciseC7Lab from '@/components/labs/exercises/ExerciseC7Lab.vue'

/** Lab kind → 组件映射 */
export const LAB_COMPONENTS: Record<LabKind, Component> = {
  'mul-decimal': DecimalLab,
  'mul-compare': DecimalLab,
  'mul-approx': DecimalLab,
  'div-decimal': DecimalLab,
  'div-approx': DecimalLab,
  'round-life': DecimalLab,
  'frac-mix': MixCalcLab,
  'estimate-shop': MixCalcLab,
  piecewise: MixCalcLab,
  segment: SegmentLab,
  'segment-more': SegmentLab,
  'work-together': SegmentLab,
  'place-value': NumberLab,
  'compare-unit': NumberLab,
  'op-consistency': NumberLab,
  binary: NumberLab,
  'ratio-intro': RatioLab,
  'ratio-value': RatioLab,
  'ratio-simplify': RatioLab,
  'ratio-distribute': RatioLab,
  'proportion-basic': RatioLab,
  'solve-proportion': RatioLab,
  'golden-ratio': RatioLab,
  'circle-feature': CircleLab,
  sector: CircleLab,
  circumference: CircleLab,
  'circle-area': CircleLab,
  annulus: CircleLab,
  'circle-composite': CircleLab,
  'scale-shape': ScaleLab,
  'map-scale': ScaleLab,
  coordinate: PositionLab,
  direction: PositionLab,
  // 练习题 Lab（每个单元一个组件，内部按 kind 分支）
  'ex-c1-div11-cycle': ExerciseC1Lab,
  'ex-c1-pgram-area': ExerciseC1Lab,
  'ex-c2-overlap-club': ExerciseC2Lab,
  'ex-c2-egg-crate': ExerciseC2Lab,
  'ex-c3-div-to-mul': ExerciseC3Lab,
  'ex-c3-frac-split': ExerciseC3Lab,
  'ex-c4-cube-ratio': ExerciseC4Lab,
  'ex-c4-football-ratio': ExerciseC4Lab,
  'ex-c5-wheel-roll': ExerciseC5Lab,
  'ex-c5-circle-packing': ExerciseC5Lab,
  'ex-c6-scale-area': ExerciseC6Lab,
  'ex-c6-two-maps': ExerciseC6Lab,
  'ex-c7-route-path': ExerciseC7Lab,
  'ex-c7-observer-point': ExerciseC7Lab,
}

export function labComponentFor(kind: LabKind): Component {
  return LAB_COMPONENTS[kind]
}
