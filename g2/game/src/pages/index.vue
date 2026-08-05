<script setup lang="ts">
import { computed } from 'vue'
import { byChapter, totalLabs } from '@data'
import { GAMES, unitNoOf } from '@/lib/games'

const units = computed(() =>
  byChapter.map(({ meta, labs }) => ({ meta, count: labs.length, first: labs[0]?.id })),
)

const unitGames = computed(() =>
  units.value.map((u) => ({ meta: u.meta, games: GAMES.filter((m) => m.chapters.includes(u.meta.id)) })),
)

const unitNosOf = (m: (typeof GAMES)[number]) => m.chapters.map(unitNoOf).join('、')

const unitCount = computed(() => units.value.filter((u) => u.count > 0).length)
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <div class="text-center">
      <UBadge color="primary" variant="soft" class="mb-4">苏教版 · 2022 版课标 · 2025 新编 · 二年级上册</UBadge>
      <h1 class="text-3xl font-bold tracking-tight text-(--ui-text-highlighted) md:text-4xl">
        二年级数学例题可视化
      </h1>
      <p class="mt-3 text-(--ui-text-muted)">《义务教育教科书·数学》苏教版二年级上册配套互动演示</p>
      <p class="mt-1 text-sm text-(--ui-text-muted)">
        {{ unitCount }} 个单元 · {{ totalLabs }} 个可调参数例题 Lab · {{ GAMES.length }} 个训练小游戏
      </p>
    </div>

    <section class="mt-10">
      <div class="mb-4 flex items-baseline gap-2">
        <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">课本单元 · 例题可视化</h2>
        <span class="text-sm text-(--ui-text-muted)">拖动参数即可实时观察图形与计算结果</span>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="u in units"
          :key="u.meta.id"
          :to="u.count ? `/units/${u.meta.id}` : '/'"
          class="block h-full"
        >
          <UCard class="h-full transition-colors hover:bg-(--ui-bg-elevated)">
            <div class="flex items-start gap-4">
              <span class="text-3xl leading-none">{{ u.meta.icon }}</span>
              <div class="min-w-0 flex-1">
                <h3 class="font-semibold text-(--ui-text-highlighted)">
                  <UBadge color="primary" variant="soft" size="sm" class="mr-2">
                    {{ u.meta.tocLabel }}
                  </UBadge>
                  {{ u.meta.title }}
                </h3>
                <p class="mt-1.5 text-sm text-(--ui-text-muted)">{{ u.meta.summary }}</p>
                <p class="mt-2 text-xs text-(--ui-text-muted)">
                  书页 {{ u.meta.pageStart }}–{{ u.meta.pageEnd }} · Lab {{ u.count }} 个
                </p>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>

    <section class="mt-10">
      <div class="mb-4 flex items-baseline gap-2">
        <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">训练小游戏</h2>
        <span class="text-sm text-(--ui-text-muted)">{{ GAMES.length }} 个 · 按对应单元分组</span>
      </div>
      <div class="space-y-6">
        <div v-for="ug in unitGames" :key="ug.meta.id" class="unit-game-group">
          <div class="mb-2 flex items-center gap-2">
            <span class="text-lg leading-none">{{ ug.meta.icon }}</span>
            <h3 class="font-semibold text-(--ui-text-highlighted)">第 {{ ug.meta.no }} 单元</h3>
            <span class="text-sm text-(--ui-text-muted)">{{ ug.meta.title }}</span>
            <span v-if="ug.games.length" class="text-xs text-(--ui-text-muted)">{{ ug.games.length }} 个</span>
          </div>
          <div v-if="ug.games.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <NuxtLink v-for="m in ug.games" :key="m.slug" :to="`/games/${m.slug}`" class="block h-full">
              <UCard class="h-full transition-colors hover:bg-(--ui-bg-elevated)">
                <div class="flex items-center gap-2.5 py-1">
                  <span class="text-2xl leading-none">{{ m.icon }}</span>
                  <div class="min-w-0">
                    <p class="font-medium leading-tight text-(--ui-text-highlighted)">{{ m.name }}</p>
                    <p class="mt-0.5 text-xs text-(--ui-text-muted)">适用第 {{ unitNosOf(m) }} 单元</p>
                  </div>
                </div>
              </UCard>
            </NuxtLink>
          </div>
          <p v-else class="text-sm text-(--ui-text-muted)">本单元暂无配套训练游戏</p>
        </div>
      </div>
      <div class="mt-4">
        <UButton
          to="/games"
          variant="outline"
          color="primary"
          icon="i-heroicons-cube"
          trailing
          label="浏览全部训练游戏"
        />
      </div>
    </section>
  </UContainer>
</template>
