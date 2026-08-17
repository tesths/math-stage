<template>
  <div class="split-game">
    <div class="split-stage">
      <!-- 左盘：已分 -->
      <div class="split-tray left" :class="{ dim: movingToRight }">
        <p class="split-cap">左边 {{ leftTokens.length }} 个</p>
        <div class="split-items">
          <span
            v-for="(c, i) in leftTokens"
            :key="'l' + i"
            class="split-item"
            :class="{ clickable: canMoveToRight }"
            @click="canMoveToRight && moveFromLeft(i)"
          >{{ c }}</span>
        </div>
      </div>
      <div class="split-mid">
        <p class="split-eq">
          {{ given }} <span class="plus">+</span>
          <span class="split-q">?</span>
          <span class="eq">=</span> {{ total }}
        </p>
        <p class="split-desc">题目已给 {{ given }} 个，要补到 {{ total }} 个。数一数右边是几个。</p>
      </div>
      <!-- 右盘：待分 -->
      <div class="split-tray right" :class="{ dim: movingToLeft }">
        <p class="split-cap">右边自己数一数</p>
        <div class="split-items">
          <span
            v-for="(c, i) in rightTokens"
            :key="'r' + i"
            class="split-item"
            :class="{ clickable: canMoveToLeft }"
            @click="canMoveToLeft && moveFromRight(i)"
          >{{ c }}</span>
        </div>
      </div>
    </div>
    <div class="split-bar">
      <button
        type="button"
        class="split-move"
        :disabled="!canMoveToRight || done"
        @click="moveOneToRight"
      >把 1 个移到右边 ▶</button>
      <button
        type="button"
        class="split-move"
        :disabled="!canMoveToLeft || done"
        @click="moveOneToLeft"
      >◀ 从右边移回 1 个</button>
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

const cfg = computed(() => props.question.config as { total: number; given: number; answer: number })
const total = computed(() => cfg.value.total)
const given = computed(() => cfg.value.given)
const answer = computed(() => cfg.value.answer)

const token = '🔵'
const tokenList = computed(() => visibleUnits(token.repeat(total.value)))

/** 当前左盘数量（可调，默认 = given） */
const leftCount = ref(cfg.value.given)
const rightCount = computed(() => total.value - leftCount.value)

const leftTokens = computed(() => tokenList.value.slice(0, leftCount.value))
const rightTokens = computed(() => tokenList.value.slice(leftCount.value))

const canMoveToRight = computed(() => leftCount.value > 0 && !done.value)
const canMoveToLeft = computed(() => rightCount.value > 0 && !done.value)
const movingToLeft = ref(false)
const movingToRight = ref(false)

function moveOneToRight() {
  if (!canMoveToRight.value) return
  movingToRight.value = true
  leftCount.value -= 1
  setTimeout(() => (movingToRight.value = false), 250)
}
function moveOneToLeft() {
  if (!canMoveToLeft.value) return
  movingToLeft.value = true
  leftCount.value += 1
  setTimeout(() => (movingToLeft.value = false), 250)
}
function moveFromLeft(_i: number) {
  moveOneToRight()
}
function moveFromRight(_i: number) {
  moveOneToLeft()
}

// 确定性选项：第 0 项为 0（干扰），第 1 项为正确答案，其余为 1..total 其余数
const options = computed(() => {
  const answerVal = answer.value
  const rest: number[] = []
  for (let i = 1; i <= total.value; i++) {
    if (i !== 0 && i !== answerVal) rest.push(i)
  }
  return [0, answerVal, ...rest].slice(0, total.value + 1)
})

const selected = ref<number | string | null>(null)
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')

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
.split-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.split-stage {
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}
.split-tray {
  background: var(--ui-bg-muted);
  border: 2px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-2xl);
  padding: 0.8rem 1.4rem;
  min-width: 9rem;
  min-height: 5.5rem;
  text-align: center;
  transition: opacity 0.25s;
}
.split-tray.dim {
  opacity: 0.55;
}
.split-tray.left {
  border-color: color-mix(in srgb, var(--ui-primary) 55%, white);
}
.split-tray.right {
  border-color: color-mix(in srgb, var(--ui-secondary, var(--ui-info)) 55%, white);
}
.split-cap {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  margin-bottom: 0.4rem;
  font-weight: 700;
}
.split-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
  justify-content: center;
  min-height: 2.8rem;
}
.split-item {
  font-size: 2rem;
  transition: transform 0.15s, opacity 0.15s;
}
.split-item.clickable {
  cursor: pointer;
}
.split-item.clickable:hover {
  transform: translateY(-3px);
  opacity: 0.85;
}
.split-mid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding-top: 1.2rem;
}
.split-eq {
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}
.split-eq .plus {
  color: var(--ui-primary);
}
.split-eq .eq {
  color: var(--ui-primary);
}
.split-q {
  display: inline-block;
  min-width: 1.8rem;
  text-align: center;
  color: var(--ui-bg-inverted);
  background: var(--ui-primary);
  border-radius: 0.5rem;
  padding: 0 0.3rem;
}
.split-desc {
  font-size: 0.9rem;
  color: var(--ui-text-muted);
  max-width: 14rem;
  text-align: center;
}
.split-bar {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.split-move {
  border-radius: 9999px;
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-toned);
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.4rem 1rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.split-move:hover:not(:disabled) {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.split-move:disabled {
  opacity: 0.45;
  cursor: default;
}
</style>
