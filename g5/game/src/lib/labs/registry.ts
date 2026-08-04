import type { Component } from 'vue'
import type { LabKind } from '@data/schema/lab'
import MotionLab from '@/components/labs/MotionLab.vue'
import AreaLab from '@/components/labs/AreaLab.vue'
import MeasureLab from '@/components/labs/MeasureLab.vue'
import DecimalLab from '@/components/labs/DecimalLab.vue'
import ChanceLab from '@/components/labs/ChanceLab.vue'
import NumberLab from '@/components/labs/NumberLab.vue'
import FormulaLab from '@/components/labs/FormulaLab.vue'
import PinboardLab from '@/components/labs/PinboardLab.vue'
import Views3DLab from '@/components/labs/Views3DLab.vue'

/** Lab kind → 组件映射 */
export const LAB_COMPONENTS: Record<LabKind, Component> = {
  translate: MotionLab,
  rotate: MotionLab,
  axis: MotionLab,
  area: AreaLab,
  hectare: MeasureLab,
  composite: MeasureLab,
  'decimal-mul': DecimalLab,
  'decimal-div': DecimalLab,
  'decimal-point': DecimalLab,
  spinner: ChanceLab,
  marble: ChanceLab,
  factors: NumberLab,
  multiples: NumberLab,
  prime: NumberLab,
  gcdlcm: NumberLab,
  frog: FormulaLab,
  square: FormulaLab,
  speed: FormulaLab,
  pinboard: PinboardLab,
  views3d: Views3DLab,
}

export function labComponentFor(kind: LabKind): Component {
  return LAB_COMPONENTS[kind]
}
