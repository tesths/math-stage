<template>
  <div class="flex min-h-dvh flex-col">
    <UHeader
      :ui="{ root: 'border-b border-(--ui-border) bg-(--ui-bg)' }"
      title="五年级数学例题可视化"
      class="print:hidden"
    >
      <template #right>
        <div class="flex items-center gap-1">
          <a
            href="/g1/"
            rel="external"
            class="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-(--ui-primary) transition-colors hover:bg-(--ui-bg-elevated)"
          >
            <UIcon name="i-heroicons-arrow-left-circle" class="size-4" />
            一年级
          </a>
          <UButton
            to="/games"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-cube"
            label="训练游戏"
          />
          <a
            href="/"
            rel="external"
            class="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-(--ui-text-muted) transition-colors hover:bg-(--ui-bg-elevated)"
          >
            <UIcon name="i-heroicons-home" class="size-4" />
            首页
          </a>
        </div>
      </template>
    </UHeader>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-(--ui-border) py-6 text-center text-sm text-(--ui-text-muted)">
      《义务教育教科书·数学》苏教版五年级上册 配套互动演示 · 例题可视化可拖动参数实时计算
    </footer>
  </div>
</template>
