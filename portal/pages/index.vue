<script setup lang="ts">
/**
 * 门户首页：年级卡片由共享年级注册表（@shared/grades）生成，
 * 新增年级只需在 shared/grades/index.ts 加一条记录。
 * 注意：跨应用进入年级必须用原生 <a href>（门户应用没有 /g1/ /g5/ 路由，NuxtLink 会 404）。
 */
import { GRADES } from '@shared/grades'
import { THEME } from '@shared/theme'
</script>

<template>
  <UContainer class="py-10 md:py-14">
    <div class="text-center">
      <UBadge color="primary" variant="soft" class="mb-4">📚 义务教育教科书 · 配套互动学习</UBadge>
      <h1 class="text-3xl font-bold tracking-tight text-(--ui-text-highlighted) md:text-4xl">
        {{ THEME.siteName }}
      </h1>
      <p class="mt-3 text-(--ui-text-muted)">
        例题可视化 · 参数可调 · 训练小游戏 —— 选择你的年级开始探索
      </p>
    </div>

    <div class="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
      <a
        v-for="g in GRADES"
        :key="g.id"
        :href="g.base"
        class="block h-full"
        rel="external"
      >
        <UCard class="card-hover h-full" :ui="{ root: 'h-full' }">
          <div class="flex h-full flex-col items-center gap-3 py-2 text-center">
            <span class="text-4xl leading-none">{{ g.icon }}</span>
            <div>
              <UBadge :color="g.accent" variant="soft" size="sm" class="mb-2">
                {{ g.standard }}
              </UBadge>
              <h2 class="text-xl font-bold text-(--ui-text-highlighted)">{{ g.tagline }}</h2>
            </div>
            <ul class="mt-1 flex flex-col gap-1.5 text-sm text-(--ui-text-muted)">
              <li v-for="f in g.features" :key="f.text">
                {{ f.icon }} {{ f.text }}
              </li>
            </ul>
            <div class="mt-auto pt-2">
              <UButton :color="g.accent" icon="i-heroicons-arrow-right-circle" trailing>
                {{ g.cta }}
              </UButton>
            </div>
          </div>
        </UCard>
      </a>
    </div>

    <p class="mt-10 text-center text-xs text-(--ui-text-muted)">
      基于 Nuxt UI 构建 · 部署于 Cloudflare Pages
    </p>
  </UContainer>
</template>
