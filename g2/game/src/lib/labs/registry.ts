import type { Component } from 'vue'
import type { LabKind } from '@data/schema/lab'
import MultLab from '@/components/labs/MultLab.vue'
import DivideLab from '@/components/labs/DivideLab.vue'
import CalcLab from '@/components/labs/CalcLab.vue'
import TangramLab from '@/components/labs/TangramLab.vue'
import DirectionLab from '@/components/labs/DirectionLab.vue'
import NumberLab from '@/components/labs/NumberLab.vue'
import TwodigitLab from '@/components/labs/TwodigitLab.vue'
import MoneyLab from '@/components/labs/MoneyLab.vue'

/** Lab kind → 组件映射 */
export const LAB_COMPONENTS: Record<LabKind, Component> = {
  groups: MultLab,
  'mult-table': MultLab,
  'divide-share': DivideLab,
  'divide-group': DivideLab,
  quotient: DivideLab,
  'table-calc': CalcLab,
  tangram: TangramLab,
  direction: DirectionLab,
  'place-value': NumberLab,
  compare: NumberLab,
  abacus: NumberLab,
  'twodigit-add': TwodigitLab,
  'twodigit-sub': TwodigitLab,
  money: MoneyLab,
  'money-calc': MoneyLab,
  remainder: CalcLab,
  'remainder-rule': CalcLab,
}

export function labComponentFor(kind: LabKind): Component {
  return LAB_COMPONENTS[kind]
}
