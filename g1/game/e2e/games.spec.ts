import { test, expect } from '@playwright/test'

/** 20 个游戏：slug → 根元素 → 可交互元素 */
const GAMES: Array<[string, string, string]> = [
  ['memory', '.memory-game', '.memory-card'],
  ['friend', '.friend-game', '.card'],
  ['gofish', '.gofish-game', '.fish'],
  ['balance', '.balance-game', '.answer-btn'],
  ['guess', '.guess-game', '.guess-btn'],
  ['boardrace', '.boardrace-game', '.die-btn'],
  ['frogjump', '.frogjump-game', '.answer-btn'],
  ['maze', '.maze-game', '.maze-cell'],
  ['rocket', '.rocket-game', '.cd-btn'],
  ['pattern', '.pattern-game', '.answer-btn'],
  ['relay', '.relay-game', '.answer-btn'],
  ['puzzle', '.puzzle-game', '.puzzle-tile'],
  ['whack', '.whack-game', '.hole'],
  ['codebreak', '.codebreak-game', '.answer-btn'],
  ['picking', '.picking-game', '.answer-btn'],
  ['shaperiddle', '.shaperiddle-game', '.shape-opt'],
  ['shapebuild', '.shapebuild-game', '.pool-btn'],
  ['warbattle', '.warbattle-game', '.bcard'],
  ['sudoku', '.sudoku-game', '.cell'],
  ['matchstick', '.matchstick-game', '.match-opt'],
]

test('游戏专区首页渲染 20 个游戏入口', async ({ page }) => {
  await page.goto('/games')
  await expect(page.getByRole('heading', { name: '游戏专区' })).toBeVisible()
  await expect(page.locator('.arcade-card')).toHaveCount(20)
})

test('游戏专区每个游戏卡片标注适用单元', async ({ page }) => {
  await page.goto('/games')
  const badges = page.locator('.game-unit-badge')
  await expect(badges.first()).toBeVisible()
  expect(await badges.count()).toBeGreaterThanOrEqual(20)
  const memoryCard = page.locator('.arcade-card', { hasText: '记忆翻牌' })
  await expect(memoryCard).toContainText('第1单元')
  await expect(memoryCard).toContainText('第6单元')
})

for (const [slug, rootSel, intSel] of GAMES) {
  test(`游戏页 /games/${slug} 渲染并可交互`, async ({ page }) => {
    await page.goto(`/games/${slug}`)
    await expect(page.locator(rootSel)).toBeVisible()
    const interactive = page.locator(intSel)
    await expect(interactive.first()).toBeVisible()
    expect(await interactive.count()).toBeGreaterThan(0)
    await expect(page.locator('.game-slot')).toBeVisible()
  })
}

test('BoardRace：掷骰子出现点数并前进', async ({ page }) => {
  await page.goto('/games/boardrace')
  await expect(page.locator('.die-btn')).toBeVisible()
  await page.locator('.die-btn').click()
  await expect(
    page.locator('.die-result').or(page.locator('.race-q')).or(page.locator('.finish-card'))
  ).toBeVisible()
})

test('Guess：点击猜数出现范围或提示', async ({ page }) => {
  await page.goto('/games/guess')
  const btn = page.locator('.guess-btn').first()
  await expect(btn).toBeVisible()
  await btn.click()
  await expect(page.locator('.guess-range').first()).toBeVisible()
  await expect(page.locator('.guess-btn, .finish-card').first()).toBeVisible()
})

test('Memory：翻两张牌可完成一次配对', async ({ page }) => {
  await page.goto('/games/memory')
  const cards = page.locator('.memory-card')
  await expect(cards.first()).toBeVisible()
  const n = await cards.count()
  expect(n).toBeGreaterThanOrEqual(8)
  // 前两张如果成对则继续翻第三张凑出非配对
  await cards.nth(0).click()
  await cards.nth(1).click()
  await page.waitForTimeout(200)
  const matched = await page.locator('.memory-card.matched').count()
  if (matched === 2) {
    await cards.nth(2).click()
    await cards.nth(3).click()
    await page.waitForTimeout(200)
  }
  expect(await page.locator('.memory-feedback, .memory-card.flipped, .memory-card.matched').count()).toBeGreaterThan(0)
})

test('ShapeBuild：点零件出现已选计数', async ({ page }) => {
  await page.goto('/games/shapebuild')
  const pool = page.locator('.pool-btn')
  await expect(pool.first()).toBeVisible()
  await pool.first().click()
  await expect(page.locator('.pool-count').first()).toBeVisible()
})

test('Sudoku：填一个数进入棋盘', async ({ page }) => {
  await page.goto('/games/sudoku')
  const cells = page.locator('.cell')
  await expect(cells.first()).toBeVisible()
  const empties = page.locator('.cell:not(.filled)')
  let filled = page.locator('.num-btn').first()
  for (let i = 0; i < (await empties.count()); i++) {
    await empties.nth(i).click()
    if (await filled.isVisible()) {
      await filled.click()
      break
    }
  }
  await expect(page.locator('.cell.filled').first()).toBeVisible()
})

test('Relay：答对一题推进接龙', async ({ page }) => {
  await page.goto('/games/relay')
  await expect(page.locator('.relay-q')).toBeVisible()
  const buttons = page.locator('.answer-btn')
  const n = await buttons.count()
  expect(n).toBeGreaterThan(0)
  // 逐个试探直到答对（答错会有"再试一次"反馈，可继续点）
  for (let i = 0; i < n && (await page.locator('.relay-prev').count()) === 0; i++) {
    if (await page.locator('.feedback.wrong').count()) {
      await page.waitForTimeout(300)
    }
    await buttons.nth(i).click()
    await page.waitForTimeout(1100)
  }
  await expect(page.locator('.relay-prev').first()).toBeVisible()
})
