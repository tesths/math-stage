<script setup lang="ts">
import { computed } from 'vue'
import { byChapter, allExamples } from '@data'
import { ARCADE_GAMES, unitNoOf } from '@/lib/arcade'
import type { GameType } from '@data/schema/example'

const units = computed(() =>
  byChapter.map(({ meta, examples }) => ({ meta, count: examples.length })),
)

const unitGames = computed(() =>
  units.value.map((u) => ({
    meta: u.meta,
    games: ARCADE_GAMES.filter((m) => m.chapters.includes(u.meta.id)),
  })),
)

/** 一张卡片上标注该游戏全部适用单元，如 2、6、7 */
const unitNosOf = (m: (typeof ARCADE_GAMES)[number]) => m.chapters.map(unitNoOf).join('、')

const total = computed(() => allExamples.length)

/** 每种玩法的入口演示：取该类第一道例题 */
const TYPE_DEMOS: { type: GameType; label: string; icon: string }[] = [
  { type: 'count', label: '数一数', icon: '🔢' },
  { type: 'write', label: '写一写', icon: '✍️' },
  { type: 'split', label: '分与合', icon: '🍬' },
  { type: 'addsub', label: '加减法', icon: '➕' },
  { type: 'compare', label: '比一比', icon: '⚖️' },
  { type: 'ordinal', label: '第几个', icon: '🥇' },
  { type: 'position', label: '位置', icon: '🧭' },
  { type: 'shape3d', label: '立体图形', icon: '🧊' },
  { type: 'numberline', label: '十几', icon: '🔟' },
  { type: 'sequence', label: '顺数', icon: '🎢' },
  { type: 'ten', label: '抢10', icon: '🃏' },
]

const demos = computed(() =>
  TYPE_DEMOS.map((t) => ({
    ...t,
    demo: allExamples.find((e) => e.type === t.type),
  })),
)
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <div class="text-center">
      <UBadge color="primary" variant="soft" class="mb-4">苏教版 · 2022 版课标</UBadge>
      <h1 class="text-3xl font-bold tracking-tight text-(--ui-text-highlighted) md:text-4xl">
        一年级数学例题游戏
      </h1>
      <p class="mt-3 text-(--ui-text-muted)">《义务教育教科书·数学一年级上册》配套互动演示</p>
      <p class="mt-1 text-sm text-(--ui-text-muted)">
        {{ units.length }} 个单元 · {{ total }} 道例题 · {{ demos.length }} 种玩法
      </p>
    </div>

    <section class="mt-10">
      <div class="mb-4 flex items-baseline gap-2">
        <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">课本目录</h2>
        <span class="text-sm text-(--ui-text-muted)">点单元进入例题演示</span>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="u in units"
          :key="u.meta.id"
          :to="`/units/${u.meta.id}`"
          class="unit-card block h-full"
        >
          <UCard class="h-full transition-colors hover:bg-(--ui-bg-elevated)">
            <div class="flex items-start gap-4">
              <span class="text-3xl leading-none">{{ u.meta.icon }}</span>
              <div class="min-w-0 flex-1">
                <h3 class="font-semibold text-(--ui-text-highlighted)">
                  <UBadge v-if="u.meta.tocLabel" color="primary" variant="soft" size="sm" class="mr-2">
                    {{ u.meta.tocLabel }}
                  </UBadge>
                  {{ u.meta.title }}
                </h3>
                <p class="mt-1.5 text-sm text-(--ui-text-muted)">{{ u.meta.summary }}</p>
                <p class="mt-2 text-xs text-(--ui-text-muted)">
                  书页 {{ u.meta.pageStart }}–{{ u.meta.pageEnd }} · 例题 {{ u.count }} 道
                </p>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>

    <section class="mt-10">
      <div class="mb-4 flex items-baseline gap-2">
        <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">玩法演示</h2>
        <span class="text-sm text-(--ui-text-muted)">点任一玩法直接开一题试一试</span>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <NuxtLink
          v-for="d in demos"
          :key="d.type"
          :to="d.demo ? `/play/${d.demo.id}` : '/'"
          class="demo-card block h-full"
        >
          <UCard class="h-full text-center transition-colors hover:bg-(--ui-bg-elevated)">
            <div class="flex h-full flex-col items-center gap-2 py-1">
              <span class="text-2xl">{{ d.icon }}</span>
              <strong class="font-semibold text-(--ui-text-highlighted)">{{ d.label }}</strong>
              <span class="text-xs text-(--ui-text-muted)">{{ d.demo?.title }}</span>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>

    <section class="mt-10">
      <div class="mb-4 flex items-baseline gap-2">
        <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">游戏专区</h2>
        <span class="text-sm text-(--ui-text-muted)">20 个随机出题小游戏 · 按对应单元分组，方便按单元找游戏</span>
      </div>
      <div class="space-y-6">
        <div v-for="ug in unitGames" :key="ug.meta.id" class="unit-game-group">
          <div class="mb-2 flex items-center gap-2">
            <span class="text-lg leading-none">{{ ug.meta.icon }}</span>
            <h3 class="font-semibold text-(--ui-text-highlighted)">第 {{ ug.meta.no }} 单元</h3>
            <span class="text-sm text-(--ui-text-muted)">{{ ug.meta.title }}</span>
            <span v-if="ug.games.length" class="text-xs text-(--ui-text-muted)">{{ ug.games.length }} 个</span>
          </div>
          <div
            v-if="ug.games.length"
            class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            <NuxtLink
              v-for="m in ug.games"
              :key="m.slug"
              :to="`/games/${m.slug}`"
              class="home-game-card block h-full"
            >
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
          <p v-else class="text-sm text-(--ui-text-muted)">
            本单元暂无配套小游戏（适合课堂互动：我说你做）
          </p>
        </div>
      </div>
      <div class="mt-4">
        <UButton
          to="/games"
          variant="outline"
          color="primary"
          icon="i-heroicons-arrow-right-circle"
          trailing
          label="按概念分组浏览全部游戏"
        />
      </div>
    </section>
  </UContainer>
</template>
