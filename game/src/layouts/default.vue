<template>
  <div class="flex min-h-dvh flex-col">
    <UHeader
      :ui="{ root: 'border-b border-(--ui-border) bg-(--ui-bg)' }"
      title="一年级数学例题游戏"
      class="print:hidden"
    >
      <template #right>
        <UButton to="/" variant="ghost" color="neutral" icon="i-heroicons-home" label="首页" />
      </template>
    </UHeader>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-(--ui-border) py-6 text-center text-sm text-(--ui-text-muted)">
      《义务教育教科书·数学》一年级上册 配套互动演示
    </footer>
  </div>
</template>