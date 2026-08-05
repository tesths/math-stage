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
