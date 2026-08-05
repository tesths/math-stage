import type { Component } from 'vue'
import type { LabKind } from '@data/schema/lab'
import DivLab from '@/components/labs/DivLab.vue'
import ShapeLab from '@/components/labs/ShapeLab.vue'
import AreaUnitLab from '@/components/labs/AreaUnitLab.vue'
import PuzzleLab from '@/components/labs/PuzzleLab.vue'
import QuantityLab from '@/components/labs/QuantityLab.vue'
import MixCalcLab from '@/components/labs/MixCalcLab.vue'
import SegmentLab from '@/components/labs/SegmentLab.vue'
import NumberLab from '@/components/labs/NumberLab.vue'
import MeasureLab from '@/components/labs/MeasureLab.vue'
import BigNumLab from '@/components/labs/BigNumLab.vue'

/** Lab kind → 组件映射 */
export const LAB_COMPONENTS: Record<LabKind, Component> = {
  'div-oral': DivLab,
  'div-try': DivLab,
  'div-pen': DivLab,
  'div-route': DivLab,
  'peri-rect': ShapeLab,
  'peri-square': ShapeLab,
  'area-grid': ShapeLab,
  'area-rect': ShapeLab,
  'area-square': ShapeLab,
  'area-unit': AreaUnitLab,
  'peri-area-change': PuzzleLab,
  'mul-meaning': QuantityLab,
  'mul-total': QuantityLab,
  'mul-distance': QuantityLab,
  'mul-solve': QuantityLab,
  'travel-plan': QuantityLab,
  'mix-three': MixCalcLab,
  'mix-bracket': MixCalcLab,
  'mix-segment': SegmentLab,
  'num-count': NumberLab,
  'num-place': NumberLab,
  'num-multidigit': NumberLab,
  'num-approx': NumberLab,
  'num-idcode': NumberLab,
  'measure-story': MeasureLab,
  'big-mul': BigNumLab,
  'big-calc': BigNumLab,
  'big-1yi': BigNumLab,
}

export function labComponentFor(kind: LabKind): Component {
  return LAB_COMPONENTS[kind]
}
