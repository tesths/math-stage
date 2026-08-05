<script setup lang="ts">
import { computed } from 'vue'
import { GAMES } from '@/lib/games'
import { gameComponentFor } from '@/lib/games/registry'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const meta = computed(() => GAMES.find((m) => m.slug === slug.value))

if (!meta.value) {
  throw createError({ statusCode: 404, statusMessage: '游戏不存在' })
}

const game = computed(() => gameComponentFor(slug.value))
</script>

<template>
  <UContainer v-if="meta" class="max-w-3xl py-6 md:py-8">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <UButton
        to="/games"
        variant="ghost"
        color="neutral"
        icon="i-heroicons-arrow-left"
        label="返回专区"
      />
      <span class="text-sm text-(--ui-text-muted)">
        {{ meta.icon }} {{ meta.name }} · 适用第 {{ meta.chapters.map((c) => c.slice(1)).join('、') }} 单元
      </span>
    </div>

    <div class="mb-4 text-center">
      <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">{{ meta.icon }} {{ meta.name }}</h1>
      <p class="mt-2 text-(--ui-text-muted)">{{ meta.summary }}</p>
      <p class="mt-1 text-sm text-(--ui-text-toned)">玩法：{{ meta.howTo }}</p>
    </div>

    <UCard class="game-slot min-h-[320px]" :ui="{ body: 'flex flex-col justify-center gap-3' }">
      <ClientOnly>
        <component :is="game" v-if="game" />
      </ClientOnly>
    </UCard>
  </UContainer>
</template>
