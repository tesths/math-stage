<template>
  <div class="shapebuild-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ planIndex + 1 }}/3 个造型</span>
      <span v-if="wrongCount" class="wrong-badge">答错 {{ wrongCount }} 次</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🏠 拼搭大师！</p>
      <p class="finish-sub">3 个造型全部完成，答错 {{ wrongCount }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再搭一次</UButton>
    </div>

    <template v-else>
      <div class="blueprint">
        <span class="blueprint-art">{{ plan.art }}</span>
        <p class="blueprint-name">拼出「{{ plan.name }}」</p>
        <p class="blueprint-need">
          需要：
          <template v-for="(p, i) in plan.parts" :key="i">
            <span class="need-item">{{ p.shape }} ×{{ p.count }}</span>
          </template>
        </p>
      </div>

      <div class="shape-pool">
        <button
          v-for="shape in SHAPES"
          :key="shape"
          class="pool-btn"
          :class="{ picked: (picked[shape] ?? 0) > 0 }"
          :data-shape="shape"
          @click="pick(shape)"
        >
          <span class="pool-art">{{ artOf(shape) }}</span>
          <span>{{ shape }}</span>
          <span v-if="(picked[shape] ?? 0) > 0" class="pool-count">×{{ picked[shape] }}</span>
        </button>
      </div>

      <div class="build-actions">
        <UButton
          color="primary"
          size="lg"
          :disabled="!canConfirm"
          @click="confirm"
        >完成拼搭</UButton>
        <UButton variant="ghost" color="neutral" @click="resetPicks">清空</UButton>
      </div>
      <FeedbackOverlay :state="feedback" :correct-answer="feedbackAnswer" :answer-text="feedbackText" />
      <UButton v-if="built && !finished" color="primary" size="lg" @click="nextPlan">下一个造型</UButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BUILD_PLANS, SHAPES } from '@/lib/arcade/shapebuild'
import { SHAPE_INFO } from '@/lib/arcade/shaperiddle'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong } from '@/lib/sound'

const planIndex = ref(0)
const plan = computed(() => BUILD_PLANS[planIndex.value]!)
const picked = ref<Record<string, number>>({})
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const built = ref(false)
const wrongCount = ref(0)
const finished = ref(false)

const totalPicked = computed(() => Object.values(picked.value).reduce((s, n) => s + n, 0))
const needTotal = computed(() => plan.value.parts.reduce((s, p) => s + p.count, 0))
const canConfirm = computed(() => totalPicked.value > 0)
const feedbackAnswer = computed(() => '按要求选齐')
const feedbackText = computed(() => '')

function artOf(shape: string): string {
  return SHAPE_INFO[shape as keyof typeof SHAPE_INFO]?.art ?? '🧊'
}

function pick(shape: string) {
  if (built.value || finished.value) return
  picked.value = { ...picked.value, [shape]: (picked.value[shape] ?? 0) + 1 }
}

function resetPicks() {
  picked.value = {}
  feedback.value = 'idle'
}

function confirm() {
  if (built.value || finished.value) return
  const ok = plan.value.parts.every((p) => (picked.value[p.shape] ?? 0) === p.count)
  if (ok) {
    built.value = true
    feedback.value = 'correct'
    playCorrect()
  } else {
    wrongCount.value += 1
    feedback.value = 'wrong'
    playWrong()
  }
}

function nextPlan() {
  if (planIndex.value >= 2) {
    finished.value = true
    return
  }
  planIndex.value += 1
  picked.value = {}
  feedback.value = 'idle'
  built.value = false
}

function restart() {
  planIndex.value = 0
  picked.value = {}
  feedback.value = 'idle'
  built.value = false
  wrongCount.value = 0
  finished.value = false
}
</script>

<style scoped>
.shapebuild-game {
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
.wrong-badge {
  color: var(--ui-color-error-500);
}
.blueprint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.blueprint-art {
  font-size: 3.5rem;
}
.blueprint-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.blueprint-need {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  justify-content: center;
  color: var(--ui-text-muted);
  font-size: 1.05rem;
}
.need-item {
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: 0.6rem;
  padding: 0.2rem 0.6rem;
  color: var(--ui-text-toned);
}
.shape-pool {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
  width: 100%;
  max-width: 22rem;
}
.pool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.8rem 0;
  border-radius: var(--ui-radius-xl);
  border: 2px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
  position: relative;
}
.pool-btn:hover {
  border-color: var(--ui-primary);
  transform: translateY(-3px);
}
.pool-btn.picked {
  border-color: var(--ui-primary);
  background: var(--ui-color-primary-100);
}
.pool-art {
  font-size: 2.2rem;
}
.pool-count {
  position: absolute;
  top: 0.4rem;
  right: 0.6rem;
  color: var(--ui-primary);
  font-weight: bold;
}
.build-actions {
  display: flex;
  gap: 0.8rem;
  align-items: center;
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