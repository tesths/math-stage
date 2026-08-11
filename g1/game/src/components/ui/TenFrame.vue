<template>
  <div class="ten-frame" :class="{ interactive }">
    <button
      v-for="idx in 10"
      :key="idx"
      type="button"
      class="tf-cell"
      :class="cellClass(idx)"
      :aria-label="`第 ${idx} 格`"
      :disabled="!interactive || done"
      @click="onCell(idx)"
    >
      <span v-if="hasObj(idx)" class="tf-obj">{{ objects?.[idx - 1] ?? obj }}</span>
      <span v-if="showBadge(idx)" class="tf-badge">{{ badgeOf(idx) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 已点亮（有对象）的格数 */
    litCount: number
    /** 格内对象符号，默认 ● */
    obj?: string
    /** 逐格对象（优先于 obj），如 ⚽⚽🏀🏀 */
    objects?: string[]
    /** 是否可点击逐个计数 */
    interactive?: boolean
    /** 选对答案后全部点亮 */
    done?: boolean
    /** 计数轨迹：点亮格显示序号徽标 */
    showBadges?: boolean
  }>(),
  { obj: '●', interactive: false, done: false, showBadges: false }
)

const emit = defineEmits<{ cell: [index: number] }>()

const lit = computed(() => (idx: number) => props.done || idx <= props.litCount)

/** 对象一直可见（未点亮时淡显），保证初始态可数 */
const hasObj = computed(() => (idx: number) =>
  (props.objects?.length ?? 0) > 0 ? idx <= (props.objects?.length ?? 0) : idx <= props.litCount
)

function cellClass(idx: number): Record<string, boolean> {
  return {
    lit: lit.value(idx),
    faded: !lit.value(idx),
    clickable: props.interactive && !props.done,
  }
}

function showBadge(idx: number): boolean {
  return props.showBadges && lit.value(idx) && !props.done
}

function badgeOf(idx: number): number {
  return idx
}

function onCell(idx: number) {
  if (!props.interactive || props.done) return
  emit('cell', idx)
}
</script>

<style scoped>
.ten-frame {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.45rem;
  width: 100%;
  max-width: 24rem;
  padding: 0.7rem;
  background: var(--ui-bg-muted);
  border: 2px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
}
.tf-cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.7rem;
  border: 1.5px dashed var(--ui-border-accented);
  background: var(--ui-bg);
  font-size: 1.7rem;
  padding: 0;
  cursor: default;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}
.tf-cell.lit {
  border-style: solid;
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, var(--ui-bg));
}
.tf-cell.clickable {
  cursor: pointer;
}
.tf-cell.clickable:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: var(--ui-primary);
}
.tf-cell:disabled {
  opacity: 1;
}
.tf-cell.faded {
  opacity: 0.45;
}
.tf-obj {
  line-height: 1;
}
.tf-badge {
  position: absolute;
  top: -0.35rem;
  right: -0.35rem;
  min-width: 1.1rem;
  height: 1.1rem;
  border-radius: 9999px;
  background: var(--ui-primary);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.2rem;
}
</style>