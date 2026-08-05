<script setup lang="ts">
/**
 * 训练游戏：圆的周长与面积（π 取 3.14）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import { toFixed2 } from '@/lib/engine/math'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  kind: 'C-r' | 'C-d' | 'S-r' | 'S-d'
  r: number
  d: number
  answer: number
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): Round {
  const kind = ['C-r', 'C-d', 'S-r', 'S-d'][randInt(0, 3)] as Round['kind']
  let r = randInt(2, 20)
  let d = r * 2
  let answer = 0
  switch (kind) {
    case 'C-r':
      answer = 2 * 3.14 * r
      break
    case 'C-d':
      d = r * 2
      answer = 3.14 * d
      break
    case 'S-r':
      answer = 3.14 * r * r
      break
    case 'S-d':
      d = r * 2
      answer = 3.14 * r * r
      break
  }
  return { kind, r, d, answer: Number(toFixed2(answer)) }
}

const roundNo = ref(1)
const rd = ref<Round>(makeRound())
const score = ref(0)
const done = ref(false)
const finished = ref(false)

const answer = computed(() => rd.value.answer)
const label = computed(() => {
  const m = { 'C-r': '周长', 'C-d': '周长', 'S-r': '面积', 'S-d': '面积' }
  return m[rd.value.kind]!
})
const expr = computed(() => {
  if (rd.value.kind === 'C-r') return `半径 ${rd.value.r} 厘米的圆，周长是多少厘米？`
  if (rd.value.kind === 'C-d') return `直径 ${rd.value.d} 厘米的圆，周长是多少厘米？`
  if (rd.value.kind === 'S-r') return `半径 ${rd.value.r} 厘米的圆，面积是多少平方厘米？`
  return `直径 ${rd.value.d} 厘米的圆，面积是多少平方厘米？`
})
const hint = computed(() => {
  if (rd.value.kind === 'C-r') return `C = 2 × 3.14 × ${rd.value.r}`
  if (rd.value.kind === 'C-d') return `C = 3.14 × ${rd.value.d}`
  if (rd.value.kind === 'S-r') return `S = 3.14 × ${rd.value.r}²`
  return `S = 3.14 × (${rd.value.d}÷2)²`
})

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
      <p class="finish-title">⭕ 圆的计算过关！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="expr-card">
        <p class="expr">{{ expr }}</p>
        <p class="hint">{{ hint }}（保留两位小数）</p>
      </div>

      <GameAnswerBar mode="input" :answer="answer" :label="`${label}（保留两位小数）`" :input-min="0" :input-step="0.01" @answered="onAnswered" />
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
  font-size: 1.4rem;
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
