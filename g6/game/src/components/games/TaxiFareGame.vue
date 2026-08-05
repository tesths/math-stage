<script setup lang="ts">
/**
 * 训练游戏：出租车分段计费
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  km: number
  answer: number
  options: number[]
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}
function nice(v: number): number {
  return Math.round(v * 100) / 100
}
function fareOf(km: number): number {
  if (km <= 3) return 10
  return 10 + Math.ceil(km - 3) * 2.2
}

function makeRound(): Round {
  const km = [1, 2, 2.5, 3, 3.5, 4, 4.6, 5.5, 6.2, 7, 8, 9.5, 11, 12.8, 15][randInt(0, 14)]!
  const answer = nice(fareOf(km))
  const opts = new Set<number>([answer])
  let guard = 0
  while (opts.size < 4 && guard++ < 80) {
    const variant = nice(
      [answer + 2.2, answer - 2.2, answer + 4.4, answer - 4.4, answer + 1, answer - 1, answer * 2, answer / 2][
        randInt(0, 7)
      ]!,
    )
    if (variant > 0 && !opts.has(variant)) opts.add(variant)
  }
  return { km, answer, options: [...opts].sort((x, y) => x - y) }
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
      <p class="finish-title">🚕 出租车计费过关！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="expr-card">
        <p class="expr">行驶 {{ rd.km }} 千米，应付多少元？</p>
        <p class="hint">3 千米内 10 元；超出每千米 2.2 元，不足 1 千米按 1 千米算</p>
      </div>

      <GameAnswerBar :options="options" :answer="answer" label="车费（元）" @answered="onAnswered" />
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
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.hint {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  margin-top: 0.3rem;
  max-width: 24rem;
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
