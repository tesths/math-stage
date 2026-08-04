<script setup lang="ts">
/**
 * 训练游戏：质数快抢（45 秒限时判断质数/合数）
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { isPrime } from '@/lib/engine/math'
import { playCorrect, playWrong, playWin } from '@/lib/sound'

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeNumber(): number {
  // 约一半质数一半合数
  return Math.random() < 0.5 ? randInt(2, 97) : randInt(4, 100)
}

const current = ref(makeNumber())
const score = ref(0)
const wrong = ref(0)
const timeLeft = ref(45)
const finished = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const isPrimeNum = computed(() => isPrime(current.value))

function judge(prime: boolean) {
  if (finished.value) return
  if (prime === isPrimeNum.value) {
    score.value++
    playCorrect()
  } else {
    wrong.value++
    playWrong()
  }
  current.value = makeNumber()
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      stopTimer()
      finished.value = true
      playWin()
    }
  }, 1000)
}
function stopTimer() {
  if (timer) clearInterval(timer)
  timer = null
}

onMounted(startTimer)
onBeforeUnmount(stopTimer)

function restart() {
  stopTimer()
  current.value = makeNumber()
  score.value = 0
  wrong.value = 0
  timeLeft.value = 45
  finished.value = false
  startTimer()
}
</script>

<template>
  <div class="game">
    <div v-if="finished" class="finish">
      <p class="finish-title">⏱️ 时间到！</p>
      <p class="finish-sub">
        答对 {{ score }} 题，答错 {{ wrong }} 题 · 得分 {{ Math.max(0, score * 10 - wrong * 5) }}
      </p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span class="timer">⏱️ {{ timeLeft }}s</span>
        <span class="score">得分 {{ Math.max(0, score * 10 - wrong * 5) }}</span>
      </div>

      <div class="number-card">
        <p class="big-num">{{ current }}</p>
      </div>

      <p class="ask">它是质数还是合数？</p>
      <div class="judge-btns">
        <UButton color="primary" size="xl" icon="i-heroicons-sparkles" @click="judge(true)">
          质数
        </UButton>
        <UButton color="secondary" size="xl" icon="i-heroicons-squares-2x2" @click="judge(false)">
          合数
        </UButton>
      </div>
      <p class="hint">质数：因数只有 1 和它本身（2、3、5、7、11…）</p>
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
.timer {
  font-weight: 700;
  color: var(--ui-primary);
}
.number-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-2xl);
  background: var(--ui-bg-muted);
  padding: 0.8rem 2.5rem;
}
.big-num {
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.ask {
  font-size: 1.05rem;
  color: var(--ui-text-highlighted);
}
.judge-btns {
  display: flex;
  gap: 1rem;
}
.hint {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
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
