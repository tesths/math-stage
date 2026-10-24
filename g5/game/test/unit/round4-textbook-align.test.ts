import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { allLabs, chapters, findLabById } from '@data'

/**
 * 第 4 轮（agent C 复核）：把「教材对齐」变成可失败断言。
 *
 * 复核发现两处页码/情境与 OCR 原文对不上（不是数学错，但学生按页码翻书会翻空）：
 * - `g5-c2-stats-table` 写 page 17，但课本第 17 页是「城乡居民人均住房面积」；
 *   民族乐器兴趣小组的单式→复式统计表在 **第 18~19 页**。
 * - `g5-c5-marble-bag` 写 page 68，但第 68 页是「抛硬币/抛瓶盖」；
 *   「从袋中任意摸出一个球…一定是红球 / 可能是红球也可能是黄球」在 **第 66 页**。
 */

// vitest 的 root 是仓库根（npm workspaces），但直接 cd 进 game 跑时 cwd 又是 g5/game —— 两个都试
const OCR_PATH = [
  path.resolve(process.cwd(), '../ocr/upper/book/上册_正文.md'), // cwd = g5/game
  path.resolve(process.cwd(), 'g5/ocr/upper/book/上册_正文.md'), // cwd = 仓库根
  path.resolve(process.cwd(), 'ocr/upper/book/上册_正文.md'),
].find((p) => existsSync(p))!

function ocrPage(page: number): string {
  const md = readFileSync(OCR_PATH, 'utf8')
  const parts = md.split(/^## 书页 (\d+)\s*（/m)
  for (let i = 1; i < parts.length; i += 2) {
    if (Number(parts[i]) === page) return parts[i + 1] ?? ''
  }
  return ''
}

describe('课本页号与情境必须能在 OCR 原文里找到', () => {
  it('g5-c2-stats-table：page 18 的 OCR 里确实有「兴趣小组」的复式统计表', () => {
    const lab = findLabById('g5-c2-stats-table')!
    expect(lab.page).toBe(18)
    const text = ocrPage(lab.page)
    expect(text).toContain('兴趣小组')
    expect(text).toContain('复式统计表')
    // 情境用词与课本一致（古筝/琵琶/笛子/二胡）
    expect(lab.prompt).toContain('古筝')
    expect(lab.params.map((p) => p.label).join(' ')).toContain('古筝')
  })

  it('g5-c5-marble-bag：page 66 的 OCR 里确实有「任意摸出一个球」', () => {
    const lab = findLabById('g5-c5-marble-bag')!
    expect(lab.page).toBe(66)
    const text = ocrPage(lab.page)
    expect(text).toContain('摸出一个球')
    expect(text).toMatch(/一定.*红球/)
  })

  it('书末「探索规律·钉子板上的多边形」归七单元末（110–111 页），不再挂在因数与倍数下', () => {
    const lab = findLabById('g5-pinboard-area')!
    const meta = chapters.find((c) => c.id === lab.chapter)!
    expect(lab.page).toBe(110)
    expect(meta.title).toContain('字母')
    expect(lab.page).toBeGreaterThanOrEqual(meta.pageStart)
    expect(lab.page).toBeLessThanOrEqual(meta.pageEnd)
    // 上一个 Lab 必须是七单元末页（95–109 区间），不是因数与倍数
    const idx = allLabs.findIndex((l) => l.id === lab.id)
    expect(allLabs[idx - 1]!.page).toBeLessThanOrEqual(109)
    // 题面要写清这是哪一页的什么活动，不能只靠页码
    expect(lab.title).toContain('110')
    expect(lab.prompt).toContain('探索规律')
  })

  it('全册 Lab 的 page 都落在所属单元的页码范围里（含书末探索活动）', () => {
    for (const lab of allLabs) {
      const meta = chapters.find((c) => c.id === lab.chapter)!
      expect(
        lab.page,
        `${lab.id} 的页码 ${lab.page} 不在 ${lab.chapter} 的 ${meta.pageStart}-${meta.pageEnd}`,
      ).toBeGreaterThanOrEqual(meta.pageStart)
      expect(lab.page).toBeLessThanOrEqual(meta.pageEnd)
    }
  })
})
