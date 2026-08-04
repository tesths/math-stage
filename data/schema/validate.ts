/**
 * 例题数据运行时校验器
 * - 结构校验：config 与 type 匹配
 * - 语义校验：答案与题目自洽（如 分与合=总数、减法非负、十位个位正确）
 */
import type { GameQuestion, ChapterMeta, ChapterId, GameConfig } from './example'

export interface ValidationResult {
  ok: boolean
  errors: string[]
}

const SHAPE_NAMES = ['长方体', '正方体', '圆柱', '球'] as const
const POSITION_WORDS = ['上', '下', '左', '右', '前', '后'] as const
const OP_WORDS = ['>', '<', '='] as const
const CHAPTER_IDS: ChapterId[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']
const SOURCE_KINDS = ['例题', '试一试', '想想做做', '练习', '活动'] as const

function range(n: number, min: number, max: number): boolean {
  return Number.isInteger(n) && n >= min && n <= max
}

function uniqueArr<T>(arr: T[]): boolean {
  return new Set(arr).size === arr.length
}

function strLen(str: string): number {
  return Array.from(str).length
}

function validateCount(cfg: Extract<GameConfig, { type: 'count' }>): string[] {
  const errs: string[] = []
  if (cfg.answer === 0) {
    if (strLen(cfg.emoji) !== 0) errs.push('count: answer为0时 emoji 应为空')
  } else {
    if (strLen(cfg.emoji) < 1) errs.push('count: emoji 至少1个')
  }
  if (cfg.answer !== strLen(cfg.emoji))
    errs.push(`count: answer=${cfg.answer} 与物品数=${strLen(cfg.emoji)} 不一致`)
  if (!range(cfg.answer, 0, 19)) errs.push('count: answer 超出 0~19')
  if (cfg.options.length < 3) errs.push('count: options 至少3个')
  if (!uniqueArr(cfg.options)) errs.push('count: options 有重复')
  if (!cfg.options.includes(cfg.answer)) errs.push('count: options 未包含正确答案')
  return errs
}

function validateWrite(cfg: Extract<GameConfig, { type: 'write' }>): string[] {
  const errs: string[] = []
  if (!range(cfg.number, 0, 19)) errs.push('write: number 超出 0~19')
  if (cfg.answer !== cfg.number) errs.push('write: answer 与 number 不一致')
  if (cfg.options.length < 3) errs.push('write: options 至少3个')
  if (!uniqueArr(cfg.options)) errs.push('write: options 有重复')
  if (!cfg.options.includes(cfg.answer)) errs.push('write: options 未包含正确答案')
  return errs
}

function validateSplit(cfg: Extract<GameConfig, { type: 'split' }>): string[] {
  const errs: string[] = []
  if (!range(cfg.total, 2, 19)) errs.push('split: total 超出 2~19')
  if (!range(cfg.given, 0, cfg.total)) errs.push('split: given 不在 0~total')
  if (cfg.answer !== cfg.total - cfg.given) errs.push('split: answer 应等于 total-given')
  return errs
}

function validateAddSub(cfg: Extract<GameConfig, { type: 'addsub' }>): string[] {
  const errs: string[] = []
  if (!range(cfg.a, 0, 19) || !range(cfg.b, 0, 19)) errs.push('addsub: a/b 超出 0~19')
  if (strLen(cfg.emoji) < 1) errs.push('addsub: emoji 至少1个')
  const expect = cfg.op === '+' ? cfg.a + cfg.b : cfg.a - cfg.b
  if (cfg.op === '-' && expect < 0) errs.push('addsub: 减法结果不能为负')
  if (cfg.answer !== expect) errs.push(`addsub: answer=${cfg.answer} 应等于 ${expect}`)
  if (cfg.options.length < 3) errs.push('addsub: options 至少3个')
  if (!uniqueArr(cfg.options)) errs.push('addsub: options 有重复')
  if (!cfg.options.includes(cfg.answer)) errs.push('addsub: options 未包含正确答案')
  return errs
}

function validateCompare(cfg: Extract<GameConfig, { type: 'compare' }>): string[] {
  const errs: string[] = []
  if (!range(cfg.a, 0, 19) || !range(cfg.b, 0, 19)) errs.push('compare: a/b 超出 0~19')
  if (!OP_WORDS.includes(cfg.answer)) errs.push('compare: answer 不是 >/< /=')
  const expect: '>' | '<' | '=' =
    cfg.a > cfg.b ? '>' : cfg.a < cfg.b ? '<' : '='
  if (cfg.answer !== expect) errs.push('compare: answer 与大小关系不一致')
  return errs
}

function validatePosition(cfg: Extract<GameConfig, { type: 'position' }>): string[] {
  const errs: string[] = []
  if (cfg.items.length < 2) errs.push('position: items 至少2个')
  if (!cfg.items.includes(cfg.target)) errs.push('position: target 不在 items 中')
  if (!POSITION_WORDS.includes(cfg.position as (typeof POSITION_WORDS)[number]))
    errs.push('position: 方位词不合法')
  if (!cfg.items.includes(cfg.answer)) errs.push('position: answer 不在 items 中')
  if (cfg.answer === cfg.target) errs.push('position: answer 不能等于 target')
  const i = cfg.items.indexOf(cfg.target)
  if (i === -1) return errs
  const dir = ['左', '上', '前'].includes(cfg.position) ? -1 : 1
  const expect = cfg.items[i + dir]
  if (expect === undefined) errs.push('position: target 在该方位上没有物品（越界）')
  else if (cfg.answer !== expect) errs.push('position: answer 与方位关系不一致')
  return errs
}

function validateOrdinal(cfg: Extract<GameConfig, { type: 'ordinal' }>): string[] {
  const errs: string[] = []
  if (cfg.items.length < 2) errs.push('ordinal: items 至少2个')
  const idx = cfg.items.indexOf(cfg.target)
  if (idx === -1) errs.push('ordinal: target 不在 items 中')
  else if (cfg.answer !== idx + 1) errs.push('ordinal: answer 应为 target 的序数位置')
  return errs
}

function validateShape3D(cfg: Extract<GameConfig, { type: 'shape3d' }>): string[] {
  const errs: string[] = []
  if (!SHAPE_NAMES.includes(cfg.shape as (typeof SHAPE_NAMES)[number]))
    errs.push('shape3d: shape 不在四种立体图形中')
  if (cfg.options.length < 4) errs.push('shape3d: options 至少4个')
  if (!uniqueArr(cfg.options)) errs.push('shape3d: options 有重复')
  if (!cfg.options.includes(cfg.answer)) errs.push('shape3d: options 未包含正确答案')
  if (cfg.answer !== cfg.shape) errs.push('shape3d: answer 与 shape 不一致')
  return errs
}

function validateNumberLine(cfg: Extract<GameConfig, { type: 'numberline' }>): string[] {
  const errs: string[] = []
  if (!range(cfg.value, 11, 19)) errs.push('numberline: value 超出 11~19')
  if (cfg.answer !== cfg.value) errs.push('numberline: answer 与 value 不一致')
  if (cfg.options.length < 3) errs.push('numberline: options 至少3个')
  if (!uniqueArr(cfg.options)) errs.push('numberline: options 有重复')
  if (!cfg.options.includes(cfg.answer)) errs.push('numberline: options 未包含正确答案')
  return errs
}

function validateSequence(cfg: Extract<GameConfig, { type: 'sequence' }>): string[] {
  const errs: string[] = []
  if (!range(cfg.from, 0, 19) || !range(cfg.to, 0, 19)) errs.push('sequence: from/to 超出 0~19')
  if (cfg.from >= cfg.to) errs.push('sequence: from 应小于 to')
  if (cfg.to - cfg.from > 12) errs.push('sequence: 长度最多12')
  const expect: number[] = []
  for (let i = cfg.from; i <= cfg.to; i++) expect.push(i)
  if (JSON.stringify(cfg.answer) !== JSON.stringify(expect))
    errs.push('sequence: answer 与 from~to 范围不一致')
  return errs
}

function validateTen(cfg: Extract<GameConfig, { type: 'ten' }>): string[] {
  const errs: string[] = []
  if (!range(cfg.target, 5, 20)) errs.push('ten: target 超出 5~20')
  if (cfg.cards.length < 4) errs.push('ten: cards 至少4张')
  if (!uniqueArr(cfg.cards)) errs.push('ten: cards 有重复')
  for (const c of cfg.cards) if (!range(c, 1, 9)) errs.push('ten: 卡片值超出 1~9')
  if (cfg.answer.length < 2 || cfg.answer.length > 3) errs.push('ten: 选 2 或 3 张')
  const sum = cfg.answer.reduce((s, v) => s + v, 0)
  if (sum !== cfg.target) errs.push('ten: 所选卡片之和不等于 target')
  for (const v of cfg.answer) if (!cfg.cards.includes(v)) errs.push('ten: 答案卡片不在 cards 中')
  if (!uniqueArr(cfg.answer)) errs.push('ten: answer 有重复')
  return errs
}

export function validateQuestion(q: GameQuestion): string[] {
  const errs: string[] = []
  if (!q.id || !/^[a-z0-9-]+$/.test(q.id)) errs.push('id 非法（须小写字母数字连字符）')
  if (!CHAPTER_IDS.includes(q.chapter)) errs.push(`chapter 非法: ${q.chapter}`)
  if (!range(q.page, 1, 105)) errs.push('page 超出 1~105')
  if (!SOURCE_KINDS.includes(q.source)) errs.push(`source 非法: ${q.source}`)
  if (!q.title || !q.prompt) errs.push('title/prompt 不能为空')
  const cfg = q.config
  switch (cfg.type) {
    case 'count':
      errs.push(...validateCount(cfg))
      break
    case 'write':
      errs.push(...validateWrite(cfg))
      break
    case 'split':
      errs.push(...validateSplit(cfg))
      break
    case 'addsub':
      errs.push(...validateAddSub(cfg))
      break
    case 'compare':
      errs.push(...validateCompare(cfg))
      break
    case 'position':
      errs.push(...validatePosition(cfg))
      break
    case 'ordinal':
      errs.push(...validateOrdinal(cfg))
      break
    case 'shape3d':
      errs.push(...validateShape3D(cfg))
      break
    case 'numberline':
      errs.push(...validateNumberLine(cfg))
      break
    case 'sequence':
      errs.push(...validateSequence(cfg))
      break
    case 'ten':
      errs.push(...validateTen(cfg))
      break
    default:
      errs.push(`未知题型: ${JSON.stringify(cfg)}`)
  }
  return errs
}

export function validateAll(questions: GameQuestion[]): ValidationResult {
  const errors: string[] = []
  const seen = new Set<string>()
  for (const q of questions) {
    if (seen.has(q.id)) errors.push(`id 重复: ${q.id}`)
    seen.add(q.id)
    for (const e of validateQuestion(q)) errors.push(`${q.id}: ${e}`)
  }
  return { ok: errors.length === 0, errors }
}

export function validateChapters(chapters: ChapterMeta[]): ValidationResult {
  const errors: string[] = []
  const seen = new Set<string>()
  for (const c of chapters) {
    if (seen.has(c.id)) errors.push(`chapter 重复: ${c.id}`)
    seen.add(c.id)
    if (c.pageStart < 1 || c.pageEnd < c.pageStart) errors.push(`${c.id}: 页码区间非法`)
    if (!c.title || !c.summary) errors.push(`${c.id}: title/summary 为空`)
  }
  return { ok: errors.length === 0, errors }
}
