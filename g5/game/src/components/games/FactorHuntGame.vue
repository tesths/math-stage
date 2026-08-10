<script setup lang="ts">
/**
 * 训练游戏：因数大冒险（选出 n 的所有因数，可多选）
 */
import { computed, ref } from 'vue'
import { factorsOf } from '@/lib/engine/math'
import { playCorrect, playWrong, playWin } from '@/lib/sound'

interface Round {
  n: number
  all: number[]
  candidates: number[]
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): Round {
  const n = randInt(8, 40)
  const all = factorsOf(n)
  const distractors = new Set<number>()
  let guard = 0
  while (distractors.size < Math.min(4, 40 - all.length) && guard++ < 100) {
    const d = randInt(2, n + 5)
    if (!all.includes(d) && d !== n + 1) distractors.add(d)
  }
  const candidates = [...all, ...distractors].sort((x, y) => x - y)
  return { n, all, candidates }
}

const roundNo = ref(1)
const rd = ref<Round>(makeRound())
const selected = ref<Set<number>>(new Set())
const score = ref(0)
const done = ref(false)
const lastOk = ref(false)
const finished = ref(false)

const isSelected = (v: number) => selected.value.has(v)

function toggle(v: number) {
  if (done.value) return
  const s = new Set(selected.value)
  if (s.has(v)) s.delete(v)
  else s.add(v)
  selected.value = s
}

function submit() {
  if (done.value) return
  done.value = true
  const ok =
    rd.value.all.length === selected.value.size &&
    rd.value.all.every((x) => selected.value.has(x))
  if (ok) {
    score.value++
    playCorrect()
  } else {
    playWrong()
  }
  lastOk.value = ok
}

function next() {
  if (roundNo.value >= 5) {
    finished.value = true
    playWin()
    return
  }
  roundNo.value++
  rd.value = makeRound()
  selected.value = new Set()
  done.value = false
}
function restart() {
  roundNo.value = 1
  score.value = 0
  selected.value = new Set()
  done.value = false
  finished.value = false
  rd.value = makeRound()
}
</script>

<template>
  <div class="game">
    <div v-if="finished" class="finish">
      <p class="finish-title">🔍 因数侦探！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <p class="ask">
        找出 <b>{{ rd.n }}</b> 的所有因数（可多选，共 {{ rd.all.length }} 个）
      </p>

      <div class="factor-pool">
        <button
          v-for="v in rd.candidates"
          :key="v"
          class="factor-btn"
          :class="{
            chosen: isSelected(v),
            right: done && rd.all.includes(v),
            wrong: done && isSelected(v) && !rd.all.includes(v),
            miss: done && !isSelected(v) && rd.all.includes(v),
          }"
          :disabled="done"
          @click="toggle(v)"
        >
          {{ v }}
        </button>
      </div>

      <div class="actions">
        <UButton v-if="!done" color="primary" :disabled="selected.size === 0" @click="submit">
          提交（已选 {{ selected.size }} 个）
        </UButton>
        <UButton v-if="done" color="primary" @click="next">
          {{ roundNo >= 5 ? '查看成绩' : '下一题' }}
        </UButton>
      </div>

      <p v-if="done" class="feedback">
        {{ lastOk ? '✅ 全对！' : `❌ ${rd.n} 的因数是 ${rd.all.join('、')}` }}
      </p>
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
.ask {
  font-size: 1.1rem;
  color: var(--ui-text-highlighted);
}
.ask b {
  color: var(--ui-primary);
  font-size: 1.4rem;
}
.factor-pool {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: center;
  max-width: 36rem;
}
.factor-btn {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.7rem;
  border: 2px solid var(--ui-border-accented);
  background: var(--ui-bg);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  cursor: pointer;
  transition: all 0.15s;
}
.factor-btn:hover:not(:disabled) {
  border-color: var(--ui-primary);
}
.factor-btn.chosen {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 20%, transparent);
  color: var(--ui-primary);
}
.factor-btn.right {
  border-color: var(--ui-success, #16a34a);
  background: color-mix(in srgb, #16a34a 20%, transparent);
  color: #16a34a;
}
.factor-btn.wrong {
  border-color: var(--ui-error, #dc2626);
  background: color-mix(in srgb, #dc2626 15%, transparent);
  color: #dc2626;
}
.factor-btn.miss {
  border-color: var(--ui-warning, #d97706);
  background: color-mix(in srgb, #d97706 15%, transparent);
  color: #d97706;
}
.actions {
  display: flex;
  gap: 0.6rem;
}
.feedback {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-toned);
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
