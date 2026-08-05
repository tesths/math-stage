<script setup lang="ts">
import { GAMES, unitNoOf } from '@/lib/games'

const grouped = Object.entries(
  GAMES.reduce<Record<string, typeof GAMES>>((acc, m) => {
    const key = m.chapters.map(unitNoOf).join('、')
    ;(acc[key] ??= []).push(m)
    return acc
  }, {}),
)
</script>

<template>
  <UContainer class="max-w-4xl py-6 md:py-8">
    <UButton to="/" variant="ghost" color="neutral" icon="i-heroicons-arrow-left" label="返回首页" class="mb-4" />

    <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">🎮 训练小游戏专区</h1>
    <p class="mt-1 text-(--ui-text-muted)">每个游戏对应课本单元知识点，随机出题，反复练习</p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink v-for="m in GAMES" :key="m.slug" :to="`/games/${m.slug}`" class="block h-full">
        <UCard class="h-full transition-colors hover:bg-(--ui-bg-elevated)">
          <div class="flex items-center gap-3">
            <span class="text-3xl leading-none">{{ m.icon }}</span>
            <div class="min-w-0">
              <p class="font-semibold text-(--ui-text-highlighted)">{{ m.name }}</p>
              <p class="mt-0.5 text-xs text-(--ui-text-muted)">适用第 {{ m.chapters.map(unitNoOf).join('、') }} 单元</p>
            </div>
          </div>
          <p class="mt-3 text-sm text-(--ui-text-muted)">{{ m.summary }}</p>
          <p class="mt-2 text-xs text-(--ui-text-toned)">玩法：{{ m.howTo }}</p>
        </UCard>
      </NuxtLink>
    </div>
  </UContainer>
</template>
