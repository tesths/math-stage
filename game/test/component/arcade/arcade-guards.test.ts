import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BalanceGame from '@/components/arcade/BalanceGame.vue'
import BoardRaceGame from '@/components/arcade/BoardRaceGame.vue'
import CodeBreakGame from '@/components/arcade/CodeBreakGame.vue'
import FriendGame from '@/components/arcade/FriendGame.vue'
import FrogJumpGame from '@/components/arcade/FrogJumpGame.vue'
import GoFishGame from '@/components/arcade/GoFishGame.vue'
import GuessGame from '@/components/arcade/GuessGame.vue'
import MatchstickGame from '@/components/arcade/MatchstickGame.vue'
import MatchstickDigit from '@/components/arcade/MatchstickDigit.vue'
import MazeGame from '@/components/arcade/MazeGame.vue'
import MemoryGame from '@/components/arcade/MemoryGame.vue'
import PatternGame from '@/components/arcade/PatternGame.vue'
import PickingGame from '@/components/arcade/PickingGame.vue'
import PuzzleGame from '@/components/arcade/PuzzleGame.vue'
import RelayGame from '@/components/arcade/RelayGame.vue'
import RocketGame from '@/components/arcade/RocketGame.vue'
import ShapeBuildGame from '@/components/arcade/ShapeBuildGame.vue'
import ShapeRiddleGame from '@/components/arcade/ShapeRiddleGame.vue'
import SudokuGame from '@/components/arcade/SudokuGame.vue'
import WarBattleGame from '@/components/arcade/WarBattleGame.vue'
import WhackGame from '@/components/arcade/WhackGame.vue'
import AddSubGame from '@/components/games/AddSubGame.vue'
import CountGame from '@/components/games/CountGame.vue'
import NumberLineGame from '@/components/games/NumberLineGame.vue'
import Shape3DGame from '@/components/games/Shape3DGame.vue'
import SplitGame from '@/components/games/SplitGame.vue'
import QuestionCard from '@/components/ui/QuestionCard.vue'
import { newBalanceRound } from '@/lib/arcade/balance'
import { isAnswerCorrect } from '@/lib/engine/checker'

type VM = Record<string, any>

describe('arcade 守卫分支', () => {
  it('BalanceGame：expr 模式渲染两堆、单堆兜底、done 后再选返回', async () => {
    const w = mount(BalanceGame)
    const vm = w.vm as VM
    vm.round = 2
    vm.rd = newBalanceRound(2)
    await w.vm.$nextTick()
    expect(w.findAll('.expr-group').length).toBe(2)
    vm.rd.leftParts = [3]
    await w.vm.$nextTick()
    expect(Array.isArray(vm.leftBUnits)).toBe(true)
    vm.rd.leftParts = []
    await w.vm.$nextTick()
    expect(vm.leftAUnits.length).toBe(0)
    expect(vm.leftBUnits.length).toBe(0)
    vm.done = true
    await vm.onSelect(0)
    expect(vm.selected).toBeNull()
    w.unmount()
  })

  it('BoardRaceGame：结束后掷骰返回、答对后再答返回、掷出结果展示', async () => {
    const w = mount(BoardRaceGame)
    const vm = w.vm as VM
    vm.finished = true
    await vm.roll()
    vm.finished = false
    vm.phase = 'roll'
    vm.lastDie = 3
    await w.vm.$nextTick()
    expect(w.find('.die-result').text()).toContain('3')
    vm.phase = 'question'
    vm.q = { a: 1, b: 2, op: '+', answer: 3, options: [2, 3, 4, 5], text: '1+2=?' }
    vm.done = true
    await vm.onAnswer(3)
    w.unmount()
  })

  it('CodeBreakGame：done 后再选返回', async () => {
    const w = mount(CodeBreakGame)
    const vm = w.vm as VM
    vm.done = true
    await vm.onSelect(1)
    w.unmount()
  })

  it('FriendGame：错对后 popTimer 未清理即进下一关、重复点已选/已配对/第三张返回', async () => {
    vi.useFakeTimers()
    const w = mount(FriendGame)
    const vm = w.vm as VM
    // 先选一对错牌 → 设置 popTimer（900ms）
    const deck = vm.deck as number[]
    const target = vm.target as number
    const cards = w.findAll('.card')
    const a = 0
    let b = 1
    while (deck[a] + deck[b] === target) b++
    await cards[a].trigger('click')
    await cards[b].trigger('click')
    // popTimer 未触发前点已选牌 → selected.includes 守卫返回
    await cards[b].trigger('click')
    // 点第三张（selected 仍为 2 张）→ length===2 守卫返回
    const c = (b + 1) % deck.length
    await cards[c].trigger('click')
    // 触发 popTimer 清空 selected（popTimer 变量仍持有已触发的 id）
    await vi.advanceTimersByTimeAsync(900)
    // 配对完成第 1 关 → startRound 走 if (popTimer) clearTimeout 分支
    let guard = 0
    while (vm.round === 1 && guard++ < 20) {
      const dk = vm.deck as number[]
      const t = vm.target as number
      const matched = vm.matched as Set<number>
      const i = dk.findIndex((_, idx) => !matched.has(idx))
      const j = dk.findIndex((v, idx) => !matched.has(idx) && idx !== i && v + dk[i] === t)
      const cs = w.findAll('.card')
      await cs[i].trigger('click')
      await cs[j].trigger('click')
      // 点已配对的牌 → matched.has() 守卫
      await vm.pick(i)
    }
    expect(vm.round).toBe(2)
    // finished 后 pick → 守卫返回
    vm.finished = true
    await vm.pick(0)
    w.unmount()
    vi.useRealTimers()
  })

  it('FrogJumpGame：done 后再选返回', async () => {
    const w = mount(FrogJumpGame)
    const vm = w.vm as VM
    vm.done = true
    await vm.onSelect(1)
    w.unmount()
  })

  it('GoFishGame：firstValue 空串分支、点已钓/钩住的鱼返回', async () => {
    const w = mount(GoFishGame)
    const vm = w.vm as VM
    expect(vm.firstValue).toBe('')
    const pool = vm.pool as number[]
    const fishes = w.findAll('.fish')
    await fishes[0].trigger('click') // first = 0
    await fishes[0].trigger('click') // i === first → 返回
    const mate = pool.findIndex((v, i) => i !== 0 && v + pool[0] === 10)
    await fishes[mate].trigger('click') // 配对成功
    await fishes[mate].trigger('click') // 已钓 → 返回
    w.unmount()
  })

  it('GuessGame：done 后再猜返回、猜大走 high 分支', async () => {
    const w = mount(GuessGame)
    const vm = w.vm as VM
    vm.secret = 10
    vm.done = false
    await w.find('.guess-btn[data-value="15"]').trigger('click')
    expect(vm.hi).toBe(14)
    vm.done = true
    await vm.guess(3)
    w.unmount()
  })

  it('MatchstickGame：done 后再选返回、含减号算式渲染 −', async () => {
    const w = mount(MatchstickGame)
    const vm = w.vm as VM
    vm.questions = [{ bad: '7-2=5', good: '7-2=5', distractors: ['7-2=6'] }]
    vm.options = ['7-2=5', '7-2=6']
    vm.round = 1
    await w.vm.$nextTick()
    expect(w.findAll('.match-op').length).toBeGreaterThan(0)
    expect(w.text()).toContain('−')
    vm.done = true
    await vm.onSelect(vm.current.good)
    w.unmount()
  })

  it('MatchstickDigit：未知字符兜底为空', () => {
    const w = mount(MatchstickDigit, { props: { digit: 'x' } })
    expect(w.findAll('rect').length).toBe(0)
    w.unmount()
  })

  it('MazeGame：结束后点击返回、点当前格返回', async () => {
    const w = mount(MazeGame)
    const vm = w.vm as VM
    vm.finished = true
    await vm.step(0)
    vm.finished = false
    await w.vm.$nextTick()
    vm.cur = vm.level.start
    await w.find(`.maze-cell[data-index="${vm.cur}"]`).trigger('click')
    expect(vm.visited.size).toBe(1)
    w.unmount()
  })

  it('MemoryGame：翻错后 flipTimer 未清理即进下一关、翻已配对/已翻/第三张返回', async () => {
    vi.useFakeTimers()
    const w = mount(MemoryGame)
    const vm = w.vm as VM
    const deck = vm.deck as { id: number; pair: string }[]
    const cards = w.findAll('.memory-card')
    const a = deck[0]
    const b = deck.find((c) => c.pair !== a.pair)!
    await cards[deck.indexOf(a)].trigger('click')
    await cards[deck.indexOf(b)].trigger('click') // 错对 → flipTimer
    // flipTimer 未触发前点已翻的卡 → isFaceUp 守卫返回
    await cards[deck.indexOf(b)].trigger('click')
    // 点第三张（flipped 仍为 2 张）→ length===2 守卫返回
    const c = deck.find((d) => d.id !== a.id && d.id !== b.id)!
    await cards[deck.indexOf(c)].trigger('click')
    // 触发 flipTimer 清空 flipped（flipTimer 变量仍持有已触发的 id）
    await vi.advanceTimersByTimeAsync(800)
    // 配对完成第 1 关 → startRound 走 if (flipTimer) clearTimeout 分支
    let guard = 0
    while (vm.round === 1 && guard++ < 20) {
      const dk = vm.deck as { id: number; pair: string }[]
      const matched = vm.matchedIds as Set<number>
      const i = dk.find((d) => !matched.has(d.id))!
      const j = dk.find((d) => d.pair === i.pair && d.id !== i.id)!
      const cs = w.findAll('.memory-card')
      await cs[dk.indexOf(i)].trigger('click')
      await cs[dk.indexOf(j)].trigger('click')
      // 点已配对的卡 → 守卫返回
      await vm.flip(i)
    }
    expect(vm.round).toBe(2)
    // finished 后翻牌 → 守卫返回
    vm.finished = true
    await vm.flip(vm.deck[0])
    w.unmount()
    vi.useRealTimers()
  })

  it('PatternGame：done 后再选返回', async () => {
    const w = mount(PatternGame)
    const vm = w.vm as VM
    vm.done = true
    await vm.onSelect('x')
    w.unmount()
  })

  it('PickingGame：done 后再选返回、单次/两次摘果文案', async () => {
    const w = mount(PickingGame)
    const vm = w.vm as VM
    vm.rd.picks = [2]
    await w.vm.$nextTick()
    expect(vm.questionText).not.toContain('又摘')
    vm.rd.picks = [2, 3]
    await w.vm.$nextTick()
    expect(vm.questionText).toContain('又摘 3 个')
    // rd 为空时 questionText 兜底返回空串
    vm.rd = null
    expect(vm.questionText).toBe('')
    vm.done = true
    await vm.onSelect(0)
    w.unmount()
  })

  it('PuzzleGame：done 后再选返回', async () => {
    const w = mount(PuzzleGame)
    const vm = w.vm as VM
    vm.done = true
    await vm.onSelect(1)
    w.unmount()
  })

  it('RelayGame：无当前题空选项、零失误评语、定时器重复启动清理', async () => {
    vi.useFakeTimers()
    // 空链 → current 为 undefined、currentOptions 为空、onSelect 守卫
    const w0 = mount(RelayGame)
    const vm0 = w0.vm as VM
    vm0.chain = []
    await w0.vm.$nextTick()
    expect(vm0.currentOptions).toEqual([])
    await vm0.onSelect(1)
    w0.unmount()
    // 零失误完赛 + restart 走 if (timer) clearInterval 分支（timer 仍在跑）
    const w = mount(RelayGame)
    const vm = w.vm as VM
    await vm.restart()
    vm.index = 4
    vm.done = false
    vm.wrongCount = 0
    await w.vm.$nextTick()
    const curAnswer = vm.current.answer
    await w.find(`.answer-btn[data-opt="${curAnswer}"]`).trigger('click')
    await vi.advanceTimersByTimeAsync(1000)
    expect(vm.finished).toBe(true)
    expect(w.find('.finish-comment').text()).toBe('零失误，太棒了！')
    await vm.onSelect(curAnswer) // done 后 → 守卫返回
    w.unmount()
    vi.useRealTimers()
  })

  it('RocketGame：按已按过的数返回、结束后按返回', async () => {
    const w = mount(RocketGame)
    const vm = w.vm as VM
    await w.find('.cd-btn[data-value="10"]').trigger('click')
    await w.find('.cd-btn[data-value="10"]').trigger('click') // doneSet 已有 → 返回
    vm.finished = true
    await vm.press(5)
    w.unmount()
  })

  it('ShapeBuildGame：搭完后点零件/确认返回、零件不齐时确认计数兜底', async () => {
    const w = mount(ShapeBuildGame)
    const vm = w.vm as VM
    vm.built = true
    await vm.pick('立方体')
    await vm.confirm()
    w.unmount()
    // 选齐第 1 个零件数量再确认 → every 遍历到缺失零件走 ?? 0 兜底
    const w2 = mount(ShapeBuildGame)
    const vm2 = w2.vm as VM
    for (let n = 0; n < vm2.plan.parts[0].count; n++) {
      await vm2.pick(vm2.plan.parts[0].shape)
    }
    await vm2.confirm()
    expect(vm2.wrongCount).toBe(1)
    w2.unmount()
  })

  it('ShapeRiddleGame：揭示后再选返回', async () => {
    const w = mount(ShapeRiddleGame)
    const vm = w.vm as VM
    await w.find(`.shape-opt[data-shape="${vm.rd.target}"]`).trigger('click')
    expect(vm.revealed).toBe(true)
    await vm.onSelect(vm.rd.target) // revealed 后 → 守卫返回
    w.unmount()
  })

  it('SudokuGame：固定格/重复格/无选中/已通过/未填满守卫', async () => {
    const w = mount(SudokuGame)
    const vm = w.vm as VM
    // 未选中时访问候选 → 空数组分支
    vm.selected = null
    expect(vm.cand).toEqual([])
    expect(vm.selectedRow).toBe(-1)
    expect(vm.selectedCol).toBe(-1)
    // 点固定格 → 返回
    const fixed = [...vm.fixedSet][0]
    await vm.pickCell(fixed)
    expect(vm.selected).toBeNull()
    // 正常格选中两次 → 取消
    const emptyIdx = vm.board.flat().findIndex((v: number | null) => v === null)
    await vm.pickCell(emptyIdx)
    expect(vm.selected).toBe(emptyIdx)
    await vm.pickCell(emptyIdx)
    expect(vm.selected).toBeNull()
    // 未选中填数 → 返回
    await vm.fill(1)
    // 未选中清空 → 返回
    await vm.clearCell()
    // 未填满点检查 → 返回
    await vm.check()
    expect(vm.wrongCount).toBe(0)
    // 已通过后再点检查 → 返回
    vm.board = JSON.parse(JSON.stringify(vm.solution))
    vm.passed = true
    await vm.check()
    w.unmount()
  })

  it('WarBattleGame：重复翻开返回', async () => {
    const w = mount(WarBattleGame)
    const vm = w.vm as VM
    await vm.reveal()
    await vm.reveal()
    w.unmount()
  })

  it('WhackGame：评语档位、restart 清理定时器、结束后敲返回', async () => {
    vi.useFakeTimers()
    const w = mount(WhackGame)
    const vm = w.vm as VM
    vm.score = 320
    expect(vm.comment).toBe('打鼠冠军！')
    vm.score = 200
    expect(vm.comment).toBe('手真快！')
    await vm.restart() // tick/roundTimer 存在 → 清理分支
    vm.finished = true
    await vm.hit(3)
    w.unmount()
    vi.useRealTimers()
  })
})

describe('games 守卫分支', () => {
  const q = (over: object): any => ({
    id: 't', chapter: 'c2', source: '例题', page: 12, title: 't', prompt: 'p',
    type: 'addsub', config: { type: 'addsub', a: 3, b: 2, op: '+', answer: 5, emoji: '🍎', options: [4, 5, 6] },
    ...over,
  })

  it('AddSubGame：答对后再选返回、答错反馈', async () => {
    const w = mount(AddSubGame, { props: { question: q({}) } })
    const vm = w.vm as VM
    await w.find('.answer-btn[data-opt="4"]').trigger('click')
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    await w.find('.answer-btn[data-opt="5"]').trigger('click')
    vm.done = true
    await vm.onSelect(5)
    w.unmount()
  })

  it('CountGame：write 分支 emoji 兜底、count 分支计数器为 0、done 后再选返回', async () => {
    const w1 = mount(CountGame, { props: { question: q({ type: 'write', config: { type: 'write', number: 13, hint: 'h', options: [12, 13], answer: 13 } }) } })
    const vm1 = w1.vm as VM
    expect(vm1.emojiStr).toBe('')
    expect(vm1.units).toEqual([])
    vm1.done = true
    await vm1.onSelect(13)
    w1.unmount()
    const w2 = mount(CountGame, { props: { question: q({}) } })
    const vm2 = w2.vm as VM
    expect(vm2.tens).toBe(0)
    expect(vm2.ones).toBe(0)
    w2.unmount()
  })

  it('NumberLineGame：序列题 done 后再选返回', async () => {
    const seqQ = q({ type: 'sequence', config: { type: 'sequence', answer: [1, 2, 3], options: [3, 1, 2] } })
    const w = mount(NumberLineGame, { props: { question: seqQ } })
    const vm = w.vm as VM
    expect(vm.seqButtons.length).toBe(3)
    vm.done = true
    await vm.onSelect(1)
    w.unmount()
  })

  it('Shape3DGame：done 后再选返回、销毁后动画守卫', async () => {
    const w = mount(Shape3DGame, { props: { question: q({ type: 'shape3d', config: { type: 'shape3d', shape: '圆柱', options: ['长方体', '圆柱'], answer: '圆柱' } }) } })
    const vm = w.vm as VM
    vm.renderer.dispose()
    vm.renderer.animate() // renderer 已置空 → 守卫返回
    vm.done = true
    await vm.onSelect('圆柱')
    w.unmount()
  })

  it('SplitGame：done 后再选返回', async () => {
    const w = mount(SplitGame, { props: { question: q({ type: 'split', config: { type: 'split', total: 6, given: 2, answer: 4, options: [3, 4, 5] } }) } })
    const vm = w.vm as VM
    vm.done = true
    await vm.onSelect(4)
    w.unmount()
  })

  it('QuestionCard：无 source 不渲染徽章、有 source 渲染', () => {
    const w1 = mount(QuestionCard, { props: { title: 't', prompt: 'p' }, global: { stubs: { UBadge: true } } })
    expect(w1.find('.q-title').text()).toBe('t')
    w1.unmount()
    const w2 = mount(QuestionCard, { props: { title: 't', prompt: 'p', source: '例题', page: 12 }, global: { stubs: { UBadge: true } } })
    expect(w2.text()).toContain('书页 12')
    w2.unmount()
  })

  it('checker：数字答案对字符串预期走混型分支', () => {
    const shapeQ = q({ type: 'shape3d', config: { type: 'shape3d', shape: '圆柱', options: ['长方体', '圆柱'], answer: '圆柱' } })
    expect(isAnswerCorrect(shapeQ, 5)).toBe(false)
  })
})
