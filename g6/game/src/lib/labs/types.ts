/**
 * Lab 求值结果的公共类型。
 *
 * 拆出独立文件的原因：`compute.ts` 需要调用练习题计算模块
 * （`lib/labs/exercises/*`），而这些模块又需要 `LabResult` 类型。
 * 放在这里可避免 `compute.ts ⇄ exercises/*` 的循环依赖。
 */
export interface LabStep {
  expr: string
  result: string
}

export interface LabResult {
  /** 主结果（数字） */
  value: number
  /** 结果文本（带单位） */
  text: string
  /** 分步计算过程 */
  steps: LabStep[]
  /** 结论语 */
  conclusion: string
}
