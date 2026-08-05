<script setup lang="ts">
/**
 * 二年级布局：统一 GradeShell（共享组件），站内导航为训练游戏。
 */
import GradeShell from '@shared/components/GradeShell.vue'
</script>

<template>
  <GradeShell grade-id="g2" :nav="[{ label: '训练游戏', to: '/games', icon: 'i-heroicons-cube' }]">
    <slot />
  </GradeShell>
</template>
