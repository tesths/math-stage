<script setup lang="ts">
/**
 * 全平台统一布局壳：顶栏（标题 + 年级切换 + 首页）+ 主区 + 页脚。
 * 由共享年级注册表驱动，新增年级自动出现在顶栏切换中。
 * 注意：跨应用导航必须用原生 <a href>（NuxtLink/UButton 会在本应用内找不到对端路由）。
 */
import { UButton, UHeader, UIcon } from '#components'
import { gradeById, otherGrades, type GradeId } from '../grades'

const props = defineProps<{
  gradeId: GradeId
  /** 顶栏右侧的站内链接（如训练游戏），数组项支持 { label, to } 或字符串路由 */
  nav?: { label: string; to: string; icon?: string }[]
}>()

const grade = gradeById(props.gradeId)!
const others = otherGrades(props.gradeId)

const linkClass =
  'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors'
const mobileLinkClass =
  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors'
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <UHeader
      :ui="{ root: 'border-b border-(--ui-border) bg-(--ui-bg)' }"
      :title="grade.title"
      class="print:hidden"
    >
      <template #right>
        <div class="hidden items-center gap-1 lg:flex">
          <!-- 其他年级切换（原生 <a>，绝对路径） -->
          <a
            v-for="g in others"
            :key="g.id"
            :href="g.base"
            rel="external"
            class="text-(--ui-primary) hover:bg-(--ui-bg-elevated)"
            :class="linkClass"
          >
            <UIcon
              :name="g.no < grade.no ? 'i-heroicons-arrow-left-circle' : 'i-heroicons-arrow-right-circle'"
              class="size-4"
            />
            {{ g.label }}
          </a>
          <!-- 站内导航（本应用路由，可用客户端导航） -->
          <UButton
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            variant="ghost"
            color="neutral"
            :icon="item.icon"
            :label="item.label"
          />
          <!-- 回门户首页 -->
          <a
            href="/"
            rel="external"
            class="text-(--ui-text-muted) hover:bg-(--ui-bg-elevated)"
            :class="linkClass"
          >
            <UIcon name="i-heroicons-home" class="size-4" />
            首页
          </a>
        </div>
      </template>

      <template #body>
        <nav class="flex flex-col gap-1 lg:hidden">
          <a
            v-for="g in others"
            :key="g.id"
            :href="g.base"
            rel="external"
            class="text-(--ui-primary) hover:bg-(--ui-bg-elevated)"
            :class="mobileLinkClass"
          >
            <UIcon
              :name="g.no < grade.no ? 'i-heroicons-arrow-left-circle' : 'i-heroicons-arrow-right-circle'"
              class="size-4"
            />
            {{ g.label }}
          </a>
          <UButton
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            variant="ghost"
            color="neutral"
            :icon="item.icon"
            :label="item.label"
            block
          />
          <a
            href="/"
            rel="external"
            class="text-(--ui-text-muted) hover:bg-(--ui-bg-elevated)"
            :class="mobileLinkClass"
          >
            <UIcon name="i-heroicons-home" class="size-4" />
            首页
          </a>
        </nav>
      </template>
    </UHeader>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-(--ui-border) py-6 text-center text-sm text-(--ui-text-muted)">
      {{ grade.footer }}
    </footer>
  </div>
</template>
