<script setup lang="ts">
/**
 * 训练游戏：三位数拼一拼（几个百、几个十、几个一）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  h: number
  t: number
  o: number
  answer: number
  options: number[]
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): Round {
  const h = randInt(1, 9)
  const t = randInt(0, 9)
  const o = randInt(0, 9)
  const answer = h * 100 + t * 10 + o
  const opts = new Set<number>([answer])
  let guard = 0
  while (opts.size < 4 && guard++ < 80) {
    const variant =
      [answer + 1, answer - 1, answer + 10, answer - 10, answer + 100, answer - 100, o * 100 + h * 10 + t][
        randInt(0, 6)
      ]!
    if (variant > 0 && !opts.has(variant)) opts.add(variant)
  }
  return { h, t, o, answer, options: [...opts].sort((m, n) => m - n) }
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
      <p class="finish-title">🧱 三位数拼图过关！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="expr-card">
        <p class="expr">{{ rd.h }} 个百、{{ rd.t }} 个十、{{ rd.o }} 个一组成？</p>
        <p class="hint">{{ rd.h }}×100 + {{ rd.t }}×10 + {{ rd.o }}</p>
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
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.hint {
  font-size: 1rem;
  color: var(--ui-text-muted);
  margin-top: 0.3rem;
  font-family: ui-monospace, monospace;
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
