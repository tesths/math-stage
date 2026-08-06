<template>
  <div class="memory-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ round }}/3 关</span>
      <span class="memory-tip">{{ withExpr ? '翻出算式和它的得数' : '翻出数字和同样多的物品' }}</span>
      <span>翻了 {{ moves }} 次</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🎉 全部配对完成！</p>
      <p class="finish-sub">三关一共翻了 {{ totalMoves }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="memory-grid" :class="{ expr: withExpr }">
        <button
          v-for="card in deck"
          :key="card.id"
          class="memory-card"
          :class="{ flipped: isFaceUp(card), matched: isMatched(card) }"
          :data-value="card.pair"
          :disabled="isMatched(card)"
          @click="flip(card)"
        >
          <div class="memory-inner">
            <div class="memory-face memory-back">❓</div>
            <div class="memory-face memory-front" :class="card.kind">{{ card.value }}</div>
          </div>
        </button>
      </div>
      <p v-if="feedback" class="memory-feedback">{{ feedback }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MemoryCard } from '@/lib/arcade/memory'
import { buildMemoryDeck } from '@/lib/arcade/memory'
import { playCorrect, playWrong } from '@/lib/sound'

const round = ref(1)
const withExpr = ref(false)
const deck = ref<MemoryCard[]>([])
const flipped = ref<number[]>([])
const matchedIds = ref<Set<number>>(new Set())
const moves = ref(0)
const totalMoves = ref(0)
const feedback = ref('')
const finished = ref(false)
let flipTimer: ReturnType<typeof setTimeout> | null = null

function startRound() {
  if (flipTimer) clearTimeout(flipTimer)
  withExpr.value = round.value === 3
  const pairs = round.value === 1 ? 4 : 5
  deck.value = buildMemoryDeck(pairs, 10, withExpr.value)
  flipped.value = []
  matchedIds.value = new Set()
  moves.value = 0
  feedback.value = ''
}

startRound()

function isFaceUp(card: MemoryCard) {
  return flipped.value.includes(card.id) || isMatched(card)
}

function isMatched(card: MemoryCard) {
  return matchedIds.value.has(card.id)
}

function flip(card: MemoryCard) {
  if (finished.value || isFaceUp(card) || flipped.value.length === 2) return
  flipped.value = [...flipped.value, card.id]
  if (flipped.value.length === 2) {
    moves.value += 1
    const flips = flipped.value.map((id) => deck.value.find((c) => c.id === id)!)
    const a = flips[0]!
    const b = flips[1]!
    if (a.pair === b.pair) {
      matchedIds.value = new Set([...matchedIds.value, a.id, b.id])
      flipped.value = []
      feedback.value = ''
      playCorrect()
      if (matchedIds.value.size === deck.value.length) {
        totalMoves.value += moves.value
        if (round.value >= 3) {
          finished.value = true
        } else {
          round.value += 1
          startRound()
        }
      }
    } else {
      playWrong()
      feedback.value = '这两张不是一对，再试试'
      flipTimer = setTimeout(() => {
        flipped.value = []
        feedback.value = ''
      }, 800)
    }
  }
}

function restart() {
  round.value = 1
  totalMoves.value = 0
  finished.value = false
  startRound()
}
</script>

<style scoped>
.memory-game {
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
.memory-tip {
  color: var(--ui-text-toned);
  font-weight: 600;
}
.memory-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
  width: 100%;
  max-width: 26rem;
}
.memory-grid.expr {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}
.memory-card {
  aspect-ratio: 3 / 4;
  border: none;
  background: transparent;
  cursor: pointer;
  perspective: 600px;
  padding: 0;
}
.memory-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.35s;
  transform-style: preserve-3d;
  border-radius: var(--ui-radius-xl);
}
.memory-card.flipped .memory-inner {
  transform: rotateY(180deg);
}
.memory-face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ui-radius-xl);
  backface-visibility: hidden;
  font-size: 1.6rem;
  font-weight: bold;
  overflow: hidden;
  word-break: break-all;
  line-height: 1.25;
  text-align: center;
  padding: 0.35rem;
}
.memory-back {
  background: var(--ui-primary);
  color: var(--ui-bg-inverted);
  box-shadow: var(--ui-shadow);
  font-size: 1.8rem;
}
.memory-front {
  background: var(--ui-bg-elevated);
  border: 2px solid var(--ui-border-accented);
  color: var(--ui-text-highlighted);
  transform: rotateY(180deg);
}
.memory-front.num {
  font-size: 2rem;
}
.memory-front.expr {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ui-primary);
}
.memory-card.matched .memory-front {
  border-color: var(--ui-color-success-400);
  background: var(--ui-color-success-50);
}
.memory-card:disabled {
  cursor: default;
}
.memory-feedback {
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
