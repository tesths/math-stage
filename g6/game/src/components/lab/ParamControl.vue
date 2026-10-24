<script setup lang="ts">
/**
 * 单个参数控件：有 `options` 时渲染按钮组，否则渲染滑块。
 *
 * 抽成独立组件是为了可测：直接内联在 `pages/labs/[id].vue` 里时，
 * "有选项就不显示 unit 那串例题序号""点击把选项值写回参数"这些行为没法单独断言。
 */
import { computed } from 'vue'
import type { LabParam } from '@data/schema/lab'

const props = defineProps<{ param: LabParam; modelValue: number }>()
const emit = defineEmits<{ 'update:modelValue': [number]; pick: [] }>()

const options = computed(() => props.param.options ?? [])
const hasOptions = computed(() => options.value.length > 0)
/** 右侧显示：有选项时显示选项名称，否则显示数值 */
const display = computed(() => {
  if (!hasOptions.value) return String(props.modelValue)
  const hit = options.value.find((o) => o.value === props.modelValue)
  return hit ? hit.label : String(props.modelValue)
})

function pick(v: number) {
  emit('update:modelValue', v)
  emit('pick')
}
</script>

<template>
  <div class="param-block" :data-param="param.key">
    <div class="mb-1 flex items-baseline justify-between">
      <label class="text-sm font-medium text-(--ui-text-highlighted)">
        {{ param.label }}
        <!-- 有离散选项时不再显示 unit：那串「0=xxx 1=yyy」的信息已经由按钮承载 -->
        <span v-if="!hasOptions && param.unit" class="text-xs text-(--ui-text-muted)">{{ param.unit }}</span>
      </label>
      <strong class="text-(--ui-primary)">{{ display }}</strong>
    </div>

    <div v-if="hasOptions" class="param-options">
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        class="param-option"
        :data-act="o.value === modelValue ? null : ''"
        :class="{ active: o.value === modelValue }"
        :aria-pressed="o.value === modelValue"
        @click="pick(o.value)"
      >
        {{ o.label }}
      </button>
    </div>

    <template v-else>
      <input
        :value="modelValue"
        type="range"
        class="lab-range"
        :min="param.min"
        :max="param.max"
        :step="param.step"
        @input="pick(Number(($event.target as HTMLInputElement).value))"
      />
      <div class="mt-0.5 flex justify-between text-[11px] text-(--ui-text-muted)">
        <span>{{ param.min }}</span><span>{{ param.max }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* 滑块样式必须写在组件内：页面的 scoped 样式不会作用到子组件内部的 input */
.lab-range {
  width: 100%;
  accent-color: var(--ui-primary);
  cursor: pointer;
}
.param-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.param-option {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  cursor: pointer;
  transition: all 0.15s;
}
.param-option:hover {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.param-option.active {
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
</style>
