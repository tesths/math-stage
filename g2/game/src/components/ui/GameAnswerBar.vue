<script setup lang="ts">
/**
 * 答题条：选项选择 / 数字输入两种模式 + 反馈
 */
import { computed, ref, watch } from 'vue'
import { playCorrect, playWrong } from '@/lib/sound'

const props = withDefaults(
  defineProps<{
    options?: (number | string)[]
    answer: number | string
    mode?: 'select' | 'input'
    inputStep?: number
    inputMin?: number
    inputMax?: number
    label?: string
  }>(),
  { mode: 'select', inputStep: 0.1, inputMin: -100, inputMax: 100, label: '你的答案' },
)

const emit = defineEmits<{ answered: [correct: boolean] }>()

const selected = ref<number | string | null>(null)
const typed = ref('')
const state = ref<'idle' | 'correct' | 'wrong'>('idle')
const roundKey = ref(0)

const done = computed(() => state.value !== 'idle')
const correctValue = computed(() => String(props.answer))

function judge(v: number | string): boolean {
  if (typeof v === 'number') return v === props.answer
  return String(v).trim() === correctValue.value
}

function onSelect(v: number | string) {
  if (done.value) return
  selected.value = v
  const ok = judge(v)
  state.value = ok ? 'correct' : 'wrong'
  if (ok) playCorrect()
  else playWrong()
  emit('answered', ok)
}

function onSubmit() {
  if (done.value) return
  const num = Number(typed.value)
  if (Number.isNaN(num) || typed.value.trim() === '') return
  const ok = Math.abs(num - Number(props.answer)) < 1e-9
  state.value = ok ? 'correct' : 'wrong'
  if (ok) playCorrect()
  else playWrong()
  emit('answered', ok)
}

/** 下一题时重置（父组件调用） */
function reset() {
  selected.value = null
  typed.value = ''
  state.value = 'idle'
  roundKey.value++
}
defineExpose({ reset })

watch(() => props.answer, reset)
</script>

<template>
  <div class="answer-bar" :key="roundKey">
    <!-- 选项模式 -->
    <div v-if="mode === 'select'" class="option-grid">
      <button
        v-for="opt in options"
        :key="String(opt)"
        class="option-btn"
        :class="{
          correct: done && judge(opt),
          wrong: done && selected === opt && !judge(opt),
          dim: done && selected !== opt && !judge(opt),
        }"
        :disabled="done"
        @click="onSelect(opt)"
      >
        {{ opt }}
      </button>
    </div>

    <!-- 输入模式 -->
    <div v-else class="input-row">
      <span class="input-label">{{ label }}</span>
      <UInput
        v-model="typed"
        type="number"
        :step="inputStep"
        :min="inputMin"
        :max="inputMax"
        class="answer-input"
        size="lg"
        @keyup.enter="onSubmit"
      />
      <UButton color="primary" :disabled="done || typed === ''" @click="onSubmit">确定</UButton>
    </div>

    <p v-if="done" class="feedback" :class="state">
      {{ state === 'correct' ? '✅ 答对了！' : `❌ 正确答案是 ${correctValue}` }}
    </p>
  </div>
</template>

<style scoped>
.answer-bar {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  width: 100%;
}
.option-grid {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.option-btn {
  min-width: 4.5rem;
  padding: 0.55rem 1.1rem;
  border-radius: var(--ui-radius-lg);
  border: 2px solid var(--ui-border-accented);
  background: var(--ui-bg);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  transition: all 0.2s;
  cursor: pointer;
}
.option-btn:hover:not(:disabled) {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
}
.option-btn.correct {
  border-color: var(--ui-success, #16a34a);
  background: color-mix(in srgb, #16a34a 20%, transparent);
  color: #16a34a;
}
.option-btn.wrong {
  border-color: var(--ui-error, #dc2626);
  background: color-mix(in srgb, #dc2626 15%, transparent);
  color: #dc2626;
}
.option-btn.dim {
  opacity: 0.45;
}
.input-row {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.input-label {
  font-size: 0.95rem;
  color: var(--ui-text-muted);
}
.answer-input {
  width: 8rem;
}
.feedback {
  font-size: 1rem;
  font-weight: 700;
}
.feedback.correct {
  color: var(--ui-success, #16a34a);
}
.feedback.wrong {
  color: var(--ui-error, #dc2626);
}
</style>
