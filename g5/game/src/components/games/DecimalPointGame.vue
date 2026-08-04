<script setup lang="ts">
/**
 * 训练游戏：小数点搬家（×10 / ×100 / ×1000 或 ÷）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  base: number
  factor: number
  op: '×' | '÷'
  answer: number
  options: number[]
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}
function nice(v: number): number {
  return Math.round(v * 100000) / 100000
}

const BASES = [0.001, 0.01, 0.1, 0.36, 1.25, 7.2, 13.5, 0.08, 3.05, 100, 45]
const FACTORS = [10, 100, 1000]

function makeRound(): Round {
  const base = BASES[randInt(0, BASES.length - 1)]!
  const factor = FACTORS[randInt(0, 2)]!
  const op = Math.random() < 0.5 ? '×' : '÷'
  const answer = nice(op === '×' ? base * factor : base / factor)
  const opts = new Set<number>([answer])
  let guard = 0
  while (opts.size < 3 && guard++ < 60) {
    const variant = [answer * 10, answer / 10, nice(answer + 0.1), nice(answer - 0.1), nice(answer * 100)][randInt(0, 4)]!
    if (variant > 0 && !opts.has(variant)) opts.add(nice(variant))
  }
  return { base, factor, op, answer, options: [...opts].sort((x, y) => x - y) }
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
  if (correct) {
    score.value++
    playCorrect()
  }
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
      <p class="finish-title">➡️ 小数点搬家成功！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="expr-card">
        <p class="expr">{{ rd.base }} {{ rd.op }} {{ rd.factor }} = ?</p>
        <p class="hint">小数点{{ rd.op === '×' ? '向右' : '向左' }}移动 {{ String(rd.factor).length - 1 }} 位，位数不够用 0 补足</p>
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
