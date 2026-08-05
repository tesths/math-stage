/**
 * 训练小游戏通用逻辑：出题、判分、过关
 * 每个游戏只需提供 makeRound() 生成一道题，即可获得完整的答题流程。
 */
import { ref, type Ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'

export interface QuizRound {
  /** 题干展示文本 */
  question: string
  /** 提示文字 */
  hint: string
  /** 正确答案 */
  answer: number | string
  /** 候选选项（mode=select 时必填） */
  options: (number | string)[]
  /** 答题模式：选项 / 输入 */
  mode?: 'select' | 'input'
  inputStep?: number
  inputMin?: number
  inputMax?: number
}

export interface QuizGame {
  roundNo: Ref<number>
  score: Ref<number>
  done: Ref<boolean>
  finished: Ref<boolean>
  rd: Ref<QuizRound>
  onAnswered: (correct: boolean) => void
  next: () => void
  restart: () => void
}

/** 生成 n 个互不重复的干扰选项（与正确答案比较时按字符串去重） */
export function buildOptions(answer: number | string, pool: (number | string)[], n = 3): (number | string)[] {
  const opts = new Set<string>([String(answer)])
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  for (const v of shuffled) {
    if (opts.size >= n) break
    opts.add(String(v))
  }
  while (opts.size < n) {
    opts.add(`#${Math.floor(Math.random() * 1e6)}`)
  }
  const list = [...opts].map((s) => (Number.isNaN(Number(s)) ? s : Number(s)))
  const allNumeric = list.every((v) => typeof v === 'number')
  return list.sort((a, b) => (allNumeric ? (a as number) - (b as number) : String(a).localeCompare(String(b), 'zh')))
}

export function useQuizGame(makeRound: () => QuizRound, total = 5): QuizGame {
  const roundNo = ref(1)
  const score = ref(0)
  const done = ref(false)
  const finished = ref(false)
  const rd = ref<QuizRound>(makeRound())

  function onAnswered(correct: boolean) {
    done.value = true
    if (correct) {
      score.value++
      playCorrect()
    }
  }

  function next() {
    if (roundNo.value >= total) {
      finished.value = true
      playWin()
      return
    }
    roundNo.value++
    done.value = false
    rd.value = makeRound()
  }

  function restart() {
    roundNo.value = 1
    score.value = 0
    done.value = false
    finished.value = false
    rd.value = makeRound()
  }

  return { roundNo, score, done, finished, rd, onAnswered, next, restart }
}
