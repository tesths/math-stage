<template>
  <UAlert
    v-if="state !== 'idle'"
    class="feedback"
    :class="state"
    :color="state === 'correct' ? 'success' : 'error'"
    variant="soft"
    :icon="state === 'correct' ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
    :title="state === 'correct' ? '回答正确，真棒！' : '再想一想'"
  >
    <template v-if="state === 'wrong'" #description>
      正确答案是：{{ answerText ?? correctAnswer }}
    </template>
  </UAlert>
</template>

<script setup lang="ts">
defineProps<{
  state: 'idle' | 'correct' | 'wrong'
  correctAnswer: number | string
  answerText?: string
}>()
</script>