<script setup lang="ts">
/**
 * 重点概念提示卡：把数据层已有的 `lab.tip`（这道例题要建立的概念 / 算理）真正呈现给学生。
 *
 * 为什么默认收起：调研规则 3「分步揭示，不抢先给结论」。
 * 学生先在左侧图形上拖一拖、在「分步思考」里把算理说清楚，再回来对照这条概念，
 * 结论就不会被"看过即会"地跳过；老师/家长一键即可展开做讲解。
 */
import { computed, ref } from 'vue'

const props = defineProps<{
  /** 数据层 `LabDef.tip`：该例题想建立的核心概念 */
  tip?: string
  /** 书页码（与课本对照） */
  page: number
  /** 题源小节：例题 / 试一试 / 练一练 / 练习 / 探索 / 综合实践 */
  source: string
}>()

const tipText = computed(() => (props.tip ?? '').trim())
const hasTip = computed(() => tipText.value.length > 0)

const open = ref(false)
function toggle() {
  open.value = !open.value
}
</script>

<template>
  <section v-if="hasTip" class="concept-tip" data-test="concept-tip">
    <div class="concept-head">
      <span class="concept-badge">重点概念</span>
      <span class="concept-src">课本第 {{ page }} 页 · {{ source }}</span>
      <button
        type="button"
        class="concept-btn"
        :aria-expanded="open"
        data-test="concept-toggle"
        @click="toggle"
      >
        {{ open ? '收起' : '先想一想，再看提示' }}
      </button>
    </div>
    <p v-if="open" class="concept-body" data-test="concept-text">{{ tipText }}</p>
    <p v-else class="concept-hint">
      先在左边拖一拖、说一说：这道例题要建立什么概念？想好了再点开对照。
    </p>
  </section>
</template>

<style scoped>
.concept-tip {
  border: 1px solid color-mix(in srgb, var(--ui-primary) 35%, var(--ui-border));
  border-left-width: 4px;
  border-radius: var(--ui-radius-lg);
  background: color-mix(in srgb, var(--ui-primary) 6%, transparent);
  padding: 0.6rem 0.85rem;
}
.concept-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.concept-badge {
  border-radius: 9999px;
  background: var(--ui-primary);
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.1rem 0.55rem;
}
.concept-src {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.concept-btn {
  margin-left: auto;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 45%, var(--ui-border));
  border-radius: 9999px;
  background: transparent;
  color: var(--ui-primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.6rem;
  cursor: pointer;
}
.concept-btn:hover {
  background: color-mix(in srgb, var(--ui-primary) 14%, transparent);
}
.concept-body {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--ui-text-toned);
}
.concept-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
</style>
