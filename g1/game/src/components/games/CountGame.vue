<template>
  <div class="count-game">
    <div class="count-stage">
      <!-- count：两只手十指 -->
      <div v-if="isTwoHands" class="hands-stage">
        <div class="hand-row">
          <div v-for="h in 2" :key="h" class="hand-card">
            <span class="hand-icon">✋</span>
            <div class="finger-row">
              <button
                v-for="f in 5"
                :key="f"
                type="button"
                class="finger-dot"
                :class="{ lit: h * 5 - 5 + f <= litCount }"
                :disabled="done"
                @click="onCell(h * 5 - 5 + f)"
              >{{ h * 5 - 5 + f }}</button>
            </div>
          </div>
        </div>
        <p class="stage-note">2 只手 · 每只手 5 根手指 = 10 根手指</p>
        <p class="count-read" :class="{ done }">{{ countRead }}</p>
      </div>

      <!-- count：十框 + 计数轨迹 -->
      <div v-else-if="isCount" class="tf-stage">
        <p v-if="count > 0" class="count-read" :class="{ done }">{{ countRead }}</p>
        <TenFrame
          v-if="count <= 10"
          :lit-count="litCount"
          :objects="units"
          :done="done"
          show-badges
          interactive
          @cell="onCell"
        />
        <div v-else class="count-items">
          <button
            v-for="(c, i) in units"
            :key="i"
            type="button"
            class="count-item"
            :class="{ lit: i < litCount }"
            :disabled="done"
            @click="onCell(i + 1)"
          >
            <span class="item-obj">{{ c }}</span>
            <span v-if="i < litCount && !done" class="item-badge">{{ i + 1 }}</span>
          </button>
        </div>
        <p v-if="count === 0" class="empty-note">一个也没有，用0表示</p>
      </div>

      <!-- write：十框 + 计数器 + 数字 -->
      <template v-else-if="isWrite">
        <p class="write-hint">{{ hint }}</p>
        <div class="write-triple">
          <div class="write-box">
            <p class="box-label">先看数量</p>
            <TenFrame v-if="number <= 10" :lit-count="number" obj="●" show-badges />
            <div v-else class="count-items">
              <span v-for="i in number" :key="i" class="count-item lit">●</span>
            </div>
          </div>
          <div class="write-box">
            <p class="box-label">再拨计数器</p>
            <div class="counter" data-test="counter">
              <div class="counter-frame">
                <div class="counter-col" aria-label="十位">
                  <div class="counter-beads">
                    <span v-for="i in tens" :key="i" class="counter-bead">
                      <span class="counter-hole"></span>
                    </span>
                  </div>
                  <span class="counter-label">十位</span>
                </div>
                <div class="counter-rail"></div>
                <div class="counter-col" aria-label="个位">
                  <div class="counter-beads">
                    <span v-for="i in ones" :key="i" class="counter-bead">
                      <span class="counter-hole"></span>
                    </span>
                  </div>
                  <span class="counter-label">个位</span>
                </div>
              </div>
            </div>
          </div>
          <div class="write-box digit-box">
            <p class="box-label">最后写数字</p>
            <p class="digit">{{ number }}</p>
          </div>
        </div>
      </template>
    </div>
    <AnswerPad
      :options="options"
      :selected="selected"
      :disabled="done"
      :correct-value="answer"
      :show-result="done"
      @select="onSelect"
    />
    <FeedbackOverlay :state="feedback" :correct-answer="answer" :answer-text="answerText" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameQuestion } from '@data/schema/example'
import { isAnswerCorrect } from '@/lib/engine/checker'
import { visibleUnits, countUnits, tensOf, onesOf } from '@/lib/engine/count'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import TenFrame from '@/components/ui/TenFrame.vue'

const props = defineProps<{ question: GameQuestion }>()
const emit = defineEmits<{ answered: [result: { correct: boolean; attempts: number }] }>()

const cfg = computed(() => props.question.config)
const isCount = computed(() => props.question.type === 'count')
const isWrite = computed(() => props.question.type === 'write')

const emojiStr = computed(() => (cfg.value as { emoji?: string }).emoji ?? '')
const units = computed(() => (isCount.value ? visibleUnits(emojiStr.value) : []))
const count = computed(() => (isCount.value ? countUnits(emojiStr.value) : 0))
const answer = computed(() => (cfg.value as { answer: number }).answer)
const options = computed(() => (cfg.value as { options: number[] }).options)
const hint = computed(() => (cfg.value as { hint: string }).hint)
const number = computed(() => (isWrite.value ? (cfg.value as { number: number }).number : 0))
const tens = computed(() => (isWrite.value ? tensOf(number.value) : 0))
const ones = computed(() => (isWrite.value ? onesOf(number.value) : 0))

const visual = computed(() => (cfg.value as { visual?: { variant?: string; unitLabel?: string } }).visual)
const isTwoHands = computed(() => visual.value?.variant === 'two-hands')
const unitLabel = computed(() => visual.value?.unitLabel ?? (isTwoHands.value ? '根' : '个'))

const selected = ref<number | string | null>(null)
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const litCount = ref(0)

const answerText = computed(() => (count.value === 0 ? '0' : undefined))

const countRead = computed(() => {
  if (done.value) return `一共有 ${count.value} ${unitLabel.value}`
  if (litCount.value === 0) return '点击物品，一个一个数'
  return `数到 ${litCount.value}`
})

function onCell(i: number) {
  if (done.value) return
  litCount.value = i
}

function onSelect(value: number | string) {
  if (done.value) return
  selected.value = value
  const correct = isAnswerCorrect(props.question, value)
  emit('answered', { correct, attempts: attempts.value })
  if (correct) {
    done.value = true
    litCount.value = count.value
    feedback.value = 'correct'
  } else {
    attempts.value += 1
    feedback.value = 'wrong'
  }
}
</script>

<style scoped>
.count-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.count-stage {
  min-height: 9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.tf-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
}
.hands-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.hand-row {
  display: flex;
  gap: 1.6rem;
}
.hand-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: var(--ui-bg-muted);
  border: 2px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  padding: 0.8rem 1rem;
}
.hand-icon {
  font-size: 3.4rem;
  line-height: 1;
}
.finger-row {
  display: flex;
  gap: 0.5rem;
}
.finger-dot {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 9999px;
  border: 1.5px dashed var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.finger-dot.lit {
  background: var(--ui-primary);
  border-color: var(--ui-primary);
  border-style: solid;
  color: white;
}
.finger-dot:hover:not(:disabled) {
  transform: translateY(-2px);
}
.count-read {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ui-primary);
  margin: 0.2rem 0 0;
}
.count-read.done {
  color: var(--ui-color-success-600);
}
.stage-note {
  font-size: 0.95rem;
  color: var(--ui-text-muted);
  margin: 0.5rem 0 0;
}
.count-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  max-width: 42rem;
  justify-content: center;
}
.count-item {
  position: relative;
  font-size: 3rem;
  line-height: 1;
  background: none;
  border: 0;
  padding: 0.2rem;
  border-radius: 0.8rem;
  cursor: pointer;
  opacity: 0.45;
  transition: opacity 0.2s, transform 0.15s;
}
.count-item.lit {
  opacity: 1;
}
.count-item:not(:disabled):hover {
  transform: translateY(-4px);
}
.item-obj {
  display: block;
}
.item-badge {
  position: absolute;
  top: -0.3rem;
  right: -0.3rem;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: var(--ui-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.2rem;
}
.empty-note {
  font-size: 1.6rem;
  color: var(--ui-text-muted);
}
.write-hint {
  font-size: 1.25rem;
  color: var(--ui-text-toned);
}
.write-triple {
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem;
  justify-content: center;
  align-items: stretch;
}
.write-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: var(--ui-bg-muted);
  border: 2px solid var(--ui-border);
  border-radius: var(--ui-radius-xl);
  padding: 0.8rem 1rem;
  max-width: 26rem;
}
.box-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ui-text-muted);
  margin: 0;
}
.digit-box {
  justify-content: center;
}
.digit {
  font-size: 4rem;
  font-weight: 800;
  color: var(--ui-primary);
  margin: 0;
}
.counter {
  display: flex;
  justify-content: center;
}
.counter-frame {
  display: flex;
  align-items: stretch;
  gap: 1.6rem;
  background: var(--ui-bg-muted);
  border: 2px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  padding: 0.9rem 1.8rem 0.6rem;
  position: relative;
}
.counter-frame::before,
.counter-frame::after {
  content: '';
  position: absolute;
  top: 0.6rem;
  bottom: 0.6rem;
  width: 0.35rem;
  border-radius: 0.2rem;
  background: var(--ui-color-amber-500);
}
.counter-frame::before {
  left: 0.7rem;
}
.counter-frame::after {
  right: 0.7rem;
}
.counter-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  position: relative;
  z-index: 1;
}
.counter-beads {
  min-height: 5.4rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.35rem;
  width: 2.2rem;
  background: linear-gradient(180deg, var(--ui-color-amber-100), var(--ui-color-amber-50));
  border-radius: 1.1rem;
  border: 1px solid var(--ui-color-amber-300);
  padding: 0.3rem;
}
.counter-bead {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 9999px;
  background: linear-gradient(180deg, var(--ui-primary), var(--ui-color-primary-600));
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.counter-hole {
  width: 30%;
  height: 30%;
  border-radius: 9999px;
  background: var(--ui-bg);
  opacity: 0.7;
}
.counter-rail {
  width: 0.5rem;
  align-self: center;
  height: 5.6rem;
  border-radius: 0.25rem;
  background: var(--ui-color-amber-500);
  margin: 0 -0.2rem;
}
.counter-label {
  font-size: 1rem;
  color: var(--ui-text-muted);
  font-weight: 600;
}
</style>
