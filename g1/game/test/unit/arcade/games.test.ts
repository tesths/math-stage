import { describe, it, expect } from 'vitest'
import { buildMemoryDeck } from '@/lib/arcade/memory'
import { buildFriendDeck } from '@/lib/arcade/friend'
import { buildFishPool } from '@/lib/arcade/gofish'
import { newSecret, checkGuess } from '@/lib/arcade/guess'
import { newBalanceRound } from '@/lib/arcade/balance'
import { newFrogRound } from '@/lib/arcade/frogjump'
import { MAZE_LEVELS, isValidStep, neighbors } from '@/lib/arcade/maze'
import { buildCountdown } from '@/lib/arcade/rocket'
import { newPatternRound } from '@/lib/arcade/pattern'
import { generateChain, optionsFor } from '@/lib/arcade/relay'
import { newPuzzleQuestion } from '@/lib/arcade/puzzle'
import { newWhackQuestion, pickWhackAnswers } from '@/lib/arcade/whack'
import { newCodeQuestion } from '@/lib/arcade/codebreak'
import { newPickingRound } from '@/lib/arcade/picking'
import { newRiddleRound } from '@/lib/arcade/shaperiddle'
import { BUILD_PLANS } from '@/lib/arcade/shapebuild'
import { dealRound, roundWinner } from '@/lib/arcade/warbattle'
import { generateBoard, candidates, checkSolved } from '@/lib/arcade/sudoku'
import { MATCHSTICK_LEVELS, toChars } from '@/lib/arcade/matchstick'
import { rollDie, newRaceQuestion } from '@/lib/arcade/boardrace'
import { planOf } from '@/lib/arcade/shapebuild'
import { randomCalc } from '@/lib/arcade/relay'
import { ARCADE_GAMES, unitNoOf } from '@/lib/arcade'
import { ARCADE_COMPONENTS } from '@/lib/arcade/registry'

describe('arcade/memory', () => {
  it('牌组成对且成对键唯一', () => {
    const deck = buildMemoryDeck(4, 10)
    expect(deck.length).toBe(8)
    const pairs = new Set(deck.map((c) => c.pair))
    expect(pairs.size).toBe(4)
    const counts = new Map<string, number>()
    for (const c of deck) counts.set(c.pair, (counts.get(c.pair) ?? 0) + 1)
    for (const n of counts.values()) expect(n).toBe(2)
  })

  it('算式模式：每对是 算式↔数字', () => {
    const deck = buildMemoryDeck(3, 10, true)
    expect(deck.length).toBe(6)
    const pairs = new Map<string, string[]>()
    for (const c of deck) {
      pairs.set(c.pair, [...(pairs.get(c.pair) ?? []), c.kind])
    }
    for (const kinds of pairs.values()) {
      expect(kinds.sort()).toEqual(['expr', 'num'])
    }
  })

  it('对数限制在 3~6', () => {
    expect(buildMemoryDeck(1).length).toBe(6)
    expect(buildMemoryDeck(9).length).toBe(12)
  })
})

describe('arcade/friend', () => {
  it('8 张牌且每张都能找到互补对', () => {
    for (const target of [8, 9, 10]) {
      const deck = buildFriendDeck(target)
      expect(deck.length).toBe(8)
      for (const v of deck) {
        expect(deck).toContain(target - v)
      }
    }
  })
})

describe('arcade/gofish', () => {
  it('6 条鱼且每条都有凑 10 的伙伴', () => {
    const pool = buildFishPool(10)
    expect(pool.length).toBe(6)
    for (const v of pool) {
      expect(pool).toContain(10 - v)
    }
  })
})

describe('arcade/guess', () => {
  it('谜底在范围内', () => {
    for (let i = 0; i < 50; i++) {
      const s = newSecret()
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThanOrEqual(19)
    }
  })

  it('三分支判定', () => {
    expect(checkGuess(7, 3)).toBe('low')
    expect(checkGuess(7, 9)).toBe('high')
    expect(checkGuess(7, 7)).toBe('hit')
  })
})

describe('arcade/balance', () => {
  it('single 模式左右相等且选项含答案', () => {
    const rd = newBalanceRound(1)
    expect(rd.mode).toBe('single')
    expect(rd.left).toBe(rd.answer)
    expect(rd.options).toContain(rd.answer)
  })

  it('expr 模式答案为两数之和', () => {
    const rd = newBalanceRound(2)
    expect(rd.mode).toBe('expr')
    expect(rd.leftParts[0] + rd.leftParts[1]).toBe(rd.answer)
    expect(rd.options).toContain(rd.answer)
  })
})

describe('arcade/frogjump', () => {
  it('答案 = 起点 + 步数', () => {
    for (let i = 0; i < 50; i++) {
      const rd = newFrogRound()
      expect(rd.answer).toBe(Math.min(19, rd.from + rd.steps))
      expect(rd.answer).toBeGreaterThanOrEqual(rd.from)
      expect(rd.options).toContain(rd.answer)
      expect(rd.options).toHaveLength(4)
    }
  })
})

describe('arcade/maze', () => {
  it('每张迷宫都能从入口走到出口', () => {
    for (const level of MAZE_LEVELS) {
      const values = level.grid.filter((v): v is number => v !== null)
      expect(values.length).toBe(level.grid.length - level.grid.filter((v) => v === null).length)
      let cur = level.start
      while (cur !== level.goal) {
        const next = neighbors(cur, level).find((n) => level.grid[n] === (level.grid[cur] ?? 0) + 1)
        expect(next).toBeDefined()
        cur = next!
      }
      expect(cur).toBe(level.goal)
    }
  })

  it('只能走相邻且大 1 的格', () => {
    const level = MAZE_LEVELS[0]
    expect(isValidStep(0, 1, level)).toBe(true)
    expect(isValidStep(0, 5, level)).toBe(false)
    expect(isValidStep(1, 0, level)).toBe(false)
    expect(isValidStep(1, 2, level)).toBe(true)
    // 值不连续（相邻但非 +1）
    expect(isValidStep(0, 5, level)).toBe(false)
    // 空地不可走（第 3 关有 null）
    const level3 = MAZE_LEVELS[2]
    expect(isValidStep(18, 19, level3)).toBe(false)
    expect(isValidStep(17, 18, level3)).toBe(false)
  })
})

describe('arcade/rocket', () => {
  it('包含 0..count 各一次', () => {
    const nums = buildCountdown(10)
    expect(nums.length).toBe(11)
    expect(new Set(nums).size).toBe(11)
    expect(nums).toContain(10)
    expect(nums).toContain(0)
  })
})

describe('arcade/pattern', () => {
  it('数字规律：等差且答案在选项中', () => {
    for (let i = 0; i < 20; i++) {
      const rd = newPatternRound(1)
      expect(rd.kind).toBe('num')
      const nums = rd.sequence as number[]
      const step = nums[1] - nums[0]
      for (let j = 1; j < nums.length; j++) {
        expect(nums[j] - nums[j - 1]).toBe(step)
      }
      expect(rd.options).toContain(rd.answer)
      expect(rd.sequence[rd.blankIndex]).toBe(rd.answer)
    }
  })

  it('图形规律：周期交替', () => {
    for (let i = 0; i < 10; i++) {
      const rd = newPatternRound(2)
      expect(rd.kind).toBe('emoji')
      const seq = rd.sequence as string[]
      for (let j = 2; j < seq.length; j++) {
        expect(seq[j]).toBe(seq[j - 2])
      }
      expect(rd.options).toContain(rd.answer)
    }
  })
})

describe('arcade/relay', () => {
  it('接龙：下一题已知数 = 上一题得数', () => {
    const chain = generateChain(5)
    expect(chain.length).toBe(5)
    for (let i = 1; i < chain.length; i++) {
      expect(chain[i].a).toBe(chain[i - 1].answer)
    }
    for (const link of chain) {
      const expected = link.op === '+' ? link.a + link.b : link.a - link.b
      expect(link.answer).toBe(expected)
      expect(link.answer).toBeGreaterThanOrEqual(0)
    }
  })

  it('选项含答案且 4 个', () => {
    const opts = optionsFor(7)
    expect(opts).toHaveLength(4)
    expect(opts).toContain(7)
  })

  it('randomCalc 结果正确且含减法分支', () => {
    let sawMinus = false
    for (let i = 0; i < 50; i++) {
      const q = randomCalc(9)
      const expected = q.op === '+' ? q.a + q.b : q.a - q.b
      expect(q.answer).toBe(expected)
      if (q.op === '-') sawMinus = true
    }
    expect(sawMinus).toBe(true)
  })
})

describe('arcade/puzzle', () => {
  it('答案非负且选项含答案', () => {
    for (let i = 0; i < 30; i++) {
      const q = newPuzzleQuestion()
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.options).toContain(q.answer)
      expect(q.options).toHaveLength(4)
    }
  })
})

describe('arcade/whack', () => {
  it('问题答案正确', () => {
    for (let i = 0; i < 30; i++) {
      const q = newWhackQuestion()
      const [a, op, b] = q.text.split(' ')
      const expected = op === '+' ? Number(a) + Number(b) : Number(a) - Number(b)
      expect(q.answer).toBe(expected)
    }
  })

  it('9 洞面板恰有 2 个正确', () => {
    for (let i = 0; i < 30; i++) {
      const q = newWhackQuestion()
      const values = pickWhackAnswers(q.answer)
      expect(values).toHaveLength(9)
      expect(values.filter((v) => v === q.answer).length).toBe(2)
    }
  })
})

describe('arcade/codebreak', () => {
  it('答案正确且选项含答案', () => {
    for (let i = 0; i < 30; i++) {
      const q = newCodeQuestion()
      expect(q.options).toContain(q.answer)
    }
  })
})

describe('arcade/picking', () => {
  it('total 模式答案 = 摘的总数', () => {
    const rd = newPickingRound(1)
    expect(rd.mode).toBe('total')
    expect(rd.answer).toBe(rd.picks.reduce((s, p) => s + p, 0))
    expect(rd.initial).toBeGreaterThanOrEqual(rd.answer)
    expect(rd.options).toContain(rd.answer)
  })

  it('left 模式答案 = 剩余', () => {
    const rd = newPickingRound(2)
    expect(rd.mode).toBe('left')
    expect(rd.answer).toBe(rd.initial - rd.picks.reduce((s, p) => s + p, 0))
    expect(rd.answer).toBeGreaterThanOrEqual(2)
  })
})

describe('arcade/shaperiddle', () => {
  it('目标在选项中且有提示', () => {
    for (let i = 0; i < 10; i++) {
      const rd = newRiddleRound(i)
      expect(rd.options).toContain(rd.target)
      expect(rd.options).toHaveLength(4)
      expect(rd.clue.length).toBeGreaterThan(3)
    }
  })
})

describe('arcade/shapebuild', () => {
  it('图纸需求合法', () => {
    for (const p of BUILD_PLANS) {
      expect(p.parts.length).toBeGreaterThan(0)
      for (const part of p.parts) {
        expect(part.count).toBeGreaterThan(0)
        expect(part.count).toBeLessThanOrEqual(3)
      }
    }
  })

  it('planOf 命中图纸并有兜底', () => {
    expect(planOf('小房子').name).toBe('小房子')
    expect(planOf('不存在的造型').name).toBe(BUILD_PLANS[0].name)
  })
})

describe('arcade/warbattle', () => {
  it('发牌值与和正确', () => {
    for (let i = 0; i < 30; i++) {
      const rd = dealRound()
      for (const v of [...rd.player, ...rd.cpu]) {
        expect(v).toBeGreaterThanOrEqual(1)
        expect(v).toBeLessThanOrEqual(9)
      }
      expect(rd.playerSum).toBe(rd.player[0] + rd.player[1])
      expect(rd.cpuSum).toBe(rd.cpu[0] + rd.cpu[1])
    }
  })

  it('胜负判定三分支', () => {
    expect(roundWinner({ player: [1, 2], cpu: [1, 1], playerSum: 3, cpuSum: 2 })).toBe('player')
    expect(roundWinner({ player: [1, 1], cpu: [2, 3], playerSum: 2, cpuSum: 5 })).toBe('cpu')
    expect(roundWinner({ player: [2, 3], cpu: [1, 4], playerSum: 5, cpuSum: 5 })).toBe('tie')
  })
})

describe('arcade/sudoku', () => {
  it('生成盘面解合法且挖空正确', () => {
    for (let i = 0; i < 20; i++) {
      const { board, solution } = generateBoard(5)
      const holes = board.flat().filter((v) => v === null).length
      expect(holes).toBe(5)
      // 每行/列/宫都是 1~4 各一个
      const check = (vals: number[]) => new Set(vals).size === 4 && vals.every((v) => v >= 1 && v <= 4)
      for (let r = 0; r < 4; r++) {
        expect(check(solution[r])).toBe(true)
        expect(check(solution.map((row) => row[r]))).toBe(true)
      }
      for (let br = 0; br < 4; br += 2) {
        for (let bc = 0; bc < 4; bc += 2) {
          const box = []
          for (let r = br; r < br + 2; r++) for (let c = bc; c < bc + 2; c++) box.push(solution[r][c])
          expect(check(box)).toBe(true)
        }
      }
      // 已填格与解一致
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] !== null) expect(board[r][c]).toBe(solution[r][c])
        }
      }
    }
  })

  it('candidates 只给合法候选', () => {
    const { board, solution } = generateBoard(6)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === null) {
          const cand = candidates(board, r, c)
          expect(cand).toContain(solution[r][c])
        }
      }
    }
  })

  it('checkSolved 判定一致', () => {
    const { board, solution } = generateBoard(4)
    expect(checkSolved(board, solution)).toBe(false)
    expect(checkSolved(solution, solution)).toBe(true)
  })
})

describe('arcade/matchstick', () => {
  it('题目结构合法且 good 唯一正确', () => {
    for (const item of MATCHSTICK_LEVELS) {
      expect(item.bad).not.toBe(item.good)
      expect(item.distractors.length).toBeGreaterThanOrEqual(2)
      expect(item.distractors).not.toContain(item.good)
      expect(item.distractors).not.toContain(item.bad)
    }
    expect(MATCHSTICK_LEVELS.length).toBe(10)
  })

  it('toChars 拆成字符数组', () => {
    expect(toChars('2+3=5')).toEqual(['2', '+', '3', '=', '5'])
  })
})

describe('arcade/boardrace', () => {
  it('骰子 1~6，题目答案正确', () => {
    for (let i = 0; i < 30; i++) {
      const d = rollDie()
      expect(d).toBeGreaterThanOrEqual(1)
      expect(d).toBeLessThanOrEqual(6)
      const q = newRaceQuestion()
      const expected = q.op === '+' ? q.a + q.b : q.a - q.b
      expect(q.answer).toBe(expected)
      expect(q.options).toContain(q.answer)
    }
  })
})

describe('arcade 元数据：单元标注与注册表一致', () => {
  it('20 个游戏 slug 与注册表一一对应', () => {
    expect(ARCADE_GAMES.length).toBe(20)
    const slugs = new Set(ARCADE_GAMES.map((m) => m.slug))
    expect(slugs.size).toBe(20)
    for (const m of ARCADE_GAMES) {
      expect(ARCADE_COMPONENTS[m.slug]).toBeDefined()
    }
    expect(Object.keys(ARCADE_COMPONENTS).sort()).toEqual([...slugs].sort())
  })

  it('每个游戏至少标注 1 个单元且单元号合法', () => {
    for (const m of ARCADE_GAMES) {
      expect(m.chapters.length).toBeGreaterThan(0)
      for (const c of m.chapters) {
        const no = unitNoOf(c)
        expect(no).toBeGreaterThanOrEqual(1)
        expect(no).toBeLessThanOrEqual(9)
      }
    }
  })

  it('单元标注与课本单元一致（抽查代表游戏）', () => {
    expect(unitNoOf('c5')).toBe(5)
    const bySlug = new Map(ARCADE_GAMES.map((m) => [m.slug, m]))
    expect(bySlug.get('frogjump')!.chapters).toEqual(['c8'])
    expect(bySlug.get('shaperiddle')!.chapters).toEqual(['c5'])
    expect(bySlug.get('gofish')!.chapters).toEqual(['c6', 'c7'])
    expect(bySlug.get('sudoku')!.chapters).toEqual(['c9'])
  })

  it('首页按单元分组后每个游戏至少出现在一组', () => {
    const unitIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'] as const
    const covered = new Set(ARCADE_GAMES.filter((m) => unitIds.some((id) => m.chapters.includes(id))).map((m) => m.slug))
    expect(covered.size).toBe(ARCADE_GAMES.length)
  })
})
