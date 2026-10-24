<template>
  <div class="shape3d-game">
    <div class="shape-stage">
      <div ref="container" class="shape-canvas" data-test="shape-canvas"></div>
      <div class="face-panel">
        <p class="face-title">{{ fact.name }}</p>
        <p class="face-count" data-test="face-count">
          数到第 {{ shownFaces }} 个面：
          <b>{{ shownFaces > 0 ? steps[shownFaces - 1]?.face : '还没开始数' }}</b>
        </p>
        <p class="face-say" data-test="face-say">
          {{ shownFaces > 0 ? steps[shownFaces - 1]?.say : '点「数一数」，一个面一个面地看' }}
        </p>
        <ul class="face-list">
          <li
            v-for="s in steps"
            :key="s.no"
            class="face-row"
            :class="{ dim: counted && s.no > shownFaces, curved: s.kind === '曲面' }"
            :data-lit="!counted || s.no <= shownFaces"
          >
            <span class="face-no">{{ s.no }}</span>
            <span class="face-name">{{ s.face }}</span>
            <span class="face-kind">{{ s.kind }}</span>
          </li>
        </ul>
        <p class="face-total" data-test="face-total">
          一共 {{ total }} 个面（平面 {{ fact.flatFaces }} 个、曲面 {{ fact.curvedFaces }} 个），
          {{ fact.roll }}
        </p>
        <button type="button" class="face-btn" data-test="face-next" @click="nextFace">
          数一数
        </button>
      </div>
    </div>
    <AnswerPad
      :options="options"
      :selected="selected"
      :disabled="done"
      :correct-value="answer"
      :show-result="done"
      @select="onSelect"
    />
    <FeedbackOverlay :state="feedback" :correct-answer="answer" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { GameQuestion } from '@data/schema/example'
import { isAnswerCorrect } from '@/lib/engine/checker'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { useShapeRenderer } from '@/composables/useShapeRenderer'
import { SOLID_FACTS, faceSteps, totalFaces, type SolidName } from '@/lib/engine/solid'

const props = defineProps<{ question: GameQuestion }>()
const emit = defineEmits<{ answered: [result: { correct: boolean; attempts: number }] }>()

const cfg = computed(() => props.question.config as { shape: string; options: string[]; answer: string })
const options = computed(() => cfg.value.options)
const answer = computed(() => cfg.value.answer)
const shape = computed(() => cfg.value.shape)

const container = ref<HTMLElement | null>(null)
const renderer = useShapeRenderer(container, shape)

onMounted(() => renderer.mountCanvas())
onUnmounted(() => renderer.dispose())

/* ---------- 过程态：一个面一个面地数（原来只有一张会自动转的 canvas，学生没事可做） ---------- */
const steps = computed(() => faceSteps(shape.value))
const fact = computed(() => SOLID_FACTS[shape.value as SolidName] ?? SOLID_FACTS['正方体'])
const total = computed(() => totalFaces(shape.value))
const faceStep = ref(0)
const counted = computed(() => faceStep.value > 0)
const shownFaces = computed(() => (counted.value ? faceStep.value : total.value))

function nextFace() {
  faceStep.value = faceStep.value >= total.value ? 0 : faceStep.value + 1
}

const selected = ref<string | null>(null)
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')

function onSelect(value: number | string) {
  if (done.value) return
  selected.value = String(value)
  const correct = isAnswerCorrect(props.question, value)
  emit('answered', { correct, attempts: attempts.value })
  if (correct) {
    done.value = true
    feedback.value = 'correct'
  } else {
    attempts.value += 1
    feedback.value = 'wrong'
  }
}
</script>

<style scoped>
.shape3d-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.shape-stage {
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}
.shape-canvas {
  width: 16rem;
  height: 14rem;
  border-radius: var(--ui-radius-2xl);
  background: linear-gradient(180deg, var(--ui-bg-muted), var(--ui-bg));
  border: 1px solid var(--ui-border-accented);
}
.face-panel {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 15rem;
  max-width: 20rem;
}
.face-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.face-count,
.face-say {
  margin: 0;
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.face-count b {
  color: var(--ui-primary);
}
.face-list {
  list-style: none;
  margin: 0.2rem 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.face-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-bg-muted);
  padding: 0.12rem 0.45rem;
  font-size: 0.8rem;
  color: var(--ui-text-toned);
}
.face-row.curved {
  border-style: dashed;
}
.face-row.dim {
  opacity: 0.25;
}
.face-no {
  display: inline-flex;
  width: 1.2rem;
  height: 1.2rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--ui-primary);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
}
.face-kind {
  margin-left: auto;
  color: var(--ui-text-muted);
}
.face-total {
  margin: 0;
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.face-btn {
  align-self: flex-start;
  border: 1px solid var(--ui-primary);
  background: var(--ui-bg);
  color: var(--ui-primary);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.22rem 0.9rem;
  cursor: pointer;
}
</style>
