<script setup lang="ts">
/** 门户首页：风格与一年级/五年级一致（Nuxt UI 浅色卡片） */
</script>

<template>
  <UContainer class="py-10 md:py-14">
    <div class="text-center">
      <UBadge color="primary" variant="soft" class="mb-4">📚 义务教育教科书 · 配套互动学习</UBadge>
      <h1 class="text-3xl font-bold tracking-tight text-(--ui-text-highlighted) md:text-4xl">
        小学数学互动学习平台
      </h1>
      <p class="mt-3 text-(--ui-text-muted)">
        例题可视化 · 参数可调 · 训练小游戏 —— 选择你的年级开始探索
      </p>
    </div>

    <div class="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
      <!-- 一年级（用原生 <a> 强制整页导航，不能用 NuxtLink：
           门户应用没有 /g1/ 路由，客户端路由会显示门户自己的 404） -->
      <a href="/g1/" class="block h-full">
        <UCard
          class="h-full transition-colors hover:bg-(--ui-bg-elevated)"
          :ui="{ root: 'h-full' }"
        >
          <div class="flex h-full flex-col items-center gap-3 py-2 text-center">
            <span class="text-4xl leading-none">🧮</span>
            <div>
              <UBadge color="orange" variant="soft" size="sm" class="mb-2">一年级 · 2022 版课标</UBadge>
              <h2 class="text-xl font-bold text-(--ui-text-highlighted)">数感启蒙 · 例题答题游戏</h2>
            </div>
            <ul class="mt-1 flex flex-col gap-1.5 text-sm text-(--ui-text-muted)">
              <li>🔢 9 个单元 · 78 道例题小游戏</li>
              <li>🎮 20 个课本主题游戏（抢10 / 数独 / 火柴棒…）</li>
              <li>🧸 数一数 / 加减法 / 图形 / 位置</li>
            </ul>
            <div class="mt-auto pt-2">
              <UButton color="orange" icon="i-heroicons-arrow-right-circle" trailing>
                进入一年级
              </UButton>
            </div>
          </div>
        </UCard>
      </a>

      <!-- 五年级 -->
      <a href="/g5/" class="block h-full">
        <UCard
          class="h-full transition-colors hover:bg-(--ui-bg-elevated)"
          :ui="{ root: 'h-full' }"
        >
          <div class="flex h-full flex-col items-center gap-3 py-2 text-center">
            <span class="text-4xl leading-none">📐</span>
            <div>
              <UBadge color="emerald" variant="soft" size="sm" class="mb-2">五年级 · 2022 版课标</UBadge>
              <h2 class="text-xl font-bold text-(--ui-text-highlighted)">例题可视化 · 参数实验室</h2>
            </div>
            <ul class="mt-1 flex flex-col gap-1.5 text-sm text-(--ui-text-muted)">
              <li>📐 8 个单元 · 33 个可调参数 Lab</li>
              <li>🧊 three.js 三视图 · chart.js 统计图 · 面积剪拼动画</li>
              <li>🎯 10 个训练游戏（面积速算 / 质数快抢 / 三视图配对…）</li>
            </ul>
            <div class="mt-auto pt-2">
              <UButton color="emerald" icon="i-heroicons-arrow-right-circle" trailing>
                进入五年级
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
