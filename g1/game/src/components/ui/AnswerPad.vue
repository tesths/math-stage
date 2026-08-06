<template>
  <div class="answer-pad flex flex-wrap justify-center gap-3">
    <UButton
      v-for="(opt, i) in options"
      :key="i"
      class="answer-btn"
      :class="btnClass(opt)"
      :variant="btnVariant(opt)"
      :color="btnColor(opt)"
      :disabled="disabled"
      :data-opt="String(opt)"
      :aria-pressed="selected === opt ? 'true' : null"
      size="lg"
      @click="emit('select', opt)"
    >
      {{ opt }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  options: (number | string)[]
  selected?: number | string | null
  disabled?: boolean
  /** 展示对错标记时使用 */
  correctValue?: number | string
  showResult?: boolean
}>()

const emit = defineEmits<{ select: [value: number | string] }>()

type State = 'selected' | 'correct' | 'wrong'

function stateOf(opt: number | string): State | null {
  if (props.showResult) {
    if (props.correctValue === opt) return 'correct'
    if (props.selected === opt) return 'wrong'
    return null
  }
  if (props.selected === opt) return 'selected'
  return null
}

const btnClass = (opt: number | string): string[] => {
  const s = stateOf(opt)
  return s ? [s] : []
}

const btnVariant = (opt: number | string): 'solid' | 'outline' => (stateOf(opt) ? 'solid' : 'outline')

const btnColor = (opt: number | string): 'success' | 'error' | 'neutral' => {
  const s = stateOf(opt)
  if (s === 'correct') return 'success'
  if (s === 'wrong') return 'error'
  return 'neutral'
}
</script>