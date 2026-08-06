<template>
  <div class="gofish-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ round }}/3 关</span>
      <p class="gofish-target">钓两条鱼，数字相加等于 <strong>10</strong></p>
      <span v-if="first !== null" class="gofish-hook">已钓起 {{ firstValue }}</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🐟 鱼儿全部进篓啦！</p>
      <p class="finish-sub">共钓错 {{ totalWrong }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="pond">
        <button
          v-for="(v, i) in pool"
          :key="i"
          class="fish"
          :class="{ hooked: first === i, caught: caught.has(i) }"
          :data-value="v"
          :disabled="caught.has(i)"
          @click="pick(i)"
        >{{ v }}</button>
      </div>
      <p class="gofish-feedback">{{ feedback || '先钓一条鱼，再钓一条凑成 10' }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { buildFishPool } from '@/lib/arcade/gofish'
import { playCorrect, playWrong } from '@/lib/sound'

const round = ref(1)
const pool = ref<number[]>([])
const first = ref<number | null>(null)
const caught = ref<Set<number>>(new Set())
const wrongCount = ref(0)
const totalWrong = ref(0)
const feedback = ref('')
const finished = ref(false)

const firstValue = computed(() => (first.value === null ? '' : String(pool.value[first.value])))

function startRound() {
  pool.value = buildFishPool(10)
  first.value = null
  caught.value = new Set()
  wrongCount.value = 0
  feedback.value = ''
}

startRound()

function pick(i: number) {
  if (finished.value || caught.value.has(i) || i === first.value) return
  if (first.value === null) {
    first.value = i
    feedback.value = ''
    return
  }
  const a = pool.value[first.value]!
  const b = pool.value[i]!
  if (a + b === 10) {
    caught.value = new Set([...caught.value, first.value, i])
    first.value = null
    feedback.value = `${a} 和 ${b} 凑成 10，进篓！`
    playCorrect()
    if (caught.value.size === pool.value.length) {
      totalWrong.value += wrongCount.value
      if (round.value >= 3) {
        finished.value = true
      } else {
        round.value += 1
        startRound()
      }
    }
  } else {
    wrongCount.value += 1
    first.value = null
    feedback.value = `${a} + ${b} 不等于 10，换一条鱼再试试`
    playWrong()
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
.gofish-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.game-top {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  font-size: 1.05rem;
  color: var(--ui-text-muted);
  flex-wrap: wrap;
  justify-content: center;
}
.gofish-target {
  font-size: 1.3rem;
  color: var(--ui-text-highlighted);
  font-weight: 600;
}
.gofish-target strong {
  color: var(--ui-primary);
  font-size: 1.6rem;
}
.gofish-hook {
  color: var(--ui-primary);
  font-weight: 600;
}
.pond {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 21rem;
  width: 100%;
  background: var(--ui-color-sky-100);
  border-radius: 2rem;
  padding: 1.4rem;
}
.fish {
  aspect-ratio: 1;
  border-radius: 9999px;
  border: 2px solid var(--ui-border-accented);
  background: var(--ui-bg);
  font-size: 1.9rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
  cursor: pointer;
  box-shadow: var(--ui-shadow);
  transition: transform 0.15s, border-color 0.15s, background 0.15s;
}
.fish:hover:not(:disabled) {
  transform: translateY(-4px) rotate(-4deg);
  border-color: var(--ui-primary);
}
.fish.hooked {
  border-color: var(--ui-primary);
  background: var(--ui-color-primary-100);
  color: var(--ui-primary);
  transform: translateY(-6px);
}
.fish.caught {
  background: var(--ui-color-success-100);
  border-color: var(--ui-color-success-400);
  color: var(--ui-color-success-600);
  opacity: 0.85;
}
.fish:disabled {
  cursor: default;
}
.gofish-feedback {
  min-height: 1.4rem;
  color: var(--ui-text-muted);
  font-size: 1.05rem;
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
