import { describe, it, expect, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import MemoryGame from '@/components/arcade/MemoryGame.vue'
import FriendGame from '@/components/arcade/FriendGame.vue'
import GoFishGame from '@/components/arcade/GoFishGame.vue'
import GuessGame from '@/components/arcade/GuessGame.vue'
import BalanceGame from '@/components/arcade/BalanceGame.vue'
import BoardRaceGame from '@/components/arcade/BoardRaceGame.vue'
import FrogJumpGame from '@/components/arcade/FrogJumpGame.vue'
import MazeGame from '@/components/arcade/MazeGame.vue'
import RocketGame from '@/components/arcade/RocketGame.vue'
import PatternGame from '@/components/arcade/PatternGame.vue'
import RelayGame from '@/components/arcade/RelayGame.vue'
import PuzzleGame from '@/components/arcade/PuzzleGame.vue'
import WhackGame from '@/components/arcade/WhackGame.vue'
import CodeBreakGame from '@/components/arcade/CodeBreakGame.vue'
import PickingGame from '@/components/arcade/PickingGame.vue'
import ShapeRiddleGame from '@/components/arcade/ShapeRiddleGame.vue'
import ShapeBuildGame from '@/components/arcade/ShapeBuildGame.vue'
import WarBattleGame from '@/components/arcade/WarBattleGame.vue'
import SudokuGame from '@/components/arcade/SudokuGame.vue'
import MatchstickGame from '@/components/arcade/MatchstickGame.vue'
import { ARCADE_GAMES } from '@/lib/arcade'
import { arcadeComponentFor } from '@/lib/arcade/registry'

/** 依次点击 options 直到出现 correct 反馈 */
async function bruteForce(wrapper: VueWrapper, click: (i: number) => Promise<void> | void, max = 8) {
  for (let i = 0; i < max; i++) {
    if (wrapper.find('.feedback.correct').exists()) return
    await click(i)
    await new Promise((r) => setTimeout(r, 30))
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe('arcade registry', () => {
  it('覆盖全部 20 个游戏', () => {
    expect(ARCADE_GAMES.length).toBe(20)
    for (const m of ARCADE_GAMES) {
      expect(arcadeComponentFor(m.slug)).toBeDefined()
    }
    const slugs = new Set(ARCADE_GAMES.map((m) => m.slug))
    expect(slugs.size).toBe(20)
  })
})

describe('MemoryGame', () => {
  it('渲染 8 张背朝上的牌', () => {
    const w = mount(MemoryGame)
    expect(w.findAll('.memory-card')).toHaveLength(8)
    expect(w.findAll('.memory-card.flipped')).toHaveLength(0)
  })

  it('翻开一对相同的牌 → 匹配', async () => {
    const w = mount(MemoryGame)
    const cards = w.findAll('.memory-card')
    // 找到 pair 键相同的两张
    const byPair = new Map<string, number[]>()
    cards.forEach((c, i) => {
      const v = c.attributes('data-value')!
      byPair.set(v, [...(byPair.get(v) ?? []), i])
    })
    const [a, b] = [...byPair.values()][0]
    await cards[a].trigger('click')
    await cards[b].trigger('click')
    expect(w.findAll('.memory-card.matched')).toHaveLength(2)
  })
})

describe('FriendGame', () => {
  it('渲染 8 张牌', () => {
    const w = mount(FriendGame)
    expect(w.findAll('.card')).toHaveLength(8)
  })

  it('点互补两张 → 匹配', async () => {
    const w = mount(FriendGame)
    const target = Number(w.find('.friend-target strong').text())
    const cards = w.findAll('.card')
    let a = 0
    let b = 0
    outer: for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        if (Number(cards[i].attributes('data-value')) + Number(cards[j].attributes('data-value')) === target) {
          a = i
          b = j
          break outer
        }
      }
    }
    await cards[a].trigger('click')
    await cards[b].trigger('click')
    expect(w.findAll('.card.matched')).toHaveLength(2)
  })
})

describe('GoFishGame', () => {
  it('渲染 6 条鱼', () => {
    const w = mount(GoFishGame)
    expect(w.findAll('.fish')).toHaveLength(6)
  })

  it('钓两条凑 10 的鱼 → 进篓', async () => {
    const w = mount(GoFishGame)
    const fishes = w.findAll('.fish')
    let a = 0
    let b = 0
    outer: for (let i = 0; i < fishes.length; i++) {
      for (let j = i + 1; j < fishes.length; j++) {
        if (Number(fishes[i].attributes('data-value')) + Number(fishes[j].attributes('data-value')) === 10) {
          a = i
          b = j
          break outer
        }
      }
    }
    await fishes[a].trigger('click')
    await fishes[b].trigger('click')
    expect(w.findAll('.fish.caught')).toHaveLength(2)
  })
})

describe('GuessGame', () => {
  it('渲染 20 个按钮', () => {
    const w = mount(GuessGame)
    expect(w.findAll('.guess-btn')).toHaveLength(20)
  })

  it('依次点击最终猜中', async () => {
    const w = mount(GuessGame)
    for (let n = 0; n < 20; n++) {
      if (w.find('.finish-card').exists()) break
      const btn = w.find(`.guess-btn[data-value="${n}"]`)
      if (btn.exists() && !btn.attributes('disabled')) {
        await btn.trigger('click')
      }
    }
    expect(w.find('.finish-card').exists()).toBe(true)
  })
})

describe('BalanceGame', () => {
  it('渲染天平与 4 个选项', () => {
    const w = mount(BalanceGame)
    expect(w.find('.scale').exists()).toBe(true)
    expect(w.findAll('.answer-btn')).toHaveLength(4)
  })

  it('选对砝码 → 正确反馈', async () => {
    const w = mount(BalanceGame)
    const answer = (w.vm as unknown as { rd: { answer: number } }).rd.answer
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    expect(w.find('.feedback.correct').exists()).toBe(true)
  })
})

describe('BoardRaceGame', () => {
  it('渲染 20 格赛道', () => {
    const w = mount(BoardRaceGame)
    expect(w.findAll('.race-cell')).toHaveLength(20)
  })

  it('掷骰子后位置变化', async () => {
    const w = mount(BoardRaceGame)
    const before = (w.vm as unknown as { pos: number }).pos
    await w.find('.die-btn').trigger('click')
    const after = (w.vm as unknown as { pos: number }).pos
    expect(after).toBeGreaterThan(before)
  })
})

describe('FrogJumpGame', () => {
  it('渲染荷叶与 4 个选项', () => {
    const w = mount(FrogJumpGame)
    expect(w.findAll('.lily').length).toBeGreaterThan(3)
    expect(w.findAll('.answer-btn')).toHaveLength(4)
  })

  it('点正确落点 → 正确反馈', async () => {
    const w = mount(FrogJumpGame)
    const answer = (w.vm as unknown as { rd: { answer: number } }).rd.answer
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    expect(w.find('.feedback.correct').exists()).toBe(true)
  })
})

describe('MazeGame', () => {
  it('渲染迷宫格子', () => {
    const w = mount(MazeGame)
    expect(w.findAll('.maze-cell').length).toBe(20)
  })

  it('走正确一步 → 前进', async () => {
    const w = mount(MazeGame)
    const level = (w.vm as unknown as { level: { start: number; grid: number[]; width: number } }).level
    const cur = level.start
    const row = Math.floor(cur / level.width)
    const col = cur % level.width
    const next = level.grid[cur] + 1
    const target = level.grid.findIndex((v) => v === next)
    const r2 = Math.floor(target / level.width)
    const c2 = target % level.width
    const adjacent = Math.abs(r2 - row) + Math.abs(c2 - col) === 1
    expect(adjacent).toBe(true)
    await w.find(`.maze-cell[data-index="${target}"]`).trigger('click')
    expect((w.vm as unknown as { cur: number }).cur).toBe(target)
  })
})

describe('RocketGame', () => {
  it('渲染倒序按钮', () => {
    const w = mount(RocketGame)
    expect(w.findAll('.cd-btn')).toHaveLength(11)
  })

  it('先点 10 → 点亮', async () => {
    const w = mount(RocketGame)
    const btn = w.find('.cd-btn[data-value="10"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(w.find('.cd-btn[data-value="10"].lit').exists()).toBe(true)
  })
})

describe('PatternGame', () => {
  it('渲染序列与空缺', () => {
    const w = mount(PatternGame)
    expect(w.findAll('.pattern-item')).toHaveLength(5)
    expect(w.find('.pattern-item.blank').exists()).toBe(true)
  })

  it('选对答案 → 正确反馈', async () => {
    const w = mount(PatternGame)
    const answer = (w.vm as unknown as { rd: { answer: number | string } }).rd.answer
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    expect(w.find('.feedback.correct').exists()).toBe(true)
  })
})

describe('RelayGame', () => {
  it('渲染题目与 4 个选项', () => {
    const w = mount(RelayGame)
    expect(w.find('.relay-q').text()).toContain('= ?')
    expect(w.findAll('.answer-btn')).toHaveLength(4)
    w.unmount()
  })

  it('答对后推进到下一题', async () => {
    vi.useFakeTimers()
    const w = mount(RelayGame)
    const answer = (w.vm as unknown as { current: { answer: number } }).current.answer
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    await vi.advanceTimersByTimeAsync(1000)
    expect((w.vm as unknown as { index: number }).index).toBe(1)
    w.unmount()
    vi.useRealTimers()
  })
})

describe('PuzzleGame', () => {
  it('渲染 9 块拼图', () => {
    const w = mount(PuzzleGame)
    expect(w.findAll('.puzzle-tile')).toHaveLength(9)
    expect(w.findAll('.puzzle-tile.open')).toHaveLength(0)
  })

  it('答对后揭开一块', async () => {
    const w = mount(PuzzleGame)
    const answer = (w.vm as unknown as { current: { answer: number } }).current.answer
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    const openBtn = w.findAll('button').find((b) => b.text().includes('揭开拼图'))
    expect(openBtn).toBeDefined()
    await openBtn!.trigger('click')
    expect(w.findAll('.puzzle-tile.open').length).toBeGreaterThan(0)
  })
})

describe('WhackGame', () => {
  it('渲染 9 个洞', () => {
    vi.useFakeTimers()
    const w = mount(WhackGame)
    expect(w.findAll('.hole')).toHaveLength(9)
    w.unmount()
    vi.useRealTimers()
  })

  it('敲中正确答案 → 得分', async () => {
    vi.useFakeTimers()
    const w = mount(WhackGame)
    const text = w.find('.whack-q').text().replace(' = ?', '')
    const [a, op, b] = text.split(' ')
    const answer = op === '+' ? Number(a) + Number(b) : Number(a) - Number(b)
    await w.find(`.hole[data-active="true"][data-value="${answer}"]`).trigger('click')
    expect((w.vm as unknown as { score: number }).score).toBeGreaterThan(0)
    w.unmount()
    vi.useRealTimers()
  })
})

describe('CodeBreakGame', () => {
  it('渲染 3 道锁', () => {
    const w = mount(CodeBreakGame)
    expect(w.findAll('.lock')).toHaveLength(3)
  })

  it('答对解锁第一道', async () => {
    const w = mount(CodeBreakGame)
    const answer = (w.vm as unknown as { question: { answer: number } }).question.answer
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    const nxt = w.findAll('button').find((b) => b.text().includes('下一道锁'))
    expect(nxt).toBeDefined()
    await nxt!.trigger('click')
    expect(w.find('.lock.solved').exists()).toBe(true)
  })
})

describe('PickingGame', () => {
  it('渲染树与 4 个选项', () => {
    const w = mount(PickingGame)
    expect(w.find('.tree').exists()).toBe(true)
    expect(w.findAll('.answer-btn')).toHaveLength(4)
  })

  it('暴力点击最终答对', async () => {
    const w = mount(PickingGame)
    await bruteForce(w, async (i) => {
      const btns = w.findAll('.answer-btn')
      if (btns[i]) await btns[i].trigger('click')
    })
    expect(w.find('.feedback.correct').exists()).toBe(true)
  })
})

describe('ShapeRiddleGame', () => {
  it('渲染提示与 4 个选项', () => {
    const w = mount(ShapeRiddleGame)
    expect(w.find('.riddle-clue').text().length).toBeGreaterThan(3)
    expect(w.findAll('.shape-opt')).toHaveLength(4)
  })

  it('暴力点击最终揭示', async () => {
    const w = mount(ShapeRiddleGame)
    await bruteForce(w, async (i) => {
      const btns = w.findAll('.shape-opt')
      if (btns[i]) await btns[i].trigger('click')
    })
    expect(w.find('.riddle-art').exists()).toBe(true)
  })
})

describe('ShapeBuildGame', () => {
  it('渲染图纸与 4 种图形', () => {
    const w = mount(ShapeBuildGame)
    expect(w.find('.blueprint').exists()).toBe(true)
    expect(w.findAll('.pool-btn')).toHaveLength(4)
  })

  it('选齐图形 → 拼搭成功', async () => {
    const w = mount(ShapeBuildGame)
    const plan = (w.vm as unknown as { plan: { parts: { shape: string; count: number }[] } }).plan
    for (const part of plan.parts) {
      const btn = w.find(`.pool-btn[data-shape="${part.shape}"]`)
      for (let k = 0; k < part.count; k++) await btn.trigger('click')
    }
    await w.find('.build-actions').find('button').trigger('click')
    expect(w.find('.feedback.correct').exists()).toBe(true)
  })
})

describe('WarBattleGame', () => {
  it('渲染双方牌区', () => {
    const w = mount(WarBattleGame)
    expect(w.findAll('[data-side="player"]')).toHaveLength(2)
    expect(w.findAll('[data-side="cpu"]')).toHaveLength(2)
  })

  it('翻开电脑的牌 → 显示和', async () => {
    const w = mount(WarBattleGame)
    const button = w.findAll('button').find((b) => b.text().includes('翻开'))
    expect(button).toBeDefined()
    await button!.trigger('click')
    expect(w.text()).toContain('和：')
    expect(w.find('.round-result').exists()).toBe(true)
  })
})

describe('SudokuGame', () => {
  it('渲染 4×4 棋盘', () => {
    const w = mount(SudokuGame)
    expect(w.findAll('.cell')).toHaveLength(16)
  })

  it('点空格出现候选数字', async () => {
    const w = mount(SudokuGame)
    const cell = w.findAll('.cell:not(.fixed)')[0]
    await cell.trigger('click')
    expect(w.find('.num-pad').exists()).toBe(true)
  })
})

describe('MatchstickGame', () => {
  it('渲染火柴算式与 4 个选项', () => {
    const w = mount(MatchstickGame)
    expect(w.findAll('.match-digit').length).toBeGreaterThan(2)
    expect(w.findAll('.match-opt')).toHaveLength(4)
  })

  it('暴力点击最终选对', async () => {
    const w = mount(MatchstickGame)
    await bruteForce(w, async (i) => {
      const opts = w.findAll('.match-opt')
      if (opts[i]) await opts[i].trigger('click')
    })
    expect(w.find('.feedback.correct').exists()).toBe(true)
  })
})
