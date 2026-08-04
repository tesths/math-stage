<template>
  <div
    class="question-card rounded-xl border border-(--ui-border) bg-(--ui-bg-elevated) px-6 py-5 text-center"
  >
    <div class="mb-2 flex items-center justify-between">
      <UBadge v-if="source" color="primary" variant="soft" size="sm">{{ source }}</UBadge>
      <span v-if="page != null" class="text-xs text-(--ui-text-muted)">书页 {{ page }}</span>
    </div>
    <h2 class="q-title text-2xl font-bold text-(--ui-text-highlighted)">{{ title }}</h2>
    <p class="q-prompt mt-1.5 text-(--ui-text-muted)">{{ prompt }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  prompt: string
  page?: number
  source?: string
}>()
</script>