<script setup lang="ts">
/**
 * 训练游戏：算盘读数（上珠 1 颗表示 5）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  num: number
  rows: { upper: number; lower: number }[]
  options: number[]
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function split(n: number): [number, number, number] {
  return [Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10]
}

function makeRound(): Round {
  const num = randInt(5, 999)
  const [h, t, o] = split(num)
  const rows = [h, t, o].map((v) => ({ upper: v >= 5 ? 1 : 0, lower: v % 5 }))
  const opts = new Set<number>([num])
  let guard = 0
  while (opts.size < 4 && guard++ < 80) {
    const variant = [num + 1, num - 1, num + 10, num - 10, num + 100, num - 100, h * 100 + o * 10 + t][randInt(0, 6)]!
    if (variant > 0 && !opts.has(variant)) opts.add(variant)
  }
  return { num, rows, options: [...opts].sort((m, n) => m - n) }
}

const roundNo = ref(1)
const rd = ref<Round>(makeRound())
const score = ref(0)
const done = ref(false)
const finished = ref(false)

const answer = computed(() => rd.value.num)
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
      <p class="finish-title">🔢 算盘读数过关！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="expr-card">
        <svg viewBox="0 0 300 150" class="abacus-svg" role="img">
          <rect x="10" y="6" width="280" height="138" rx="8" class="aba-frame" />
          <line x1="10" y1="62" x2="290" y2="62" class="aba-beam" />
          <g v-for="(row, i) in rd.rows" :key="i">
            <line :x1="30 + i * 80" y1="10" :x2="30 + i * 80" y2="140" class="aba-rod" />
            <line :x1="46 + i * 80" y1="10" :x2="46 + i * 80" y2="140" class="aba-rod" />
            <circle v-if="row.upper" :cx="30 + i * 80" cy="34" r="13" class="aba-bead on" />
            <circle v-for="l in 4" :key="l" :cx="46 + i * 80" :cy="l * 20 + 86" r="13" class="aba-bead" :class="{ on: row.lower >= l }" />
            <text :x="30 + i * 80" y="75" class="aba-unit">{{ ['百', '十', '个'][i] }}</text>
          </g>
        </svg>
        <p class="hint">上珠 1 颗表示 5，下珠 1 颗表示 1</p>
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
.abacus-svg {
  width: 260px;
  max-width: 100%;
}
.aba-frame {
  fill: color-mix(in srgb, var(--ui-primary) 8%, var(--ui-bg));
  stroke: var(--ui-border-accented);
  stroke-width: 1.5;
}
.aba-beam {
  stroke: var(--ui-border-accented);
  stroke-width: 2;
}
.aba-rod {
  stroke: var(--ui-border-accented);
  stroke-width: 1;
}
.aba-bead {
  fill: var(--ui-bg);
  stroke: var(--ui-border-accented);
  stroke-width: 1.2;
}
.aba-bead.on {
  fill: var(--ui-primary);
  stroke: var(--ui-primary);
}
.aba-unit {
  fill: var(--ui-text-muted);
  font-size: 13px;
  font-weight: 700;
  text-anchor: middle;
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
