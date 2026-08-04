<template>
  <div class="flex min-h-dvh flex-col">
    <UHeader
      :ui="{ root: 'border-b border-(--ui-border) bg-(--ui-bg)' }"
      title="一年级数学例题游戏"
      class="print:hidden"
    >
      <template #right>
        <!-- 切换至五年级：必须用原生 <a>（UButton as=a 会被 Nuxt 改写 href 成 /g1/g5/；
             UButton to 走客户端路由 404） -->
        <a
          href="/g5/"
          rel="external"
          class="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-(--ui-primary) transition-colors hover:bg-(--ui-bg-elevated)"
        >
          <UIcon name="i-heroicons-arrow-right-circle" class="size-4" />
          五年级
        </a>
        <a
          href="/"
          rel="external"
          class="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-(--ui-text-muted) transition-colors hover:bg-(--ui-bg-elevated)"
        >
          <UIcon name="i-heroicons-home" class="size-4" />
          首页
        </a>
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