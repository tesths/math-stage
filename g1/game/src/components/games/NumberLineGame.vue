<template>
  <div class="numberline-game">
    <template v-if="isNumberline">
      <div class="place-model" aria-label="十几的组成">
        <div class="ten-bundle">
          <span v-for="i in 10" :key="i" class="ten-unit"></span>
          <b>1个十</b>
        </div>
        <span class="model-op">+</span>
        <div class="ones-bundle">
          <span v-for="i in onesValue" :key="i" class="one-unit"></span>
          <b>{{ onesValue }}个一</b>
        </div>
        <span class="model-op">=</span>
        <span class="model-value">{{ value }}</span>
      </div>
      <div class="num-line" data-test="numline">
        <span
          v-for="t in lineTicks"
          :key="t"
          class="num-line-tick"
          :class="tickClass(t)"
        >{{ t }}</span>
      </div>
      <p class="numline-note">从 10 再往后数 {{ onesValue }} 步，停在 <b>{{ value }}</b></p>
    </template>
    <template v-else>
      <div class="seq-track" aria-label="已排好的顺序">
        <template v-for="(_, i) in seqNumbers" :key="i">
          <span
            class="seq-slot"
            :class="{ filled: picked[i] !== undefined }"
          >{{ picked[i] ?? '？' }}</span>
          <span v-if="i < seqNumbers.length - 1" class="seq-arrow" aria-hidden="true">→</span>
        </template>
      </div>
      <div class="seq-stage">
        <button
          v-for="v in seqButtons"
          :key="v"
          class="seq-btn"
          :class="{ picked: picked.includes(v) }"
          :disabled="picked.includes(v)"
          @click="onSeq(v)"
        >{{ v }}</button>
      </div>
      <p class="seq-tip">沿箭头从小到大数：{{ seqNumbers[0] }} → {{ seqNumbers[seqNumbers.length - 1] }}</p>
    </template>
    <AnswerPad
      v-if="isNumberline"
      :options="options"
      :selected="selected"
      :disabled="done"
      :correct-value="answer"
      :show-result="done"
      @select="onSelect"
    />
    <FeedbackOverlay :state="feedback" :correct-answer="fbAnswer" :answer-text="fbText" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameQuestion } from '@data/schema/example'
import { isAnswerCorrect } from '@/lib/engine/checker'
import { shuffle } from '@/lib/engine/generator'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'

const props = defineProps<{ question: GameQuestion }>()
const emit = defineEmits<{ answered: [result: { correct: boolean; attempts: number }] }>()

const isNumberline = computed(() => props.question.type === 'numberline')
const cfg = computed(() => props.question.config)
const value = computed(() => (cfg.value as { value: number }).value)
const onesValue = computed(() => Math.max(0, value.value - 10))
const lineTicks = computed(() => Array.from({ length: 20 }, (_, i) => i))
const options = computed(() => (cfg.value as { options: number[] }).options)
const seqNumbers = computed(() => (cfg.value as { answer: number[] }).answer)
const seqButtons = ref<number[]>([])
if (props.question.type === 'sequence') {
  seqButtons.value = shuffle(seqNumbers.value)
}

const fbText = computed(() => (isNumberline.value ? undefined : seqNumbers.value.join('、')))
const fbAnswer = computed(() => (isNumberline.value ? answer.value : seqNumbers.value.join('、')))
const answer = computed(() => (cfg.value as { answer: number }).answer)

const selected = ref<number | string | null>(null)
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const picked = ref<number[]>([])

function tickClass(t: number): Record<string, boolean> {
  return {
    ten: t === 10,
    between: t > 10 && t < value.value,
    active: t === value.value,
  }
}

function onSelect(val: number | string) {
  if (done.value) return
  selected.value = val
  finish(val)
}

function onSeq(val: number) {
  if (done.value) return
  const next = [...picked.value, val]
  if (next.length === seqNumbers.value.length) {
    const correct = isAnswerCorrect(props.question, next)
    const attemptsNow = attempts.value
    if (!correct) attempts.value += 1
    finishSeq(next, correct, attemptsNow)
  } else {
    picked.value = next
  }
}

function finishSeq(values: number[], correct: boolean, attemptsNow: number) {
  emit('answered', { correct, attempts: attemptsNow })
  if (correct) {
    done.value = true
    feedback.value = 'correct'
  } else {
    feedback.value = 'wrong'
    picked.value = []
  }
}

function finish(val: number | string) {
  const correct = isAnswerCorrect(props.question, val)
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
.numberline-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.place-model {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.65rem;
}
.ten-bundle,
.ones-bundle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-height: 3rem;
  border: 1.5px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  background: var(--ui-bg-muted);
  padding: 0.45rem 0.65rem;
}
.ten-bundle {
  width: 9.4rem;
  flex-wrap: wrap;
}
.ones-bundle {
  min-width: 5.4rem;
}
.ten-bundle b,
.ones-bundle b {
  width: 100%;
  font-size: 0.8rem;
  color: var(--ui-text-toned);
}
.ten-unit,
.one-unit {
  width: 0.58rem;
  height: 1.3rem;
  border-radius: 9999px;
  background: var(--ui-primary);
}
.one-unit {
  width: 0.82rem;
  height: 0.82rem;
  background: var(--ui-color-amber-500, #f59e0b);
}
.model-op {
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--ui-primary);
}
.model-value {
  display: inline-flex;
  min-width: 3rem;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  border-radius: var(--ui-radius-xl);
  color: white;
  background: var(--ui-primary);
  font-size: 1.6rem;
  font-weight: 900;
}
.num-line {
  display: flex;
  gap: 0.35rem;
  max-width: 46rem;
  flex-wrap: wrap;
  justify-content: center;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-xl);
  padding: 0.9rem 1.2rem;
}
.num-line-tick {
  width: 2.1rem;
  text-align: center;
  font-size: 1.15rem;
  color: var(--ui-text-toned);
}
.num-line-tick.ten {
  color: var(--ui-primary);
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 0.25rem;
}
.num-line-tick.between {
  background: color-mix(in srgb, var(--ui-primary) 8%, var(--ui-bg));
  border-radius: 0.5rem;
}
.num-line-tick.active {
  background: var(--ui-primary);
  border-radius: 0.5rem;
  color: var(--ui-bg-inverted);
  font-weight: bold;
}
.numline-note {
  margin: -0.4rem 0 0;
  font-size: 0.95rem;
  color: var(--ui-text-toned);
}
.numline-note b {
  color: var(--ui-primary);
}
.seq-track {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding: 0.75rem 0.9rem;
  background: var(--ui-bg-muted);
  border: 2px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
}
.seq-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  border: 1.5px solid var(--ui-border);
  background: var(--ui-bg);
  color: var(--ui-text-muted);
  font-size: 1.3rem;
  font-weight: 900;
}
.seq-slot.filled {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, var(--ui-bg));
  color: var(--ui-primary);
}
.seq-arrow {
  color: var(--ui-primary);
  font-size: 1rem;
  font-weight: 900;
  margin-inline: -0.15rem;
}
.seq-stage {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
.seq-btn {
  width: 4rem;
  height: 4rem;
  font-size: 1.9rem;
  border-radius: var(--ui-radius-xl);
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg);
  cursor: pointer;
  color: var(--ui-text-highlighted);
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.seq-btn:hover:not(:disabled) {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.seq-btn.picked {
  background: var(--ui-color-primary-100);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: bold;
}
.seq-tip {
  color: var(--ui-text-muted);
  font-size: 1.1rem;
  margin: 0;
}

@media (max-width: 480px) {
  .numberline-game {
    gap: 0.9rem;
  }
  .place-model {
    gap: 0.4rem;
  }
  .ten-bundle {
    width: 7.2rem;
  }
  .ten-unit {
    width: 0.48rem;
    height: 1.05rem;
  }
  .num-line {
    gap: 0.22rem;
    padding: 0.7rem;
  }
  .num-line-tick {
    width: 1.55rem;
    font-size: 0.92rem;
  }
  .seq-slot,
  .seq-btn {
    width: 2.7rem;
    height: 2.7rem;
  }
  .seq-slot {
    font-size: 1.15rem;
  }
  .seq-btn {
    font-size: 1.45rem;
  }
}
</style>
