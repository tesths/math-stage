import type { ChapterMeta, LabDef } from './schema/lab'
import { chapters } from './chapters/meta'
import { c1Labs } from './chapters/c1'
import { c2Labs } from './chapters/c2'
import { c3Labs } from './chapters/c3'
import { c4Labs } from './chapters/c4'
import { c5Labs } from './chapters/c5'
import { c6Labs } from './chapters/c6'
import { c7Labs } from './chapters/c7'
import { c1Exercises } from './chapters/c1-exercises'
import { c2Exercises } from './chapters/c2-exercises'
import { c3Exercises } from './chapters/c3-exercises'
import { c4Exercises } from './chapters/c4-exercises'
import { c5Exercises } from './chapters/c5-exercises'
import { c6Exercises } from './chapters/c6-exercises'
import { c7Exercises } from './chapters/c7-exercises'

export { chapters } from './chapters/meta'
export type { ChapterMeta, LabDef, LabParam, LabKind, ParamValues, SourceKind } from './schema/lab'

/** 全部 Lab（按单元顺序：例题在前，练习题在后） */
export const allLabs: LabDef[] = [
  ...c1Labs,
  ...c1Exercises,
  ...c2Labs,
  ...c2Exercises,
  ...c3Labs,
  ...c3Exercises,
  ...c4Labs,
  ...c4Exercises,
  ...c5Labs,
  ...c5Exercises,
  ...c6Labs,
  ...c6Exercises,
  ...c7Labs,
  ...c7Exercises,
]

export interface ChapterLabs {
  meta: ChapterMeta
  labs: LabDef[]
}

/** 按单元聚合（例题 + 练习题） */
export const byChapter: ChapterLabs[] = [
  { meta: chapters[0]!, labs: [...c1Labs, ...c1Exercises] },
  { meta: chapters[1]!, labs: [...c2Labs, ...c2Exercises] },
  { meta: chapters[2]!, labs: [...c3Labs, ...c3Exercises] },
  { meta: chapters[3]!, labs: [...c4Labs, ...c4Exercises] },
  { meta: chapters[4]!, labs: [...c5Labs, ...c5Exercises] },
  { meta: chapters[5]!, labs: [...c6Labs, ...c6Exercises] },
  { meta: chapters[6]!, labs: [...c7Labs, ...c7Exercises] },
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
