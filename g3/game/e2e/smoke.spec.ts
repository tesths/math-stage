import { expect, test } from '@playwright/test'

test('首页：单元、Lab 与游戏入口', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /三年级数学例题可视化/ })).toBeVisible()
  // 单元卡片
  await expect(page.getByText('混合运算与数量关系（一）', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('两、三位数乘一位数', { exact: true }).first()).toBeVisible()
  // 游戏入口
  await expect(page.getByText('混合运算快算', { exact: true }).first()).toBeVisible()
})

test('单元页 → Lab 页：可调参数与公式', async ({ page }) => {
  await page.goto('/units/c3')
  await expect(page.getByText(/两、三位数乘一位数/).first()).toBeVisible()
  await page.getByRole('link', { name: /笔算两位数乘一位数/ }).first().click()
  await expect(page.getByText('分步思考', { exact: true })).toBeVisible()
  await expect(page.getByText('(十位×10 + 个位) × 一位数', { exact: true }).first()).toBeVisible()
  // 拖动滑块改变参数
  const slider = page.locator('.lab-range').first()
  await slider.fill('3')
  await expect(page.getByText('分步思考', { exact: true })).toBeVisible()
})

test('Lab 列表导航', async ({ page }) => {
  await page.goto('/labs/g3-c3-mul-pen')
  await expect(page.getByText('分步思考', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /下一个/ }).first().click()
  await expect(page).toHaveURL(/\/labs\/g3-c3-mul-carry/)
})

test('24 时记时法：放大钟面并同步中文时间词', async ({ page }) => {
  await page.goto('/labs/g3-c2-time24')
  await expect(page.locator('.clock-pair')).toBeVisible()
  await expect(page.locator('.clock-card-title').nth(0)).toHaveText('12 时记时法')
  await expect(page.locator('.clock-card-title').nth(1)).toHaveText('24 时记时法')

  const clockBox = await page.locator('.clock-svg').first().boundingBox()
  expect(clockBox?.width ?? 0).toBeGreaterThan(300)

  await page.locator('.lab-range').nth(0).fill('13')
  await page.locator('.lab-range').nth(1).fill('5')
  await expect(page.locator('.reading-value').nth(1)).toHaveText('下午1时5分')
  await expect(page.locator('.reading-value').nth(2)).toHaveText('1:05 = 13:05')
  await expect(page.locator('.reading-value').nth(3)).toHaveText('13时5分')
  await expect(page.locator('.result-box')).toContainText('13:05')
  await expect(page.locator('.clock-num.active')).toHaveCount(2)
})

test('游戏页：混合运算快算', async ({ page }) => {
  await page.goto('/games/mix-quiz')
  await expect(page.getByText('先算乘除，再算加减；有小括号先算小括号里的')).toBeVisible()
  await expect(page.locator('.option-btn').first()).toBeVisible()
})

test('游戏页：倍的认识', async ({ page }) => {
  await page.goto('/games/times-quiz')
  await expect(page.locator('.option-btn').first()).toBeVisible()
})

test('游戏专区列表', async ({ page }) => {
  await page.goto('/games')
  await expect(page.getByText(/训练小游戏专区/)).toBeVisible()
  await expect(page.getByText('竖式乘法填空', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('24 时记时法', { exact: true }).first()).toBeVisible()
})
