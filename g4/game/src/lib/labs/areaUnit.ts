import type { ParamValues } from '@data/schema/lab'

const AREA_UNIT_PAIRS = [
  { bigUnit: '平方分米', smallUnit: '平方厘米', bigSideLabel: '1分米', smallSideLabel: '1厘米' },
  { bigUnit: '平方米', smallUnit: '平方分米', bigSideLabel: '1米', smallSideLabel: '1分米' },
] as const

export interface AreaUnitConversion {
  count: number
  pair: number
  dir: number
  isBigToSmall: boolean
  bigUnit: string
  smallUnit: string
  bigSideLabel: string
  smallSideLabel: string
  fromValue: number
  result: number
  fromUnit: string
  toUnit: string
  relationText: string
  operationSymbol: '×' | '÷'
  operationText: string
  actionText: string
}

export function deriveAreaUnitConversion(values: ParamValues): AreaUnitConversion {
  const count = Math.max(1, Math.round(values.v ?? 3))
  const pair = Math.round(values.pair ?? 0) === 1 ? 1 : 0
  const dir = Math.round(values.dir ?? 0) === 1 ? 1 : 0
  const isBigToSmall = dir === 0
  const unitPair = AREA_UNIT_PAIRS[pair]!
  const fromValue = isBigToSmall ? count : count * 100
  const result = isBigToSmall ? count * 100 : count
  const fromUnit = isBigToSmall ? unitPair.bigUnit : unitPair.smallUnit
  const toUnit = isBigToSmall ? unitPair.smallUnit : unitPair.bigUnit
  const relationText = `1 ${unitPair.bigUnit} = 100 ${unitPair.smallUnit}`
  const operationSymbol = isBigToSmall ? '×' : '÷'
  const operationText = isBigToSmall ? '大单位化小单位：乘 100' : '小单位化大单位：除以 100'
  const actionText = isBigToSmall
    ? `1 ${unitPair.bigUnit} 拆成 10 × 10 个 1 ${unitPair.smallUnit}，所以乘 100`
    : `每 100 个 1 ${unitPair.smallUnit} 合成 1 ${unitPair.bigUnit}，所以除以 100`

  return {
    count,
    pair,
    dir,
    isBigToSmall,
    bigUnit: unitPair.bigUnit,
    smallUnit: unitPair.smallUnit,
    bigSideLabel: unitPair.bigSideLabel,
    smallSideLabel: unitPair.smallSideLabel,
    fromValue,
    result,
    fromUnit,
    toUnit,
    relationText,
    operationSymbol,
    operationText,
    actionText,
  }
}
