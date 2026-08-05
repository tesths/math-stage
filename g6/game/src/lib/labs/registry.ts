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
}

export function labComponentFor(kind: LabKind): Component {
  return LAB_COMPONENTS[kind]
}
