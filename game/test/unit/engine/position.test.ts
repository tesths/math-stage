import { describe, it, expect } from 'vitest'
import { positionOf } from '@/lib/engine/position'

describe('positionOf', () => {
  it('左: 前一物品', () => {
    expect(positionOf(['月月', '贝贝', '元元'], '贝贝', '左')).toBe('月月')
  })
  it('右: 后一物品', () => {
    expect(positionOf(['月月', '贝贝', '元元'], '贝贝', '右')).toBe('元元')
  })
  it('前: 前一物品', () => {
    expect(positionOf(['小清', '红红', '亮亮'], '红红', '前')).toBe('小清')
  })
  it('后: 后一物品', () => {
    expect(positionOf(['月月', '红红', '亮亮'], '月月', '后')).toBe('红红')
  })
  it('上: 前一物品（竖排）', () => {
    expect(positionOf(['国旗', '黑板'], '黑板', '上')).toBe('国旗')
  })
  it('下: 后一物品（竖排）', () => {
    expect(positionOf(['鸟', '猫'], '鸟', '下')).toBe('猫')
  })
  it('越界返回 undefined', () => {
    expect(positionOf(['月月', '贝贝'], '月月', '左')).toBeUndefined()
    expect(positionOf(['月月', '贝贝'], '贝贝', '右')).toBeUndefined()
  })
  it('target 不存在返回 undefined', () => {
    expect(positionOf(['月月', '贝贝'], '小清', '右')).toBeUndefined()
  })
})
