<template>
  <svg class="match-digit" viewBox="0 0 12 22" :width="width ?? 28" :height="(width ?? 28) * 1.833" aria-hidden="true">
    <rect
      v-for="seg in SEGMENTS[digit] ?? []"
      :key="seg"
      :x="SEG_RECTS[seg]!.x"
      :y="SEG_RECTS[seg]!.y"
      :width="SEG_RECTS[seg]!.w"
      :height="SEG_RECTS[seg]!.h"
      rx="1.6"
      class="match-seg"
    />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ digit: string; width?: number }>()

const SEG_RECTS: Record<string, { x: number; y: number; w: number; h: number }> = {
  a: { x: 1.6, y: 0.4, w: 8.8, h: 2.2 },
  b: { x: 9.4, y: 2.4, w: 2.2, h: 8.2 },
  c: { x: 9.4, y: 12.4, w: 2.2, h: 8.2 },
  d: { x: 1.6, y: 20.4, w: 8.8, h: 2.2 },
  e: { x: 0.4, y: 12.4, w: 2.2, h: 8.2 },
  f: { x: 0.4, y: 2.4, w: 2.2, h: 8.2 },
  g: { x: 1.6, y: 10.9, w: 8.8, h: 2.2 },
}

const SEGMENTS: Record<string, string[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'c', 'd', 'e'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
}
</script>

<style scoped>
.match-digit {
  display: inline-block;
  vertical-align: middle;
}
.match-seg {
  fill: var(--ui-color-amber-700);
}
</style>
