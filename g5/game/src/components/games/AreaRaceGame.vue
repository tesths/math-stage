<script setup lang="ts">
/**
 * 训练游戏：面积速算（平行四边形 / 三角形 / 梯形）
 */
import { computed, ref } from 'vue'
import { areaOf, type AreaShape } from '@/lib/engine/math'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  shape: AreaShape
  a: number
  b: number
  h: number
  answer: number
  options: number[]
}

const SHAPES: AreaShape[] = ['parallelogram', 'triangle', 'trapezoid']
const SHAPE_NAMES: Record<AreaShape, string> = {
  parallelogram: '平行四边形',
  triangle: '三角形',
  trapezoid: '梯形',
}
const SHAPE_FORMULA: Record<AreaShape, string> = {
  parallelogram: 'S = 底 × 高',
  triangle: 'S = 底 × 高 ÷ 2',
  trapezoid: 'S = (上底 + 下底) × 高 ÷ 2',
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): Round {
  const shape = SHAPES[randInt(0, 2)]!
  const a = randInt(3, 12)
  const h = randInt(2, 9)
  const b = shape === 'trapezoid' ? a + randInt(2, 6) : 0
  const answer = areaOf(shape, { a, b, h })
  const opts = new Set<number>([answer])
  let guard = 0
  while (opts.size < 3 && guard++ < 50) {
    const delta = (randInt(1, 3) * (Math.random() < 0.5 ? -1 : 1))
    opts.add(Math.max(1, answer + delta))
  }
  const options = [...opts].sort((x, y) => x - y)
  return { shape, a, b, h, answer, options }
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
      <p class="finish-title">🏆 面积小达人！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="question-card">
        <p class="shape-name">{{ SHAPE_NAMES[rd.shape] }}</p>
        <p class="formula">{{ SHAPE_FORMULA[rd.shape] }}</p>
        <div class="dims">
          <span class="dim">底 = {{ rd.a }}</span>
          <span v-if="rd.shape === 'trapezoid'" class="dim">上底 = {{ rd.a }}</span>
          <span v-if="rd.shape === 'trapezoid'" class="dim">下底 = {{ rd.b }}</span>
          <span class="dim">高 = {{ rd.h }}</span>
        </div>
        <p class="ask">面积是多少？</p>
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
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  background: var(--ui-bg-muted);
  padding: 1rem 1.5rem;
  text-align: center;
  min-width: 16rem;
}
.shape-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.formula {
  font-size: 0.85rem;
  color: var(--ui-primary);
  font-weight: 600;
  margin-top: 0.2rem;
}
.dims {
  display: flex;
  gap: 0.7rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 0.6rem;
}
.dim {
  border-radius: 9999px;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  padding: 0.2rem 0.6rem;
  font-size: 0.85rem;
}
.ask {
  margin-top: 0.7rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
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
