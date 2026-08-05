import type { Component } from 'vue'
import type { LabKind } from '@data/schema/lab'
import MixCalcLab from '@/components/labs/MixCalcLab.vue'
import TimeLab from '@/components/labs/TimeLab.vue'
import MulLab from '@/components/labs/MulLab.vue'
import WeightLab from '@/components/labs/WeightLab.vue'
import TallyLab from '@/components/labs/TallyLab.vue'
import LengthLab from '@/components/labs/LengthLab.vue'
import MotionLab from '@/components/labs/MotionLab.vue'
import DivLab from '@/components/labs/DivLab.vue'
import IntervalLab from '@/components/labs/IntervalLab.vue'
import SegmentLab from '@/components/labs/SegmentLab.vue'
import ViewsLab from '@/components/labs/ViewsLab.vue'
import Views3DLab from '@/components/labs/Views3DLab.vue'
import TimesLab from '@/components/labs/TimesLab.vue'

/** Lab kind → 组件映射 */
export const LAB_COMPONENTS: Record<LabKind, Component> = {
  'mix-calc': MixCalcLab,
  bracket: MixCalcLab,
  time24: TimeLab,
  elapsed: TimeLab,
  'mul-oral': MulLab,
  'mul-pen': MulLab,
  'mul-zero': MulLab,
  weight: WeightLab,
  equivalent: WeightLab,
  tally: TallyLab,
  stat: TallyLab,
  'length-convert': LengthLab,
  translate: MotionLab,
  rotate: MotionLab,
  axis: MotionLab,
  'div-oral': DivLab,
  'div-pen': DivLab,
  'div-zero': DivLab,
  remainder: DivLab,
  interval: IntervalLab,
  segment: SegmentLab,
  views: ViewsLab,
  views3d: Views3DLab,
  times: TimesLab,
  'times-mul': TimesLab,
  'times-div': TimesLab,
}

export function labComponentFor(kind: LabKind): Component {
  return LAB_COMPONENTS[kind]
}
