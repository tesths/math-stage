<script setup lang="ts">
/**
 * 训练游戏：七巧板拼图（选哪几块板可以拼成目标图形）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  shape: string
  icon: string
  answer: string
  options: string[]
}

const COMBOS = ['①②号板', '③④⑤号板', '①③⑤⑦号板', '④⑤⑥⑦号板', '②③⑥号板']

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

const SHAPES: { shape: string; icon: string; answer: string }[] = [
  { shape: '长方形', icon: '▭', answer: '③④⑤号板' },
  { shape: '平行四边形', icon: '▱', answer: '③④⑤号板' },
  { shape: '三角形', icon: '△', answer: '①③⑤⑦号板' },
  { shape: '正方形', icon: '□', answer: '①②号板' },
]

function makeRound(): Round {
  const base = SHAPES[randInt(0, SHAPES.length - 1)]!
  const others = COMBOS.filter((c) => c !== base.answer)
  const options = [base.answer]
  const shuffled = [...others].sort(() => Math.random() - 0.5)
  for (let i = 0; options.length < 4 && i < shuffled.length; i++) {
    options.push(shuffled[i]!)
  }
  return { shape: base.shape, icon: base.icon, answer: base.answer, options: options.sort(() => Math.random() - 0.5) }
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
      <p class="finish-title">🧩 七巧板过关！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="expr-card">
        <p class="shape">{{ rd.icon }}</p>
        <p class="expr">用哪些板可以拼成{{ rd.shape }}？</p>
        <p class="hint">例如 ①号板、②号板完全一样</p>
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
.shape {
  font-size: 2.6rem;
  line-height: 1;
}
.expr {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  margin-top: 0.3rem;
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
