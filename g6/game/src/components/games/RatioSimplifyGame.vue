<script setup lang="ts">
/**
 * 训练游戏：化简比（化成最简整数比）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import { gcd } from '@/lib/engine/math'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  a: string
  b: string
  answer: string
  options: string[]
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

const DECIMAL_RATIOS = [
  { a: '1.8', b: '0.09', ans: '20:1' },
  { a: '0.32', b: '0.8', ans: '2:5' },
  { a: '2.4', b: '1.6', ans: '3:2' },
  { a: '0.15', b: '0.05', ans: '3:1' },
  { a: '1.2', b: '0.3', ans: '4:1' },
]

function makeRound(): Round {
  let a = 0
  let b = 0
  let ans = ''
  let displayA = ''
  let displayB = ''
  if (Math.random() < 0.3) {
    const d = DECIMAL_RATIOS[randInt(0, DECIMAL_RATIOS.length - 1)]!
    displayA = d.a
    displayB = d.b
    ans = d.ans
  } else {
    a = randInt(4, 40)
    b = randInt(4, 40)
    const g = gcd(a, b)
    const n = a / g
    const m = b / g
    ans = `${n}:${m}`
    displayA = String(a)
    displayB = String(b)
  }
  const opts = new Set<string>([ans])
  let guard = 0
  while (opts.size < 4 && guard++ < 100) {
    const [n1 = 0, m1 = 0] = ans.split(':').map(Number)
    const v = `${n1 + randInt(1, 5)}:${m1}`
    if (!opts.has(v)) opts.add(v)
  }
  return { a: displayA, b: displayB, answer: ans, options: [...opts] }
}

const roundNo = ref(1)
const rd = ref<Round>(makeRound())
const score = ref(0)
const done = ref(false)
const finished = ref(false)

const answer = computed(() => rd.value.answer)
const options = computed(() => rd.value.options)

function onAnswered(correct: boolean) {
  done.value = true
  if (correct) score.value++
}
function next() {
  if (roundNo.value >= 5) {
    finished.value = true
    playWin()
    return
  }
  roundNo.value++
  rd.value = makeRound()
  done.value = false
}
function restart() {
  roundNo.value = 1
  score.value = 0
  done.value = false
  finished.value = false
  rd.value = makeRound()
}
</script>

<template>
  <div class="game">
    <div v-if="finished" class="finish">
      <p class="finish-title">✂️ 化简比过关！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="expr-card">
        <p class="expr">{{ rd.a }} : {{ rd.b }}</p>
        <p class="hint">化成最简整数比（前项、后项只有公因数 1）</p>
      </div>

      <GameAnswerBar :options="options" :answer="answer" @answered="onAnswered" />
      <UButton v-if="done" color="primary" size="lg" @click="next">
        {{ roundNo >= 5 ? '查看成绩' : '下一题' }}
      </UButton>
    </template>
  </div>
</template>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: 100%;
}
.game-top {
  display: flex;
  gap: 1.5rem;
  font-size: 0.95rem;
  color: var(--ui-text-muted);
}
.expr-card {
  text-align: center;
}
.expr {
  font-size: 2rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.hint {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  margin-top: 0.3rem;
}
.finish {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  padding: 2rem 0;
}
.finish-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.finish-sub {
  color: var(--ui-text-muted);
}
</style>
