<template>
  <div class="friend-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ round }}/3 关</span>
      <p class="friend-target">
        找两张牌，相加等于 <strong>{{ target }}</strong>
      </p>
      <span v-if="wrongCount" class="wrong-count">错 {{ wrongCount }} 次</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🎉 所有数字都交到朋友啦！</p>
      <p class="finish-sub">共答错 {{ totalWrong }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="cards">
        <button
          v-for="(v, i) in deck"
          :key="i"
          class="card"
          :class="{ selected: selected.includes(i), matched: matched.has(i) }"
          :data-value="v"
          :disabled="matched.has(i)"
          @click="pick(i)"
        >{{ v }}</button>
      </div>
      <p class="friend-feedback">{{ feedback || '点两张牌试试吧' }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { buildFriendDeck } from '@/lib/arcade/friend'
import { playCorrect, playWrong } from '@/lib/sound'

const TARGETS = [8, 9, 10]
const round = ref(1)
const target = ref(8)
const deck = ref<number[]>([])
const selected = ref<number[]>([])
const matched = ref<Set<number>>(new Set())
const wrongCount = ref(0)
const totalWrong = ref(0)
const feedback = ref('')
const finished = ref(false)
let popTimer: ReturnType<typeof setTimeout> | null = null

function startRound() {
  if (popTimer) clearTimeout(popTimer)
  target.value = TARGETS[round.value - 1]!
  deck.value = buildFriendDeck(target.value)
  selected.value = []
  matched.value = new Set()
  wrongCount.value = 0
  feedback.value = ''
}

startRound()

function pick(i: number) {
  if (finished.value || matched.value.has(i) || selected.value.includes(i)) return
  if (selected.value.length === 2) return
  selected.value = [...selected.value, i]
  if (selected.value.length === 2) {
    const a = selected.value[0]!
    const b = selected.value[1]!
    if (deck.value[a]! + deck.value[b]! === target.value) {
      matched.value = new Set([...matched.value, a, b])
      selected.value = []
      feedback.value = ''
      playCorrect()
      if (matched.value.size === deck.value.length) {
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
      feedback.value = `${deck.value[a]!} + ${deck.value[b]!} 不等于 ${target.value}，再找找`
      playWrong()
      popTimer = setTimeout(() => {
        selected.value = []
        feedback.value = ''
      }, 900)
    }
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
.friend-game {
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
}
.friend-target {
  font-size: 1.3rem;
  color: var(--ui-text-highlighted);
  font-weight: 600;
}
.friend-target strong {
  color: var(--ui-primary);
  font-size: 1.6rem;
}
.wrong-count {
  color: var(--ui-color-error-500);
}
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.9rem;
  max-width: 22rem;
  width: 100%;
}
.card {
  aspect-ratio: 3 / 4;
  font-size: 2rem;
  font-weight: bold;
  border-radius: var(--ui-radius-xl);
  border: 2px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, background 0.15s;
  box-shadow: var(--ui-shadow);
}
.card:hover:not(:disabled) {
  transform: translateY(-4px);
  border-color: var(--ui-primary);
}
.card.selected {
  border-color: var(--ui-primary);
  background: var(--ui-color-primary-100);
  color: var(--ui-primary);
  transform: translateY(-4px);
}
.card.matched {
  background: var(--ui-color-success-100);
  border-color: var(--ui-color-success-400);
  color: var(--ui-color-success-600);
  opacity: 0.9;
}
.card:disabled {
  cursor: default;
}
.friend-feedback {
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
