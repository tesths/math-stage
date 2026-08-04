<template>
  <div class="flex min-h-dvh flex-col">
    <UHeader
      :ui="{ root: 'border-b border-(--ui-border) bg-(--ui-bg)' }"
      title="五年级数学例题可视化"
      class="print:hidden"
    >
      <template #right>
        <div class="flex items-center gap-1">
          <UButton
            to="/games"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-cube"
            label="训练游戏"
          />
          <UButton to="/" variant="ghost" color="neutral" icon="i-heroicons-home" label="首页" />
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
