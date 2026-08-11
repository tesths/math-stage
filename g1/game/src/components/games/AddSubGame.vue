<template>
  <div class="addsub-game">
    <!-- 算式 -->
    <div class="as-expression">
      <span class="as-num" :class="{ hl: stage >= 1 && !isRemove }">{{ a }}</span>
      <span class="as-op" data-test="op">{{ opText }}</span>
      <span class="as-num" :class="{ hl: stage >= 1 }">{{ b }}</span>
      <span class="as-eq">=</span>
      <span class="as-blank" :class="{ show: stage === 2 }">{{ stage === 2 ? answer : '?' }}</span>
    </div>

    <!-- 三段式对象区 -->
    <div class="as-stage">
      <template v-if="isRemove">
        <!-- 减法：原有 a 个 -->
        <div class="as-zone">
          <p class="as-zone-cap">{{ stage === 0 ? '原来有 ' + a + ' 个' : stage === 1 ? '拿走 ' + b + ' 个' : '还剩几个？' }}</p>
          <div class="as-objects">
            <span
              v-for="(c, i) in baseObjects"
              :key="i"
              class="obj-item"
              :class="{
                removed: stage >= 1 && i >= a - b,
                result: stage === 2 && i < a - b,
              }"
            >{{ c }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <!-- 加法：原有 a 个，加入 b 个 -->
        <div class="as-zone">
          <p class="as-zone-cap">{{ stage === 0 ? '原有 ' + a + ' 个' : stage === 1 ? '又来了 ' + b + ' 个' : '一共有几个？' }}</p>
          <div class="as-objects">
            <span
              v-for="(c, i) in baseObjects"
              :key="'o' + i"
              class="obj-item"
              :class="{ base: stage === 0 }"
            >{{ c }}</span>
            <span
              v-for="(c, i) in addedObjects"
              :key="'a' + i"
              class="obj-item added"
              :class="{ visible: stage >= 1, result: stage === 2 }"
            >{{ c }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- 步进控制 -->
    <div class="as-controls">
      <button
        type="button"
        class="as-step"
        :disabled="stage >= 2 || done"
        @click="nextStage"
      >{{ stage === 0 ? (isRemove ? '拿走 ▶' : '加进来 ▶') : stage === 1 ? '看结果 ▶' : '✓' }}</button>
      <button
        type="button"
        class="as-step ghost"
        :disabled="stage === 0 || done"
        @click="prevStage"
      >◀ 回上一步</button>
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
import { computed, ref } from 'vue'
import type { GameQuestion } from '@data/schema/example'
import { isAnswerCorrect } from '@/lib/engine/checker'
import { visibleUnits } from '@/lib/engine/count'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'

const props = defineProps<{ question: GameQuestion }>()
const emit = defineEmits<{ answered: [result: { correct: boolean; attempts: number }] }>()

const cfg = computed(() => props.question.config as { a: number; b: number; op: '+' | '-'; answer: number; emoji: string; options: number[] })
const a = computed(() => cfg.value.a)
const b = computed(() => cfg.value.b)
const isRemove = computed(() => cfg.value.op === '-')
const answer = computed(() => cfg.value.answer)
const options = computed(() => cfg.value.options)
const opText = computed(() => (isRemove.value ? '−' : '+'))

/** 减法基础对象 = 原有 a 个；加法基础对象 = 原有 a 个，另加 b 个 */
const baseObjects = computed(() => visibleUnits(cfg.value.emoji.repeat(isRemove.value ? a.value : a.value)))
const addedObjects = computed(() => visibleUnits(cfg.value.emoji.repeat(b.value)))

/** 0=原有 1=变化 2=结果 */
const stage = ref(0)
const selected = ref<number | string | null>(null)
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')

function nextStage() {
  if (done.value) return
  if (stage.value < 2) stage.value += 1
}
function prevStage() {
  if (stage.value > 0) stage.value -= 1
}

function onSelect(value: number | string) {
  if (done.value) return
  selected.value = value
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
.addsub-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.as-expression {
  font-size: 3rem;
  color: var(--ui-text-highlighted);
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.as-num {
  min-width: 2.4rem;
  text-align: center;
  transition: color 0.2s, transform 0.2s;
}
.as-num.hl {
  color: var(--ui-primary);
  transform: scale(1.12);
}
.as-op {
  color: var(--ui-primary);
}
.as-blank {
  display: inline-grid;
  place-items: center;
  min-width: 2.6rem;
  height: 2.6rem;
  font-size: 1.8rem;
  color: var(--ui-bg-inverted);
  background: var(--ui-primary);
  border-radius: 0.5rem;
  transition: background 0.25s, color 0.25s;
}
.as-blank.show {
  background: var(--ui-color-success-500, #16a34a);
}
.as-stage {
  background: var(--ui-bg-muted);
  border: 2px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-2xl);
  padding: 1.2rem 1.6rem;
  min-width: 20rem;
  text-align: center;
}
.as-zone-cap {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-toned);
  margin: 0 0 0.6rem;
}
.as-objects {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
  justify-content: center;
  max-width: 38rem;
}
.obj-item {
  font-size: 2.4rem;
  transition: transform 0.25s, opacity 0.25s, filter 0.25s;
}
.obj-item.removed {
  opacity: 0.35;
  filter: grayscale(1);
  transform: translateY(0.5rem) scale(0.85);
}
.obj-item.result {
  transform: scale(1.12);
}
.obj-item.added {
  opacity: 0;
  transform: translateY(0.6rem);
}
.obj-item.added.visible {
  opacity: 1;
  transform: translateY(0);
}
.obj-item.added.result {
  opacity: 1;
  transform: scale(1.12);
}
.as-controls {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.as-step {
  border-radius: 9999px;
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-toned);
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0.45rem 1.2rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.as-step:hover:not(:disabled) {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: var(--ui-color-primary-100);
}
.as-step.ghost {
  background: transparent;
}
.as-step:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>