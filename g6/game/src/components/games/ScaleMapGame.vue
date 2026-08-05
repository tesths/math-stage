<script setup lang="ts">
/**
 * 训练游戏：比例尺换算（图上距离 ↔ 实际距离）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  scaleDen: number
  cm: number
  actualM: number
  mode: 'fwd' | 'rev'
  answer: number
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): Round {
  const scaleDen = [1000, 2000, 5000, 10000][randInt(0, 3)]!
  const cm = randInt(1, 8)
  const actualM = (cm * scaleDen) / 100
  const mode = Math.random() < 0.5 ? 'fwd' : 'rev'
  return { scaleDen, cm, actualM, mode, answer: mode === 'fwd' ? actualM : cm }
}

const roundNo = ref(1)
const rd = ref<Round>(makeRound())
const score = ref(0)
const done = ref(false)
const finished = ref(false)

const answer = computed(() => rd.value.answer)
const expr = computed(() => {
  if (rd.value.mode === 'fwd') return `比例尺 1:${rd.value.scaleDen}，图上距离 ${rd.value.cm} 厘米，实际距离是多少米？`
  return `比例尺 1:${rd.value.scaleDen}，实际距离 ${rd.value.actualM} 米，图上距离是多少厘米？`
})
const hint = computed(() =>
  rd.value.mode === 'fwd'
    ? `${rd.value.cm} × ${rd.value.scaleDen} = ? 厘米，再换算成米`
    : `${rd.value.actualM} 米 = ? 厘米，再除以 ${rd.value.scaleDen}`,
)

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
      <p class="finish-title">🗺️ 比例尺换算过关！</p>
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
        <p class="hint">{{ hint }}</p>
      </div>

      <GameAnswerBar mode="input" :answer="answer" :label="rd.mode === 'fwd' ? '实际距离（米）' : '图上距离（厘米）'" @answered="onAnswered" />
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
  font-size: 1.3rem;
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
