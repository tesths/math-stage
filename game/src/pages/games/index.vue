<script setup lang="ts">
import { computed } from 'vue'
import { ARCADE_GAMES, GROUP_LABELS, unitNoOf, type ArcadeGroup } from '@/lib/arcade'

const groups = computed<ArcadeGroup[]>(() => ['pair', 'numline', 'calc', 'logic'])

const gamesOf = (g: ArcadeGroup) => ARCADE_GAMES.filter((m) => m.group === g)

const unitLabels = (m: (typeof ARCADE_GAMES)[number]) =>
  m.chapters.map((c) => `第${unitNoOf(c)}单元`)
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <UButton to="/" variant="ghost" color="neutral" icon="i-heroicons-arrow-left" label="返回首页" class="mb-6" />

    <div class="text-center">
      <h1 class="text-3xl font-bold tracking-tight text-(--ui-text-highlighted)">游戏专区</h1>
      <p class="mt-3 text-(--ui-text-muted)">
        20 个互动小游戏 · 按概念分组 · 每个卡片标注适用单元 · 点开即玩，每题随机生成
      </p>
    </div>

    <section v-for="g in groups" :key="g" class="mt-10">
      <div class="mb-4 flex items-baseline gap-2">
        <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">{{ GROUP_LABELS[g] }}</h2>
        <span class="text-sm text-(--ui-text-muted)">{{ gamesOf(g).length }} 个游戏</span>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <NuxtLink
          v-for="m in gamesOf(g)"
          :key="m.slug"
          :to="`/games/${m.slug}`"
          class="arcade-card block h-full"
        >
          <UCard class="h-full transition-colors hover:bg-(--ui-bg-elevated)">
            <div class="flex h-full flex-col items-center gap-2 py-2 text-center">
              <span class="text-3xl">{{ m.icon }}</span>
              <strong class="font-semibold text-(--ui-text-highlighted)">{{ m.name }}</strong>
              <span class="text-xs text-(--ui-text-muted)">{{ m.summary }}</span>
              <div class="mt-1 flex flex-wrap justify-center gap-1">
                <UBadge
                  v-for="label in unitLabels(m)"
                  :key="label"
                  color="primary"
                  variant="soft"
                  size="sm"
                  class="game-unit-badge"
                >
                  {{ label }}
                </UBadge>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>
  </UContainer>
</template>
