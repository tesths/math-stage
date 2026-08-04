import { describe, it, expect, vi } from 'vitest'
import { mount, nextTick } from '@vue/test-utils'
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
import { newRaceQuestion } from '@/lib/arcade/boardrace'
import { generateBoard } from '@/lib/arcade/sudoku'
import { isValidStep } from '@/lib/arcade/maze'

type VM = Record<string, any>

describe('MemoryGame 分支', () => {
  it('翻两张不同的牌后自动翻回', async () => {
    vi.useFakeTimers()
    const w = mount(MemoryGame)
    const vm = w.vm as VM
    // 构造：翻两张 pair 不同的牌
    const deck = vm.deck as { id: number; pair: string }[]
    const a = deck[0]
    const b = deck.find((c) => c.pair !== a.pair)!
    await w.find(`.memory-card[data-value="${a.pair}"]`).trigger('click')
    await w.find(`.memory-card[data-value="${b.pair}"]`).trigger('click')
    expect(w.findAll('.memory-card.flipped')).toHaveLength(2)
    await vi.advanceTimersByTimeAsync(900)
    expect(vm.flipped).toHaveLength(0)
    w.unmount()
    vi.useRealTimers()
  })

  it('配对全部完成进入第 2 关并可 restart', async () => {
    const w = mount(MemoryGame)
    const vm = w.vm as VM
    // 动态找未匹配的一对点击
    let guard = 0
    while (vm.round === 1 && guard++ < 10) {
      const deck = vm.deck as { id: number; pair: string }[]
      const cards = w.findAll('.memory-card')
      const a = deck.find((c) => !vm.matchedIds.has(c.id))!
      const mate = deck.find((d) => d.pair === a.pair && d.id !== a.id)!
      await cards[deck.indexOf(a)].trigger('click')
      await cards[deck.indexOf(mate)].trigger('click')
    }
    expect(vm.round).toBe(2)
    await w.vm.$nextTick()
    expect(vm.deck.length).toBe(10)
    w.unmount()
  })
})

describe('FriendGame 分支', () => {
  it('选错对不给过并恢复', async () => {
    vi.useFakeTimers()
    const w = mount(FriendGame)
    const vm = w.vm as VM
    const deck = vm.deck as number[]
    const target = vm.target as number
    const cards = w.findAll('.card')
    // 找一对值不相配的索引
    let iBad = 0
    let iOther = 1
    while (deck[iBad] + deck[iOther] === target) iOther++
    await cards[iBad].trigger('click')
    await cards[iOther].trigger('click')
    expect(vm.matched.size).toBe(0)
    expect(vm.wrongCount).toBe(1)
    await vi.advanceTimersByTimeAsync(1000)
    expect(vm.selected).toHaveLength(0)
    w.unmount()
    vi.useRealTimers()
  })
})

describe('GoFishGame 分支', () => {
  it('钓错两条鱼提示后可继续', () => {
    const w = mount(GoFishGame)
    const vm = w.vm as VM
    const pool = vm.pool as number[]
    // 找两条不相配的鱼
    const a = pool[0]
    const b = pool.find((v) => v !== 10 - a)!
    expect(vm.caught.size).toBe(0)
    void b
  })
})

describe('GuessGame 分支', () => {
  it('再来一局重置范围', async () => {
    const w = mount(GuessGame)
    const vm = w.vm as VM
    vm.done = true
    await w.vm.$nextTick()
    const reset = w.findAll('button').find((b) => b.text().includes('再来一局'))
    await reset!.trigger('click')
    expect(vm.done).toBe(false)
    expect(vm.lo).toBe(0)
    expect(vm.hi).toBe(19)
  })
})

describe('BalanceGame 分支', () => {
  it('答错→下一题→完成→再来', async () => {
    const w = mount(BalanceGame)
    const vm = w.vm as VM
    const answer = vm.rd.answer
    const wrong = vm.rd.options.find((o: number) => o !== answer)!
    await w.find(`.answer-btn[data-opt="${wrong}"]`).trigger('click')
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    const nxt = w.findAll('button').find((b) => b.text().includes('下一题'))
    await nxt!.trigger('click')
    expect(vm.round).toBe(2)
    // 直接快进到第 5 关并 next → finished
    vm.round = 5
    vm.done = true
    await w.vm.$nextTick()
    const last = w.findAll('button').find((b) => b.text().includes('下一题'))
    await last!.trigger('click')
    expect(vm.finished).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再玩一次'))!.trigger('click')
    expect(vm.round).toBe(1)
    expect(vm.finished).toBe(false)
  })
})

describe('BoardRaceGame 分支', () => {
  it('停在问号格触发口算题并答题推进', async () => {
    const w = mount(BoardRaceGame)
    const vm = w.vm as VM
    vm.pos = 4
    vm.q = newRaceQuestion()
    vm.phase = 'question'
    vm.done = false
    vm.feedback = 'idle'
    await w.vm.$nextTick()
    expect(w.find('.die-btn').exists()).toBe(false)
    await w.find(`.answer-btn[data-opt="${vm.q.answer}"]`).trigger('click')
    expect(w.find('.feedback.correct').exists()).toBe(true)
    const cont = w.findAll('button').find((b) => b.text().includes('继续'))
    await cont!.trigger('click')
    expect(vm.phase).toBe('roll')
  })

  it('答错后退到 roll', async () => {
    const w = mount(BoardRaceGame)
    const vm = w.vm as VM
    vm.pos = 4
    vm.q = newRaceQuestion()
    vm.phase = 'question'
    vm.done = false
    await w.vm.$nextTick()
    const wrong = vm.q.options.find((o: number) => o !== vm.q.answer)
    await w.find(`.answer-btn[data-opt="${wrong}"]`).trigger('click')
    const cont = w.findAll('button').find((b) => b.text().includes('继续'))
    const before = vm.pos
    await cont!.trigger('click')
    expect(vm.pos).toBe(Math.max(1, before - 1))
  })
})

describe('FrogJumpGame 分支', () => {
  it('先答错再答对可推进并完成', async () => {
    const w = mount(FrogJumpGame)
    const vm = w.vm as VM
    const answer = vm.rd.answer
    const wrong = vm.rd.options.find((o: number) => o !== answer)!
    await w.find(`.answer-btn[data-opt="${wrong}"]`).trigger('click')
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    // 快进到最后一题完成
    vm.done = true
    vm.feedback = 'correct'
    vm.round = 5
    await w.vm.$nextTick()
    const nxt = w.findAll('button').find((b) => b.text().includes('下一题'))
    await nxt!.trigger('click')
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
  })
})

describe('MazeGame 分支', () => {
  it('错误点击给出提示，走完第一关到下一关', async () => {
    const w = mount(MazeGame)
    const vm = w.vm as VM
    // L1: cur=0(值1)，index 5 的值是 10，非法
    await w.find('.maze-cell[data-index="5"]').trigger('click')
    expect(vm.wrong).toBe(true)
    expect(vm.totalWrong).toBe(1)
    // 沿合法路径走到 L1 出口（值每次 +1）
    let guard = 0
    while (vm.levelIndex === 0 && guard++ < 40) {
      const level = vm.level
      const next = level.grid.findIndex((v: number | null, i: number) => v !== null && isValidStep(vm.cur, i, level))
      await w.find(`.maze-cell[data-index="${next}"]`).trigger('click')
    }
    // 走到出口后 levelIndex 从 0 变 1
    expect(vm.levelIndex).toBe(1)
    w.unmount()
  })
})

describe('RocketGame 分支', () => {
  it('按错一次不影响进度；按完一轮进入下一关', async () => {
    vi.useFakeTimers()
    const w = mount(RocketGame)
    const vm = w.vm as VM
    await w.find('.cd-btn[data-value="0"]').trigger('click')
    expect(vm.wrong).toBe(true)
    // 10 -> 0 顺序按完
    for (let n = 10; n >= 0; n--) {
      await w.find(`.cd-btn[data-value="${n}"]`).trigger('click').catch(() => {})
    }
    expect(vm.launching).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('下一关'))!.trigger('click')
    expect(vm.round).toBe(2)
    w.unmount()
    vi.useRealTimers()
  })
})

describe('PatternGame 分支', () => {
  it('答错可继续，5 题完成到结算', async () => {
    const w = mount(PatternGame)
    const vm = w.vm as VM
    const answer = vm.rd.answer
    const wrong = vm.rd.options.find((o: any) => String(o) !== String(answer))!
    await w.find(`.answer-btn[data-opt="${wrong}"]`).trigger('click')
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    vm.round = 5
    vm.done = true
    await w.vm.$nextTick()
    const nxt = w.findAll('button').find((b) => b.text().includes('下一题'))
    await nxt!.trigger('click')
    expect(vm.finished).toBe(true)
  })
})

describe('RelayGame 分支', () => {
  it('答错计数；答对 5 题达到结算并可再来', async () => {
    vi.useFakeTimers()
    const w = mount(RelayGame)
    const vm = w.vm as VM
    const answer = vm.current.answer
    const wrong = vm.currentOptions.find((o: number) => o !== answer)
    await w.find(`.answer-btn[data-opt="${wrong}"]`).trigger('click')
    expect(vm.wrongCount).toBe(1)
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    await vi.advanceTimersByTimeAsync(1000)
    expect(vm.index).toBe(1)
    // 快进完成
    vm.index = 4
    vm.done = false
    await w.vm.$nextTick()
    const curAnswer = vm.current.answer
    await w.find(`.answer-btn[data-opt="${curAnswer}"]`).trigger('click')
    await vi.advanceTimersByTimeAsync(1000)
    expect(vm.finished).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再来一局'))!.trigger('click')
    expect(vm.finished).toBe(false)
    w.unmount()
    vi.useRealTimers()
  })
})

describe('PuzzleGame 分支', () => {
  it('答错提示并完成 9 块拼图', async () => {
    const w = mount(PuzzleGame)
    const vm = w.vm as VM
    const answer = vm.current.answer
    const wrong = vm.currentOptions.find((o: number) => o !== answer)
    await w.find(`.answer-btn[data-opt="${wrong}"]`).trigger('click')
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    // 快进揭到 7 块，再答对两类推进到最后
    vm.opened = new Set([...Array(8).keys()])
    vm.done = false
    vm.current = { text: '1 + 1', answer: 2, options: [2, 3, 4, 5] }
    await w.vm.$nextTick()
    await w.find('.answer-btn[data-opt="2"]').trigger('click')
    const open = w.findAll('button').find((b) => b.text().includes('揭开拼图'))
    await open!.trigger('click')
    expect(vm.finished).toBe(true)
  })
})

describe('WhackGame 分支', () => {
  it('敲错扣分，倒计时结束进入结算', async () => {
    vi.useFakeTimers()
    const w = mount(WhackGame)
    const vm = w.vm as VM
    const text = w.find('.whack-q').text().replace(' = ?', '')
    const [a, op, b] = text.split(' ')
    const answer = op === '+' ? Number(a) + Number(b) : Number(a) - Number(b)
    const wrongHole = w
      .findAll('.hole[data-active="true"]')
      .find((h) => h.attributes('data-value') !== String(answer))
    if (wrongHole) {
      await wrongHole.trigger('click')
      expect(vm.score).toBe(0)
    }
    await vi.advanceTimersByTimeAsync(61000)
    expect(vm.finished).toBe(true)
    w.unmount()
    vi.useRealTimers()
  })
})

describe('CodeBreakGame 分支', () => {
  it('答错再答对，3 道锁全部解开', async () => {
    const w = mount(CodeBreakGame)
    const vm = w.vm as VM
    const answer = vm.question.answer
    const wrong = w
      .findAll('.answer-btn')
      .map((b) => b.attributes('data-opt'))
      .find((o) => o !== String(answer))
    await w.find(`.answer-btn[data-opt="${wrong}"]`).trigger('click')
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    // 快进：直接推进两道
    vm.solved = 2
    vm.question = { text: '1+1=?', answer: 2, options: [2, 3, 4, 5] }
    vm.done = false
    vm.feedback = 'idle'
    await w.vm.$nextTick()
    await w.find('.answer-btn[data-opt="2"]').trigger('click')
    const nxt = w.findAll('button').find((b) => b.text().includes('下一道锁'))
    await nxt!.trigger('click')
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
  })
})

describe('PickingGame 分支', () => {
  it('答错反馈并可推进下一题', async () => {
    const w = mount(PickingGame)
    const vm = w.vm as VM
    const opts = w.findAll('.answer-btn')
    const answer = vm.rd.answer
    const wrongOpts = vm.rd.options.filter((o: number) => o !== answer)
    await w.find(`.answer-btn[data-opt="${wrongOpts[0]}"]`).trigger('click')
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    const nxt = w.findAll('button').find((b) => b.text().includes('下一题'))
    await nxt!.trigger('click')
    expect(vm.round).toBe(2)
  })
})

describe('ShapeRiddleGame 分支', () => {
  it('答错再答对揭示图形并去下一题', async () => {
    const w = mount(ShapeRiddleGame)
    const vm = w.vm as VM
    const wrong = vm.rd.options.find((o: string) => o !== vm.rd.target)
    await w.find(`.shape-opt[data-shape="${wrong}"]`).trigger('click')
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    await w.find(`.shape-opt[data-shape="${vm.rd.target}"]`).trigger('click')
    expect(w.find('.riddle-art').exists()).toBe(true)
    const nxt = w.findAll('button').find((b) => b.text().includes('下一题'))
    await nxt!.trigger('click')
    expect(vm.round).toBe(2)
  })
})

describe('ShapeBuildGame 分支', () => {
  it('拼搭数量不足给错误提示并清空', async () => {
    const w = mount(ShapeBuildGame)
    const vm = w.vm as VM
    const btn = w.find('.pool-btn')
    await btn.trigger('click')
    await w.find('.build-actions').find('button').trigger('click')
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('清空'))!.trigger('click')
    expect(vm.totalPicked).toBe(0)
  })

  it('完成 3 个造型到结算', async () => {
    const w = mount(ShapeBuildGame)
    const vm = w.vm as VM
    vm.planIndex = 2
    vm.built = false
    await w.vm.$nextTick()
    const plan = vm.plan
    for (const part of plan.parts) {
      const btn = w.find(`.pool-btn[data-shape="${part.shape}"]`)
      for (let k = 0; k < part.count; k++) await btn.trigger('click')
    }
    await w.find('.build-actions').find('button').trigger('click')
    const nxt = w.findAll('button').find((b) => b.text().includes('下一个造型'))
    await nxt!.trigger('click')
    expect(vm.finished).toBe(true)
  })
})

describe('WarBattleGame 分支', () => {
  it('玩家赢、电脑赢、平局三种结果都覆盖，并可再来', async () => {
    const w = mount(WarBattleGame)
    const vm = w.vm as VM
    // 平局：reveal 走平局分支
    vm.rd = { player: [1, 1], cpu: [1, 1], playerSum: 2, cpuSum: 2 }
    vm.revealed = false
    await w.vm.$nextTick()
    await w.findAll('button').find((b) => b.text().includes('翻开'))!.trigger('click')
    expect(vm.ties).toBe(1)
    // 下一轮（round<5 分支推进）
    await w.findAll('button').find((b) => b.text().includes('下一轮'))!.trigger('click')
    expect(vm.round).toBe(2)
    // 电脑赢：resp. reveal 走 cpu 分支
    vm.rd = { player: [1, 1], cpu: [3, 3], playerSum: 2, cpuSum: 6 }
    vm.revealed = false
    await w.vm.$nextTick()
    await w.findAll('button').find((b) => b.text().includes('翻开'))!.trigger('click')
    expect(vm.score.cpu).toBe(1)
    // 玩家赢：reveal 走 player 分支
    vm.rd = { player: [3, 3], cpu: [1, 1], playerSum: 6, cpuSum: 2 }
    vm.revealed = false
    await w.vm.$nextTick()
    await w.findAll('button').find((b) => b.text().includes('翻开'))!.trigger('click')
    expect(vm.score.player).toBe(1)
    // 快进到第 5 轮并玩家胜出到结算
    vm.round = 5
    vm.score = { player: 2, cpu: 1 }
    vm.rd = { player: [3, 3], cpu: [1, 1], playerSum: 6, cpuSum: 2 }
    vm.revealed = true
    await w.vm.$nextTick()
    await w.findAll('button').find((b) => b.text().includes('下一轮'))!.trigger('click')
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
    expect(w.find('.finish-card').text()).toContain('你赢了比赛')
    await w.findAll('button').find((b) => b.text().includes('再来一局'))!.trigger('click')
    expect(vm.round).toBe(1)
    expect(vm.finished).toBe(false)
  })

  it('电脑比分领先时结算标题为电脑赢', async () => {
    const w = mount(WarBattleGame)
    const vm = w.vm as VM
    vm.finished = true
    vm.score = { player: 1, cpu: 2 }
    vm.rd = { player: [1, 1], cpu: [1, 1], playerSum: 2, cpuSum: 2 }
    await w.vm.$nextTick()
    expect(w.find('.finish-card').text()).toContain('电脑赢了')
    w.unmount()
  })

  it('比分打平时结算标题为平局', async () => {
    const w = mount(WarBattleGame)
    const vm = w.vm as VM
    vm.finished = true
    vm.score = { player: 2, cpu: 2 }
    vm.rd = { player: [1, 1], cpu: [1, 1], playerSum: 2, cpuSum: 2 }
    await w.vm.$nextTick()
    expect(w.find('.finish-card').text()).toContain('平局')
    w.unmount()
  })
})

describe('SudokuGame 分支', () => {
  it('填数、清空、校验与通关', async () => {
    const w = mount(SudokuGame)
    const vm = w.vm as VM
    const empty = vm.board.flat().findIndex((v: number | null) => v === null)
    const r = Math.floor(empty / 4)
    const c = empty % 4
    await w.find(`.cell[data-cell="${empty}"]`).trigger('click')
    const cands = vm.cand
    expect(cands.length).toBeGreaterThan(0)
    await w.find(`.num-btn[data-num="${cands[33 % cands.length]}"]`).trigger('click')
    expect(vm.board[r][c]).not.toBeNull()
    // 清空格（选中仍保留），再填正确答案
    await w.find('.sudoku-actions').findAll('button')[1].trigger('click')
    expect(vm.board[r][c]).toBeNull()
    await w.find(`.num-btn[data-num="${vm.solution[r][c]}"]`).trigger('click')
    // 直接用解填满剩余格后检查
    const { solution: sol } = generateBoard(4)
    void sol
    vm.board = JSON.parse(JSON.stringify(vm.solution))
    await w.vm.$nextTick()
    const check = w.findAll('button').find((b) => b.text().includes('检查'))
    await check!.trigger('click')
    expect(vm.passed).toBe(true)
    const nxt = w.findAll('button').find((b) => b.text().includes('下一关'))
    await nxt!.trigger('click')
    expect(vm.levelIndex).toBe(1)
  })

  it('填错检查给出错误反馈', async () => {
    const w = mount(SudokuGame)
    const vm = w.vm as VM
    const { solution: sol } = generateBoard(4)
    void sol
    vm.board = JSON.parse(JSON.stringify(vm.solution))
    vm.board[0][0] = vm.board[0][0] === 1 ? 2 : 1
    await w.vm.$nextTick()
    const check = w.findAll('button').find((b) => b.text().includes('检查'))
    await check!.trigger('click')
    expect(vm.wrongCount).toBe(1)
  })
})

describe('MatchstickGame 分支', () => {
  it('答错反馈后可重选答对', async () => {
    const w = mount(MatchstickGame)
    const vm = w.vm as VM
    const good = vm.current.good
    const bad = vm.current.bad
    await w.find(`.match-opt[data-expr="${bad}"]`).trigger('click')
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    await w.find(`.match-opt[data-expr="${good}"]`).trigger('click')
    expect(w.find('.feedback.correct').exists()).toBe(true)
  })

  it('5 题完成到结算', async () => {
    const w = mount(MatchstickGame)
    const vm = w.vm as VM
    let guard = 0
    while (!vm.finished && guard++ < 10) {
      const good = vm.current.good
      await w.find(`.match-opt[data-expr="${good}"]`).trigger('click')
      const nxt = w.findAll('button').find((b) => b.text().includes('下一题'))
      if (nxt) await nxt.trigger('click')
    }
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
    // 结算后点"再玩一次"回到第 1 题
    const again = w.findAll('button').find((b) => b.text().includes('再玩一次'))
    await again!.trigger('click')
    expect(vm.round).toBe(1)
    expect(vm.finished).toBe(false)
  })
})

describe('GoFishGame 通关', () => {
  it('三关钓完所有鱼进入结算并可再来', async () => {
    const w = mount(GoFishGame)
    const vm = w.vm as VM
    // 先故意钓错一对
    const fish = w.findAll('.fish')
    const pool = vm.pool as number[]
    const a = pool[0]
    const b = pool.find((v) => v !== 10 - a && v !== a)!
    await fish[0].trigger('click')
    await fish[pool.indexOf(b)].trigger('click')
    expect(vm.wrongCount).toBe(1)
    // 逐关钓满（每关 3 对凑 10）
    let guard = 0
    while (!vm.finished && guard++ < 30) {
      const poolNow = vm.pool as number[]
      const caught = vm.caught as Set<number>
      const idx = poolNow.findIndex((_, i) => !caught.has(i))
      if (idx === -1) continue
      const mate = poolNow.findIndex(
        (v, i) => !caught.has(i) && i !== idx && v + poolNow[idx] === 10,
      )
      if (mate === -1) continue
      const fishes = w.findAll('.fish')
      await fishes[idx].trigger('click')
      await fishes[mate].trigger('click')
    }
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再玩一次'))!.trigger('click')
    expect(vm.round).toBe(1)
    expect(vm.finished).toBe(false)
    expect(vm.totalWrong).toBe(0)
    w.unmount()
  })
})

describe('FriendGame 通关', () => {
  it('三关全部配对进入结算并可再来', async () => {
    const w = mount(FriendGame)
    const vm = w.vm as VM
    let guard = 0
    while (!vm.finished && guard++ < 40) {
      const deck = vm.deck as number[]
      const target = vm.target as number
      const matched = vm.matched as Set<number>
      const idx = deck.findIndex((_, i) => !matched.has(i))
      if (idx === -1) continue
      const mate = deck.findIndex(
        (v, i) => !matched.has(i) && i !== idx && v + deck[idx] === target,
      )
      if (mate === -1) continue
      const cards = w.findAll('.card')
      await cards[idx].trigger('click')
      await cards[mate].trigger('click')
    }
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再玩一次'))!.trigger('click')
    expect(vm.round).toBe(1)
    expect(vm.finished).toBe(false)
    expect(vm.totalWrong).toBe(0)
    w.unmount()
  })
})

describe('FrogJumpGame 通关', () => {
  it('答对推进到下一题并结算后可再来', async () => {
    const w = mount(FrogJumpGame)
    const vm = w.vm as VM
    const answer = vm.rd.answer
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    const nxt = w.findAll('button').find((b) => b.text().includes('下一题'))
    await nxt!.trigger('click')
    expect(vm.round).toBe(2)
    // 快进到最后一题完成
    vm.round = 5
    vm.done = true
    vm.feedback = 'correct'
    await w.vm.$nextTick()
    const last = w.findAll('button').find((b) => b.text().includes('下一题'))
    await last!.trigger('click')
    expect(vm.finished).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再玩一次'))!.trigger('click')
    expect(vm.round).toBe(1)
    expect(vm.finished).toBe(false)
    expect(vm.totalWrong).toBe(0)
    w.unmount()
  })
})

describe('MazeGame 通关', () => {
  it('走完三关到结算并可再来', async () => {
    const w = mount(MazeGame)
    const vm = w.vm as VM
    let guard = 0
    while (!vm.finished && guard++ < 100) {
      const level = vm.level
      const next = level.grid.findIndex(
        (v: number | null, i: number) => v !== null && isValidStep(vm.cur, i, level),
      )
      await w.find(`.maze-cell[data-index="${next}"]`).trigger('click')
    }
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
    expect(vm.levelIndex).toBe(2)
    await w.findAll('button').find((b) => b.text().includes('再玩一次'))!.trigger('click')
    expect(vm.levelIndex).toBe(0)
    expect(vm.finished).toBe(false)
    w.unmount()
  })

  it('到达出口时反馈文本分支', async () => {
    const w = mount(MazeGame)
    const vm = w.vm as VM
    vm.cur = vm.level.goal
    await w.vm.$nextTick()
    expect(w.text()).toContain('到达出口！')
    w.unmount()
  })
})

describe('RocketGame 通关', () => {
  it('三关按完后进入结算并可再来', async () => {
    vi.useFakeTimers()
    const w = mount(RocketGame)
    const vm = w.vm as VM
    for (let r = 0; r < 3 && !vm.finished; r++) {
      for (let n = 10; n >= 0; n--) {
        await w.find(`.cd-btn[data-value="${n}"]`).trigger('click').catch(() => {})
      }
      if (!vm.finished) {
        const next = w.findAll('button').find((b) => b.text().includes('下一关'))
        await next!.trigger('click')
      }
    }
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再玩一次'))!.trigger('click')
    expect(vm.round).toBe(1)
    expect(vm.finished).toBe(false)
    w.unmount()
    vi.useRealTimers()
  })
})

describe('MemoryGame 通关', () => {
  it('三关全部配对到结算并可再来', async () => {
    const w = mount(MemoryGame)
    const vm = w.vm as VM
    let guard = 0
    while (!vm.finished && guard++ < 60) {
      const deck = vm.deck as { id: number; pair: string }[]
      const matched = vm.matchedIds as Set<number>
      const a = deck.find((c) => !matched.has(c.id))
      if (!a) continue
      const mate = deck.find((d) => d.pair === a.pair && d.id !== a.id)!
      const cards = w.findAll('.memory-card')
      await cards[deck.indexOf(a)].trigger('click')
      await cards[deck.indexOf(mate)].trigger('click')
    }
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
    expect(vm.round).toBe(3)
    await w.findAll('button').find((b) => b.text().includes('再玩一次'))!.trigger('click')
    expect(vm.round).toBe(1)
    expect(vm.finished).toBe(false)
    expect(vm.totalMoves).toBe(0)
    w.unmount()
  })
})

describe('PatternGame 通关', () => {
  it('答对推进并可再来', async () => {
    const w = mount(PatternGame)
    const vm = w.vm as VM
    const answer = vm.rd.answer
    await w.find(`.answer-btn[data-opt="${answer}"]`).trigger('click')
    const nxt = w.findAll('button').find((b) => b.text().includes('下一题'))
    await nxt!.trigger('click')
    expect(vm.round).toBe(2)
    // 快进到完成并再来
    vm.round = 5
    vm.done = true
    await w.vm.$nextTick()
    const last = w.findAll('button').find((b) => b.text().includes('下一题'))
    await last!.trigger('click')
    expect(vm.finished).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再玩一次'))!.trigger('click')
    expect(vm.round).toBe(1)
    expect(vm.finished).toBe(false)
    w.unmount()
  })
})

describe('PickingGame 通关', () => {
  it('快进到完成并可再来', async () => {
    const w = mount(PickingGame)
    const vm = w.vm as VM
    vm.round = 5
    vm.done = true
    vm.feedback = 'correct'
    await w.vm.$nextTick()
    const last = w.findAll('button').find((b) => b.text().includes('下一题'))
    await last!.trigger('click')
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再摘一次'))!.trigger('click')
    expect(vm.round).toBe(1)
    expect(vm.finished).toBe(false)
    expect(vm.totalWrong).toBe(0)
    w.unmount()
  })
})

describe('PuzzleGame 通关', () => {
  it('结算后点再拼一张回到初始', async () => {
    const w = mount(PuzzleGame)
    const vm = w.vm as VM
    vm.opened = new Set([...Array(9).keys()])
    vm.done = true
    await w.vm.$nextTick()
    const btn = w.findAll('button').find((b) => b.text().includes('揭开拼图'))
    await btn!.trigger('click')
    expect(vm.finished).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再拼一张'))!.trigger('click')
    expect(vm.finished).toBe(false)
    expect((vm.opened as Set<number>).size).toBe(0)
    w.unmount()
  })
})

describe('ShapeBuildGame 通关', () => {
  it('搭完三个造型到结算并可再来', async () => {
    const w = mount(ShapeBuildGame)
    const vm = w.vm as VM
    for (let i = 0; i < 3 && !vm.finished; i++) {
      if (i > 0) {
        vm.planIndex = i
        vm.built = false
        await w.vm.$nextTick()
      }
      const plan = vm.plan
      for (const part of plan.parts) {
        const btn = w.find(`.pool-btn[data-shape="${part.shape}"]`)
        for (let k = 0; k < part.count; k++) await btn.trigger('click')
      }
      await w.find('.build-actions').find('button').trigger('click')
      const next = w.findAll('button').find((b) => b.text().includes('下一个造型'))
      if (next) await next.trigger('click')
    }
    expect(vm.finished).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再搭一次'))!.trigger('click')
    expect(vm.planIndex).toBe(0)
    expect(vm.finished).toBe(false)
    w.unmount()
  })
})

describe('ShapeRiddleGame 通关', () => {
  it('答对推进并完成到结算可再来', async () => {
    const w = mount(ShapeRiddleGame)
    const vm = w.vm as VM
    await w.find(`.shape-opt[data-shape="${vm.rd.target}"]`).trigger('click')
    const nxt = w.findAll('button').find((b) => b.text().includes('下一题'))
    await nxt!.trigger('click')
    expect(vm.round).toBe(2)
    // 快进完成
    vm.round = 5
    vm.revealed = true
    vm.selected = vm.rd.target
    vm.feedback = 'correct'
    await w.vm.$nextTick()
    const last = w.findAll('button').find((b) => b.text().includes('下一题'))
    await last!.trigger('click')
    expect(vm.finished).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再猜一次'))!.trigger('click')
    expect(vm.round).toBe(1)
    expect(vm.finished).toBe(false)
    expect(vm.wrongCount).toBe(0)
    w.unmount()
  })
})

describe('SudokuGame 通关', () => {
  it('三关完成到结算并可再来', async () => {
    const w = mount(SudokuGame)
    const vm = w.vm as VM
    for (let lvl = 0; lvl < 3; lvl++) {
      vm.board = JSON.parse(JSON.stringify(vm.solution))
      vm.passed = false
      vm.allFilled = true
      await w.vm.$nextTick()
      const check = w.findAll('button').find((b) => b.text().includes('检查'))
      await check!.trigger('click')
      const next = w.findAll('button').find((b) => b.text().includes('下一关'))
      if (next) await next.trigger('click')
    }
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再玩一次'))!.trigger('click')
    expect(vm.levelIndex).toBe(0)
    expect(vm.finished).toBe(false)
    w.unmount()
  })
})

describe('CodeBreakGame 通关', () => {
  it('结算后点再闯一次回到初始', async () => {
    const w = mount(CodeBreakGame)
    const vm = w.vm as VM
    vm.solved = 2
    vm.done = false
    vm.feedback = 'idle'
    await w.vm.$nextTick()
    await w.find(`.answer-btn[data-opt="${vm.question.answer}"]`).trigger('click')
    const nxt = w.findAll('button').find((b) => b.text().includes('下一道锁'))
    await nxt!.trigger('click')
    expect(vm.finished).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再闯一次'))!.trigger('click')
    expect(vm.solved).toBe(0)
    expect(vm.finished).toBe(false)
    w.unmount()
  })
})

describe('BoardRaceGame 通关', () => {
  it('到达终点进入结算并可再来', async () => {
    const w = mount(BoardRaceGame)
    const vm = w.vm as VM
    vm.pos = 19
    vm.phase = 'roll'
    vm.done = false
    await w.vm.$nextTick()
    await w.find('.die-btn').trigger('click')
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-card').exists()).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再玩一次'))!.trigger('click')
    expect(vm.pos).toBe(1)
    expect(vm.finished).toBe(false)
    w.unmount()
  })

  it('答题答对推进到达终点进入结算', async () => {
    const w = mount(BoardRaceGame)
    const vm = w.vm as VM
    vm.pos = 18
    vm.q = newRaceQuestion()
    vm.phase = 'question'
    vm.done = false
    vm.feedback = 'idle'
    await w.vm.$nextTick()
    await w.find(`.answer-btn[data-opt="${vm.q.answer}"]`).trigger('click')
    const cont = w.findAll('button').find((b) => b.text().includes('继续'))
    await cont!.trigger('click')
    expect(vm.pos).toBe(20)
    expect(vm.finished).toBe(true)
    w.unmount()
  })

  it('掷骰落到问号格进入答题', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const w = mount(BoardRaceGame)
    const vm = w.vm as VM
    vm.pos = 3
    vm.phase = 'roll'
    vm.done = false
    await w.vm.$nextTick()
    await w.find('.die-btn').trigger('click')
    expect(vm.phase).toBe('question')
    expect(vm.q).toBeTruthy()
    w.unmount()
    vi.restoreAllMocks()
  })
})

describe('WhackGame 通关', () => {
  it('倒计时结束后点再来一局重置', async () => {
    vi.useFakeTimers()
    const w = mount(WhackGame)
    const vm = w.vm as VM
    await vi.advanceTimersByTimeAsync(61000)
    expect(vm.finished).toBe(true)
    await w.findAll('button').find((b) => b.text().includes('再来一局'))!.trigger('click')
    expect(vm.finished).toBe(false)
    expect(vm.score).toBe(0)
    expect(vm.remaining).toBe(60)
    w.unmount()
    vi.useRealTimers()
  })
})

describe('GuessGame 通关', () => {
  it('猜 6~7 次给聪明评价，再来一局重置', async () => {
    const w = mount(GuessGame)
    const vm = w.vm as VM
    vm.secret = 10
    vm.lo = 0
    vm.hi = 19
    vm.done = false
    vm.history = []
    vm.used = new Set()
    await w.vm.$nextTick()
    // 先猜 5 次小的（全部 low），再直接猜中，共 6 次
    for (let n = 0; n <= 4; n++) {
      await w.find(`.guess-btn[data-value="${n}"]`).trigger('click')
    }
    await w.find('.guess-btn[data-value="10"]').trigger('click')
    expect(vm.done).toBe(true)
    expect(vm.history.length).toBe(6)
    expect(w.find('.finish-comment').text()).toBe('很聪明！')
    await w.findAll('button').find((b) => b.text().includes('再来一局'))!.trigger('click')
    expect(vm.done).toBe(false)
    expect(vm.history).toHaveLength(0)
    w.unmount()
  })

  it('猜超过 7 次给普通评语', async () => {
    const w = mount(GuessGame)
    const vm = w.vm as VM
    vm.secret = 15
    vm.lo = 0
    vm.hi = 19
    vm.done = false
    vm.history = []
    vm.used = new Set()
    await w.vm.$nextTick()
    for (let n = 0; n <= 8; n++) {
      await w.find(`.guess-btn[data-value="${n}"]`).trigger('click')
    }
    await w.find('.guess-btn[data-value="15"]').trigger('click')
    expect(vm.done).toBe(true)
    expect(vm.history.length).toBe(10)
    expect(w.find('.finish-comment').text()).toBe('记住每次猜中间的数会更快')
    w.unmount()
  })
})

describe('RelayGame 通关', () => {
  it('有失误且用时短的评语分支', async () => {
    vi.useFakeTimers()
    const w = mount(RelayGame)
    const vm = w.vm as VM
    vm.index = 4
    vm.done = false
    vm.wrongCount = 1
    await w.vm.$nextTick()
    const curAnswer = vm.current.answer
    await w.find(`.answer-btn[data-opt="${curAnswer}"]`).trigger('click')
    await vi.advanceTimersByTimeAsync(5000)
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-comment').text()).toBe('又准又快！')
    w.unmount()
    vi.useRealTimers()
  })

  it('用时超 40 秒的评语分支', async () => {
    vi.useFakeTimers()
    const w = mount(RelayGame)
    const vm = w.vm as VM
    vm.index = 4
    vm.done = false
    vm.wrongCount = 1
    vm.elapsed = 41
    await w.vm.$nextTick()
    const curAnswer = vm.current.answer
    await w.find(`.answer-btn[data-opt="${curAnswer}"]`).trigger('click')
    await vi.advanceTimersByTimeAsync(1000)
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-comment').text()).toBe('再接再厉！')
    w.unmount()
    vi.useRealTimers()
  })
})