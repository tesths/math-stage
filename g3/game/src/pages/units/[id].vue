<script setup lang="ts">
import { computed } from 'vue'
import { chapters, labsOfChapter } from '@data'
import type { ChapterId } from '@data/schema/lab'
import { KIND_LABELS } from '@/lib/engine/math'

const route = useRoute()
const chapterId = computed(() => String(route.params.id) as ChapterId)
const chapter = computed(() => chapters.find((c) => c.id === chapterId.value))

if (!chapter.value) {
  throw createError({ statusCode: 404, statusMessage: '单元不存在' })
}

const labs = computed(() => labsOfChapter(chapterId.value))
</script>

<template>
  <UContainer v-if="chapter" class="max-w-4xl py-6 md:py-8">
    <UButton to="/" variant="ghost" color="neutral" icon="i-heroicons-arrow-left" label="返回首页" class="mb-4" />

    <div class="mb-6">
      <UBadge color="primary" variant="soft">{{ chapter.tocLabel }}</UBadge>
      <h1 class="mt-2 text-2xl font-bold text-(--ui-text-highlighted)">
        {{ chapter.icon }} {{ chapter.title }}
      </h1>
      <p class="mt-1 text-(--ui-text-muted)">{{ chapter.summary }}</p>
      <p class="mt-1 text-sm text-(--ui-text-muted)">书页 {{ chapter.pageStart }}–{{ chapter.pageEnd }}</p>
    </div>

    <div v-if="labs.length" class="grid gap-4 md:grid-cols-2">
      <NuxtLink
        v-for="(l, i) in labs"
        :key="l.id"
        :to="`/labs/${l.id}`"
        class="block h-full"
      >
        <UCard class="h-full transition-colors hover:bg-(--ui-bg-elevated)">
          <div class="flex items-start gap-3">
            <span class="lab-index">{{ i + 1 }}</span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-(--ui-text-highlighted)">{{ l.title }}</h3>
                <UBadge size="sm" variant="subtle" color="neutral">{{ l.source }}</UBadge>
              </div>
              <p class="mt-1 text-sm text-(--ui-text-muted)">{{ l.prompt }}</p>
              <p class="mt-2 text-xs text-(--ui-text-toned)">
                {{ KIND_LABELS[l.kind] }} · 书页 {{ l.page }} ·
                可调参数：{{ l.params.map((p) => p.label).join('、') }}
              </p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
    <p v-else class="rounded-lg bg-(--ui-bg-muted) p-6 text-center text-(--ui-text-muted)">
      本单元暂无可视化 Lab。
    </p>
  </UContainer>
</template>

<style scoped>
.lab-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 9999px;
  background: var(--ui-primary);
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
