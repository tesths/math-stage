<script setup lang="ts">
/**
 * 训练游戏：抛硬币统计（100 次，观察正反面次数接近一半）
 * animejs 3D 翻转动画
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { animate } from 'animejs'
import { playClick, playWin } from '@/lib/sound'

const results = ref<('正面' | '反面')[]>([])
const flipping = ref(false)
const finished = ref(false)
const coinRef = ref<HTMLElement | null>(null)
const face = ref<'正面' | '反面'>('正面')

const flips = computed(() => results.value.length)
const heads = computed(() => results.value.filter((x) => x === '正面').length)
const tails = computed(() => flips.value - heads.value)
const headPct = computed(() => (heads.value / Math.max(1, flips.value)) * 100)

let flipTween: { cancel: () => void } | null = null

function doFlips(k: number) {
  if (finished.value || flipping.value) return
  flipping.value = true
  playClick()
  const r: ('正面' | '反面')[] = []
  for (let i = 0; i < k; i++) r.push(Math.random() < 0.5 ? '正面' : '反面')
  const outcome = r[0]!
  face.value = outcome
  // animejs：硬币翻转 3 圈 + 上抛回落
  const el = coinRef.value
  flipTween?.cancel()
  if (el) {
    flipTween = animate(el, {
      rotateX: [0, 360 * 3],
      translateY: [0, -26, 0],
      duration: 700,
      easing: 'easeOutCubic',
    })
  }
  setTimeout(() => {
    results.value = [...results.value, ...r]
    flipping.value = false
    if (results.value.length >= 100) {
      finished.value = true
      playWin()
    }
  }, 750)
}

function reset() {
  results.value = []
  finished.value = false
}

onMounted(() => {
  if (coinRef.value) coinRef.value.style.transform = 'rotateX(0)'
})
onBeforeUnmount(() => flipTween?.cancel())

function tallyChars(n: number): string {
  let out = ''
  const full = Math.floor(n / 5)
  for (let i = 0; i < full; i++) out += '正'
  const rem = n % 5
  if (rem) out += ['一', '丅', '下', '正'][rem - 1]!
  return out || '—'
}
</script>

<template>
  <div class="game">
    <div v-if="finished" class="finish">
      <p class="finish-title">🪙 抛满 100 次！</p>
      <p class="finish-sub">
        正面 {{ heads }} 次（{{ headPct.toFixed(1) }}%）· 反面 {{ tails }} 次（{{ (100 - headPct).toFixed(1) }}%）
      </p>
      <p class="conclusion">次数越多，正反面越接近总数的一半 —— 它们出现的可能性相等</p>
      <UButton color="primary" size="lg" @click="reset">再抛一次</UButton>
    </div>

    <template v-else>
      <div class="coin-stage">
        <span ref="coinRef" class="coin" :class="face === '正面' ? 'coin-head' : 'coin-tail'">
          {{ face === '正面' ? '🪙' : '🪙' }}
        </span>
        <p class="ask">硬币落下后，正面朝上还是反面朝上？抛 {{ 100 - flips }} 次就结束</p>
        <p class="face-label">上次结果：{{ face }}</p>
      </div>

      <div class="btn-row">
        <UButton size="sm" color="primary" variant="soft" :disabled="flipping" @click="doFlips(1)">抛 1 次</UButton>
        <UButton size="sm" color="primary" variant="soft" :disabled="flipping" @click="doFlips(10)">抛 10 次</UButton>
        <UButton size="sm" color="primary" variant="soft" :disabled="flipping" @click="doFlips(50)">抛 50 次</UButton>
        <UButton size="sm" variant="outline" color="neutral" @click="reset">清空</UButton>
      </div>

      <div class="tally">
        <div class="tally-line">
          <span class="tally-name">正面</span>
          <span class="tally-chars">{{ tallyChars(heads) }}</span>
          <span class="tally-num">{{ heads }}</span>
        </div>
        <div class="tally-line">
          <span class="tally-name">反面</span>
          <span class="tally-chars">{{ tallyChars(tails) }}</span>
          <span class="tally-num">{{ tails }}</span>
        </div>
        <div class="prob-bar">
          <div class="prob-fill head" :style="{ width: `${headPct}%` }" />
          <div class="prob-fill tail" :style="{ width: `${100 - headPct}%` }" />
        </div>
        <p class="note">已抛 {{ flips }} 次 · 正面占 {{ headPct.toFixed(1) }}%</p>
      </div>
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
.coin-stage {
  text-align: center;
}
.coin {
  font-size: 3.5rem;
  display: inline-block;
  transform-style: preserve-3d;
}
.coin-head {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25));
}
.coin-tail {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25)) hue-rotate(40deg);
}
.face-label {
  margin-top: 0.2rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-primary);
}
.ask {
  margin-top: 0.4rem;
  font-size: 1rem;
  color: var(--ui-text-highlighted);
}
.btn-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.tally {
  width: 100%;
  max-width: 26rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.tally-line {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
}
.tally-name {
  width: 3rem;
  font-weight: 700;
}
.tally-chars {
  letter-spacing: 0.2em;
  color: var(--ui-text-highlighted);
  flex: 1;
}
.tally-num {
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.prob-bar {
  display: flex;
  height: 1rem;
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid var(--ui-border);
}
.prob-fill.head {
  background: var(--ui-primary);
  transition: width 0.4s;
}
.prob-fill.tail {
  background: color-mix(in srgb, var(--ui-primary) 35%, white);
  transition: width 0.4s;
}
.note {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.finish {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  padding: 2rem 0;
  text-align: center;
}
.finish-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.finish-sub {
  color: var(--ui-text-muted);
}
.conclusion {
  font-size: 0.9rem;
  color: var(--ui-primary);
  font-weight: 600;
  max-width: 24rem;
}
</style>
