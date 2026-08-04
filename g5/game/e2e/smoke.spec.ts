import { expect, test } from '@playwright/test'

test('首页：单元、Lab 与游戏入口', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /五年级数学例题可视化/ })).toBeVisible()
  // 单元卡片
  await expect(page.getByText('图形的运动', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('多边形的面积', { exact: true }).first()).toBeVisible()
  // 游戏入口
  await expect(page.getByText('面积速算', { exact: true }).first()).toBeVisible()
})

test('单元页 → Lab 页：可调参数与公式', async ({ page }) => {
  await page.goto('/units/c3')
  await expect(page.getByText(/多边形的面积/).first()).toBeVisible()
  await page.getByRole('link', { name: /平行四边形的面积/ }).first().click()
  await expect(page.getByText('S = a × h', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('分步思考', { exact: true })).toBeVisible()
  // 拖动滑块改变参数
  const slider = page.locator('.lab-range').first()
  await slider.fill('8')
  await expect(page.getByText('分步思考', { exact: true })).toBeVisible()
})

test('Lab 列表导航', async ({ page }) => {
  await page.goto('/labs/g5-c3-area-parallelogram')
  await expect(page.getByText('分步思考', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /下一个/ }).first().click()
  await expect(page).toHaveURL(/\/labs\/g5-c3-area-triangle/)
})

test('游戏页：面积速算', async ({ page }) => {
  await page.goto('/games/area-race')
  await expect(page.getByText('面积是多少？')).toBeVisible()
  await page.getByRole('button', { name: /再玩一次/ }).first()
  // 选项按钮存在
  await expect(page.locator('.option-btn').first()).toBeVisible()
})

test('游戏页：质数快抢（限时）', async ({ page }) => {
  await page.goto('/games/prime-dash')
  await expect(page.getByText('它是质数还是合数？')).toBeVisible()
  await page.getByRole('button', { name: '质数' }).click()
})

test('游戏专区列表', async ({ page }) => {
  await page.goto('/games')
  await expect(page.getByText(/训练小游戏专区/)).toBeVisible()
  await expect(page.getByText('小数乘除口算', { exact: true }).first()).toBeVisible()
})
