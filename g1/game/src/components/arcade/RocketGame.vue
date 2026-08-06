<template>
  <div class="rocket-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ round }}/3 关</span>
      <p class="rocket-expect">
        {{ expect > 0 ? `下一个要按：${expect}` : '全部按对，点火发射！' }}
      </p>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🚀 发射成功！</p>
      <p class="finish-sub">共按错 {{ totalWrong }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div v-if="launching" class="launch-scene">
        <p class="launch-rocket">🚀</p>
        <p class="launch-text">发射！3、2、1…轰！</p>
        <UButton color="primary" size="lg" @click="afterLaunch">下一关</UButton>
      </div>
      <template v-else>
        <div class="countdown-grid">
          <button
            v-for="(v, i) in nums"
            :key="i"
            class="cd-btn"
            :class="{ lit: doneSet.has(v) }"
            :disabled="doneSet.has(v)"
            :data-value="v"
            @click="press(v)"
          >{{ v }}</button>
        </div>
        <p class="rocket-feedback" :class="{ err: wrong }">{{ feedbackText }}</p>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { buildCountdown } from '@/lib/arcade/rocket'
import { playCorrect, playWrong, playWin } from '@/lib/sound'

const round = ref(1)
const nums = ref<number[]>(buildCountdown(10))
const expect = ref(10)
const doneSet = ref<Set<number>>(new Set())
const wrong = ref(false)
const totalWrong = ref(0)
const finished = ref(false)
const launching = ref(false)

const feedbackText = computed(() =>
  wrong.value ? '按错啦！要按倒数的顺序' : '从大到小，一个一个按',
)

function startRound() {
  nums.value = buildCountdown(10)
  expect.value = 10
  doneSet.value = new Set()
  wrong.value = false
  launching.value = false
}

function press(v: number) {
  if (finished.value || launching.value || doneSet.value.has(v)) return
  if (v === expect.value) {
    doneSet.value = new Set([...doneSet.value, v])
    expect.value -= 1
    wrong.value = false
    playCorrect()
    if (expect.value < 0) {
      launching.value = true
      playWin()
    }
  } else {
    wrong.value = true
    totalWrong.value += 1
    playWrong()
  }
}

function afterLaunch() {
  if (round.value >= 3) {
    finished.value = true
  } else {
    round.value += 1
    startRound()
  }
}

function restart() {
  round.value = 1
  totalWrong.value = 0
  finished.value = false
  startRound()
}
</script>

<style scoped>
.rocket-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.game-top {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center;
  font-size: 1.05rem;
  color: var(--ui-text-muted);
}
.rocket-expect {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.countdown-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.7rem;
  max-width: 18rem;
  width: 100%;
}
.cd-btn {
  aspect-ratio: 1;
  font-size: 1.6rem;
  font-weight: bold;
  border-radius: 9999px;
  border: 2px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, background 0.15s;
}
.cd-btn:hover:not(:disabled) {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  transform: translateY(-3px);
}
.cd-btn.lit {
  background: var(--ui-color-primary-100);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  opacity: 0.8;
}
.cd-btn:disabled {
  cursor: default;
}
.rocket-feedback {
  min-height: 1.4rem;
  color: var(--ui-text-muted);
  font-size: 1.05rem;
}
.rocket-feedback.err {
  color: var(--ui-color-error-500);
  font-weight: 600;
}
.launch-scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 0;
}
.launch-rocket {
  font-size: 4.5rem;
  animation: rocket-up 1.6s ease-in-out infinite alternate;
}
.launch-text {
  color: var(--ui-text-highlighted);
  font-weight: bold;
  font-size: 1.2rem;
}
@keyframes rocket-up {
  0% { transform: translateY(0.6rem); }
  100% { transform: translateY(-1.2rem); }
}
.finish-card {
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
  margin-bottom: 0.6rem;
}
</style>