<script setup lang="ts">
import { computed } from 'vue'
import { byChapter } from '@data'
import { ARCADE_GAMES } from '@/lib/arcade'

const route = useRoute()
const id = computed(() => String(route.params.id))
const unit = computed(() => byChapter.find((u) => u.meta.id === id.value))

if (!unit.value) {
  throw createError({ statusCode: 404, statusMessage: '单元不存在' })
}

const relatedGames = computed(() =>
  ARCADE_GAMES.filter((g) => g.chapters.includes(id.value as never)),
)
</script>

<template>
  <UContainer v-if="unit" class="max-w-3xl py-8 md:py-10">
    <UButton
      to="/"
      variant="ghost"
      color="neutral"
      icon="i-heroicons-arrow-left"
      label="返回首页"
      class="mb-6"
    />

    <div class="mb-8 text-center">
      <div class="mx-auto mb-3 grid size-16 place-items-center rounded-2xl bg-(--ui-bg-elevated) text-4xl">
        {{ unit.meta.icon }}
      </div>
      <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">
        <UBadge v-if="unit.meta.tocLabel" color="primary" variant="soft" class="mr-2">
          {{ unit.meta.tocLabel }}
        </UBadge>
        {{ unit.meta.title }}
      </h1>
      <p class="mt-2 text-(--ui-text-muted)">{{ unit.meta.summary }}</p>
      <p class="mt-1 text-sm text-(--ui-text-muted)">
        书页 {{ unit.meta.pageStart }}–{{ unit.meta.pageEnd }} · {{ unit.examples.length }} 道例题
      </p>
    </div>

    <div class="flex flex-col gap-3">
      <NuxtLink
        v-for="(ex, i) in unit.examples"
        :key="ex.id"
        :to="`/play/${ex.id}`"
        class="ex-card block"
      >
        <UCard class="transition-colors hover:bg-(--ui-bg-elevated)">
          <div class="flex items-center gap-4">
            <span
              class="grid size-9 shrink-0 place-items-center rounded-full bg-(--ui-primary) text-sm font-bold text-(--ui-bg-inverted)"
            >
              {{ i + 1 }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="mb-1">
                <UBadge color="primary" variant="soft" size="sm">{{ ex.source }}</UBadge>
              </div>
              <h2 class="font-semibold text-(--ui-text-highlighted)">{{ ex.title }}</h2>
              <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ ex.prompt }}</p>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="size-5 shrink-0 text-(--ui-text-muted)" />
          </div>
        </UCard>
      </NuxtLink>
    </div>

    <div v-if="relatedGames.length" class="mt-10">
      <div class="mb-4 flex items-baseline gap-2">
        <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">本单元游戏</h2>
        <span class="text-sm text-(--ui-text-muted)">学完概念，去游戏专区练一练</span>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <NuxtLink
          v-for="g in relatedGames"
          :key="g.slug"
          :to="`/games/${g.slug}`"
          class="related-game block"
        >
          <UCard class="text-center transition-colors hover:bg-(--ui-bg-elevated)">
            <div class="flex flex-col items-center gap-1.5 py-1">
              <span class="text-2xl">{{ g.icon }}</span>
              <strong class="text-sm font-semibold text-(--ui-text-highlighted)">{{ g.name }}</strong>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>
  </UContainer>
</template>
