import type { ChapterMeta, LabDef } from './schema/lab'
import { chapters } from './chapters/meta'
import { c1Labs } from './chapters/c1'
import { c3Labs } from './chapters/c3'
import { c4Labs } from './chapters/c4'
import { c5Labs } from './chapters/c5'
import { c6Labs } from './chapters/c6'
import { c7Labs } from './chapters/c7'
import { c8Labs, pinboardLabs } from './chapters/c8'

export { chapters } from './chapters/meta'
export type { ChapterMeta, LabDef, LabParam, LabKind, ParamValues, SourceKind } from './schema/lab'

/** 全部 Lab（按单元顺序；探索规律归入 c6 单元尾部） */
export const allLabs: LabDef[] = [
  ...c1Labs,
  ...c3Labs,
  ...c4Labs,
  ...c5Labs,
  ...c6Labs,
  ...pinboardLabs,
  ...c7Labs,
  ...c8Labs,
]

export interface ChapterLabs {
  meta: ChapterMeta
  labs: LabDef[]
}

/** 按单元聚合 */
export const byChapter: ChapterLabs[] = [
  { meta: chapters[0]!, labs: c1Labs },
  { meta: chapters[1]!, labs: [] },
  { meta: chapters[2]!, labs: c3Labs },
  { meta: chapters[3]!, labs: c4Labs },
  { meta: chapters[4]!, labs: c5Labs },
  { meta: chapters[5]!, labs: [...c6Labs, ...pinboardLabs] },
  { meta: chapters[6]!, labs: c7Labs },
  { meta: chapters[7]!, labs: c8Labs },
]

export function findLabById(id: string): LabDef | undefined {
  return allLabs.find((l) => l.id === id)
}

export function labsOfChapter(chapter: ChapterMeta['id']): LabDef[] {
  return allLabs.filter((l) => l.chapter === chapter)
}

/** 某单元首个 Lab id（页面跳转用） */
export function firstLabOf(chapter: ChapterMeta['id']): string | undefined {
  return labsOfChapter(chapter)[0]?.id
}

export const totalLabs = allLabs.length
