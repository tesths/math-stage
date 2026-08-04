import type { ChapterMeta, GameQuestion } from './schema/example'
import { chapters } from './chapters/meta'
import { c1Examples } from './chapters/c1'
import { c2Examples } from './chapters/c2'
import { c3Examples } from './chapters/c3'
import { c4Examples } from './chapters/c4'
import { c5Examples } from './chapters/c5'
import { c6Examples } from './chapters/c6'
import { c7Examples } from './chapters/c7'
import { c8Examples } from './chapters/c8'
import { c9Examples } from './chapters/c9'

export { chapters } from './chapters/meta'
export type { ChapterMeta, GameQuestion } from './schema/example'

/** 全部例题（按章节顺序） */
export const allExamples: GameQuestion[] = [
  ...c1Examples,
  ...c2Examples,
  ...c3Examples,
  ...c4Examples,
  ...c5Examples,
  ...c6Examples,
  ...c7Examples,
  ...c8Examples,
  ...c9Examples,
]

export interface ChapterExamples {
  meta: ChapterMeta
  examples: GameQuestion[]
}

/** 按单元聚合 */
export const byChapter: ChapterExamples[] = [
  { meta: chapters[0]!, examples: c1Examples },
  { meta: chapters[1]!, examples: c2Examples },
  { meta: chapters[2]!, examples: c3Examples },
  { meta: chapters[3]!, examples: c4Examples },
  { meta: chapters[4]!, examples: c5Examples },
  { meta: chapters[5]!, examples: c6Examples },
  { meta: chapters[6]!, examples: c7Examples },
  { meta: chapters[7]!, examples: c8Examples },
  { meta: chapters[8]!, examples: c9Examples },
]

export function findById(id: string): GameQuestion | undefined {
  return allExamples.find((e) => e.id === id)
}

export function examplesOfChapter(chapter: ChapterMeta['id']): GameQuestion[] {
  return allExamples.filter((e) => e.chapter === chapter)
}
