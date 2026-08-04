import { test, expect } from '@playwright/test'

test('首页渲染 9 个单元与全部玩法演示', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '一年级数学例题游戏' })).toBeVisible()
  await expect(page.locator('.unit-card')).toHaveCount(9)
  await expect(page.locator('.demo-card')).toHaveCount(11)
})

test('首页游戏按单元分组并标注适用单元', async ({ page }) => {
  await page.goto('/')
  const cards = page.locator('.home-game-card')
  await expect(cards.first()).toBeVisible()
  expect(await cards.count()).toBeGreaterThan(20)
  await expect(page.locator('.unit-game-group')).toHaveCount(9)
  await expect(page.locator('.unit-game-group', { hasText: '第 5 单元' })).toContainText('图形特征猜谜')
  await expect(page.locator('.unit-game-group', { hasText: '第 8 单元' })).toContainText('骰子走格')
  // 每张游戏卡片都标注适用单元
  const labeled = await page.locator('.home-game-card:has-text("适用第")').count()
  expect(labeled).toBe(await cards.count())
  // 无配套游戏的单元给出课堂提示（第 3 单元 位置）
  await expect(page.locator('.unit-game-group', { hasText: '本单元暂无配套小游戏' })).toHaveCount(1)
})

test('单元页 → 例题列表 → 进入游戏页', async ({ page }) => {
  await page.goto('/units/c1')
  await expect(page.locator('.ex-card').first()).toBeVisible()
  const count = await page.locator('.ex-card').count()
  expect(count).toBeGreaterThan(0)
  await page.locator('.ex-card').first().click()
  await expect(page).toHaveURL(/\/play\//)
  await expect(page.locator('.question-card')).toBeVisible()
  await expect(page.locator('.answer-pad')).toBeVisible()
})

test('答对题目出现正确反馈并可进入下一题', async ({ page }) => {
  await page.goto('/play/c1-count-01')
  const buttons = page.locator('.answer-btn')
  await expect(buttons.first()).toBeVisible() // 等客户端水合完成
  const n = await buttons.count()
  expect(n).toBeGreaterThan(1)
  // 逐个试探直到正确；错误时先"再试一次"消除反馈
  for (let i = 0; i < n && (await page.locator('.feedback.correct').count()) === 0; i++) {
    if (await page.locator('.feedback.wrong').count()) {
      await page.getByRole('button', { name: '再试一次' }).click()
    }
    await buttons.nth(i).click()
    await page.waitForTimeout(150)
  }
  await expect(page.locator('.feedback.correct')).toBeVisible()
  await expect(page.getByRole('button', { name: '下一题' }).last()).toBeVisible()
})

test('答错出现再试一次并可重试', async ({ page }) => {
  await page.goto('/play/c1-count-01')
  const buttons = page.locator('.answer-btn')
  await expect(buttons.first()).toBeVisible()
  await buttons.nth(0).click()
  await expect(page.locator('.feedback.wrong')).toBeVisible()
  await expect(page.getByRole('button', { name: '再试一次' })).toBeVisible()
})

test('立体图形题渲染 3D 画布与选项', async ({ page }) => {
  await page.goto('/play/c5-shape3d-01')
  await expect(page.locator('.shape-canvas canvas')).toBeVisible()
  await expect(page.locator('.answer-btn')).toHaveCount(4)
})
