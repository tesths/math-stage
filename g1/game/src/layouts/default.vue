<script setup lang="ts">
/**
 * 一年级布局：统一 GradeShell（共享组件）。
 */
import GradeShell from '@shared/components/GradeShell.vue'
</script>

<template>
  <GradeShell grade-id="g1">
    <slot />
  </GradeShell>
</template>
