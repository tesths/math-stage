import { allLabs, byChapter } from '../index'
import type { LabDef } from './lab'

/** 运行时校验：id 唯一、参数合法、公式存在 */
export function validateLabs(): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  for (const lab of allLabs) {
    if (seen.has(lab.id)) errors.push(`重复 id: ${lab.id}`)
    seen.add(lab.id)
    if (!lab.title) errors.push(`${lab.id}: 缺 title`)
    if (!lab.prompt) errors.push(`${lab.id}: 缺 prompt`)
    if (!lab.formula) errors.push(`${lab.id}: 缺 formula`)
    if (lab.params.length === 0) errors.push(`${lab.id}: 无可调参数`)
    const keys = new Set<string>()
    for (const p of lab.params) {
      if (keys.has(p.key)) errors.push(`${lab.id}: 参数 ${p.key} 重复`)
      keys.add(p.key)
      if (p.min > p.max) errors.push(`${lab.id}: 参数 ${p.key} min>max`)
      if (p.default < p.min || p.default > p.max) {
        errors.push(`${lab.id}: 参数 ${p.key} 默认值超出范围`)
      }
      // 离散选项（如平移方向、观察方向、多边形形状）：值唯一、在范围内、默认值必须是其中一个
      if (p.options) {
        if (p.options.length === 0) errors.push(`${lab.id}: 参数 ${p.key} 的 options 为空`)
        const values = new Set<number>()
        for (const o of p.options) {
          if (!o.label) errors.push(`${lab.id}: 参数 ${p.key} 选项缺 label`)
          if (values.has(o.value)) errors.push(`${lab.id}: 参数 ${p.key} 选项值重复 ${o.value}`)
          values.add(o.value)
          if (o.value < p.min || o.value > p.max) {
            errors.push(`${lab.id}: 参数 ${p.key} 选项 ${o.label} 超出范围`)
          }
        }
        if (!values.has(p.default)) {
          errors.push(`${lab.id}: 参数 ${p.key} 默认值不在选项中`)
        }
      }
    }
    const chapterOk = byChapter.some((c) => c.meta.id === lab.chapter)
    if (!chapterOk) errors.push(`${lab.id}: 未知单元 ${lab.chapter}`)
  }
  return errors
}

export function assertLabsValid(): void {
  const errors = validateLabs()
  if (errors.length) throw new Error(`Lab 数据校验失败:\n${errors.join('\n')}`)
}

export type { LabDef }
