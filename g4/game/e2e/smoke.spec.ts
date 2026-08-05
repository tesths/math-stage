import { expect, test } from '@playwright/test'

test('首页：单元、Lab 与游戏入口', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /四年级数学例题可视化/ })).toBeVisible()
  // 单元卡片
  await expect(page.getByText('两、三位数除以两位数', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('周长与面积', { exact: true }).first()).toBeVisible()
  // 游戏入口
  await expect(page.getByText('除法口算', { exact: true }).first()).toBeVisible()
})

test('单元页 → Lab 页：可调参数与公式', async ({ page }) => {
  await page.goto('/units/c1')
  await expect(page.getByText(/两、三位数除以两位数/).first()).toBeVisible()
  await page.getByRole('link', { name: /整十数除以整十数/ }).first().click()
  await expect(page.getByText('分步思考', { exact: true })).toBeVisible()
  // 拖动滑块改变参数
  const slider = page.locator('.lab-range').first()
  await slider.fill('120')
  await expect(page.getByText('分步思考', { exact: true })).toBeVisible()
})

test('Lab 列表导航', async ({ page }) => {
  await page.goto('/labs/g4-c2-peri-rect')
  await expect(page.getByText('分步思考', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /下一个/ }).first().click()
  await expect(page).toHaveURL(/\/labs\/g4-c2-peri-square/)
})

test('游戏页：除法口算', async ({ page }) => {
  await page.goto('/games/div-quiz')
  await expect(page.getByText(/÷/).first()).toBeVisible()
  await expect(page.locator('.option-btn').first()).toBeVisible()
})

test('游戏页：周长挑战', async ({ page }) => {
  await page.goto('/games/perimeter-quiz')
  await expect(page.getByRole('heading', { name: /周长挑战/ })).toBeVisible()
  await expect(page.locator('.option-btn').first()).toBeVisible()
})

test('游戏专区列表', async ({ page }) => {
  await page.goto('/games')
  await expect(page.getByText(/训练小游戏专区/)).toBeVisible()
  await expect(page.getByText('四舍五入', { exact: true }).first()).toBeVisible()
})
