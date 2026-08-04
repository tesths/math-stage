<script setup lang="ts">
/**
 * 训练游戏：面积单位换算（平方米 / 公顷 / 平方千米）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

type Unit = 'm²' | '公顷' | 'km²'

interface Round {
  value: number
  from: Unit
  to: Unit
  answer: number
  options: number[]
}

const TO_M2: Record<Unit, number> = { 'm²': 1, '公顷': 10000, 'km²': 1000000 }

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function nice(v: number): number {
  return Math.round(v * 10000) / 10000
}

function makeRound(): Round {
  const units: Unit[] = ['m²', '公顷', 'km²']
  const from = units[randInt(0, 2)]!
  let to = units[randInt(0, 2)]!
  if (to === from) to = units[(units.indexOf(from) + 1) % 3]!
  const value =
    from === 'm²' ? randInt(1, 500) * 100 : from === '公顷' ? randInt(1, 120) * 10 : randInt(1, 50)
  const answer = nice((value * TO_M2[from]) / TO_M2[to])
  const opts = new Set<number>([answer])
  let guard = 0
  while (opts.size < 3 && guard++ < 60) {
    const cands = [
      nice(answer * 10),
      nice(answer / 10),
      nice(answer * 100),
      nice(Math.max(0.01, answer + randInt(1, 50))),
    ]
    const c = cands[randInt(0, cands.length - 1)]!
    if (!opts.has(c)) opts.add(c)
  }
  return { value, from, to, answer, options: [...opts].sort((x, y) => x - y) }
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
      <p class="finish-title">📏 单位换算高手！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="question-card">
        <p class="expr">{{ rd.value }} {{ rd.from }} = ? {{ rd.to }}</p>
        <p class="hint">1 公顷 = 10000 m² · 1 km² = 100 公顷 = 1000000 m²</p>
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
.question-card {
  text-align: center;
}
.expr {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.hint {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  margin-top: 0.4rem;
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
