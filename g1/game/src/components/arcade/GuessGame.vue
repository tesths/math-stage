<template>
  <div class="guess-game">
    <p class="guess-range">
      范围 {{ lo }} ~ {{ hi }}
      <span v-if="hintText" class="guess-hint">{{ hintText }}</span>
    </p>

    <div v-if="!done" class="guess-grid">
      <button
        v-for="n in 20"
        :key="n - 1"
        class="guess-btn"
        :class="{ disabled: used.has(n - 1) }"
        :disabled="used.has(n - 1)"
        :data-value="n - 1"
        @click="guess(n - 1)"
      >{{ n - 1 }}</button>
    </div>

    <div v-else class="finish-card">
      <p class="finish-title">🎯 猜中啦！</p>
      <p class="finish-sub">谜底是 {{ secret }}，你用了 {{ history.length }} 次</p>
      <p class="finish-comment">{{ grade }}</p>
      <UButton color="primary" size="lg" @click="newGame">再来一局</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { checkGuess, guessHint, newSecret, type GuessResult } from '@/lib/arcade/guess'
import { playCorrect } from '@/lib/sound'

interface GuessEntry {
  value: number
  result: GuessResult
}

const secret = ref(newSecret())
const lo = ref(0)
const hi = ref(19)
const used = ref<Set<number>>(new Set())
const history = ref<GuessEntry[]>([])
const done = ref(false)

const last = computed<GuessEntry | null>(() => history.value.at(-1) ?? null)

const hintText = computed(() => {
  if (!last.value) return ''
  const dir = last.value.result === 'low' ? '小了，再往大猜' : '大了，再往小猜'
  const close = guessHint(secret.value, last.value.value)
  return close ? `${dir} · ${close}` : dir
})

const grade = computed(() => {
  const n = history.value.length
  if (n <= 5) return '太厉害了！'
  if (n <= 7) return '很聪明！'
  return '记住每次猜中间的数会更快'
})

function guess(n: number) {
  if (done.value) return
  const result = checkGuess(secret.value, n)
  used.value = new Set([...used.value, n])
  history.value.push({ value: n, result })
  if (result === 'low') lo.value = Math.max(lo.value, n + 1)
  if (result === 'high') hi.value = Math.min(hi.value, n - 1)
  if (result === 'hit') {
    done.value = true
    playCorrect()
  }
}

function newGame() {
  secret.value = newSecret()
  lo.value = 0
  hi.value = 19
  used.value = new Set()
  history.value = []
  done.value = false
}
</script>

<style scoped>
.guess-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.guess-range {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.guess-hint {
  font-size: 1.05rem;
  color: var(--ui-primary);
  font-weight: 600;
  margin-left: 0.8rem;
}
.guess-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.6rem;
  max-width: 24rem;
  width: 100%;
}
.guess-btn {
  aspect-ratio: 1;
  font-size: 1.4rem;
  font-weight: bold;
  border-radius: var(--ui-radius-lg);
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.guess-btn:hover:not(:disabled) {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.guess-btn.disabled {
  opacity: 0.35;
  cursor: default;
}
.finish-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  padding: 1.6rem 0;
}
.finish-title {
  font-size: 1.7rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.finish-sub {
  color: var(--ui-text-muted);
}
.finish-comment {
  color: var(--ui-primary);
  font-weight: 600;
  margin-bottom: 0.6rem;
}
</style>
