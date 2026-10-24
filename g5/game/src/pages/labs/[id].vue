<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { animate } from 'animejs'
import { findLabById, labsOfChapter, chapters } from '@data'
import type { LabDef, ParamValues } from '@data/schema/lab'
import ParamControl from '@/components/lab/ParamControl.vue'
import ConceptTip from '@shared/components/ConceptTip.vue'
import { labComponentFor } from '@/lib/labs/registry'
import { computeLab } from '@/lib/labs/compute'
import { playClick } from '@/lib/sound'

const route = useRoute()
const labId = computed(() => String(route.params.id))
const lab = computed<LabDef | undefined>(() => findLabById(labId.value))

if (!lab.value) {
  throw createError({ statusCode: 404, statusMessage: 'Lab 不存在' })
}

const labList = computed(() => labsOfChapter(lab.value!.chapter))
const index = computed(() => labList.value.findIndex((l) => l.id === labId.value))
const chapter = computed(() => chapters.find((c) => c.id === lab.value!.chapter))

/** 参数当前值（响应式） */
const values = reactive<ParamValues>({})
for (const p of lab.value.params) values[p.key] = p.default
if (lab.value.fixed) for (const [k, v] of Object.entries(lab.value.fixed)) values[k] = v
const shapeKey = ref(0)

function resetParams() {
  for (const p of lab.value!.params) values[p.key] = p.default
  shapeKey.value++
  playClick()
}

const result = computed(() => computeLab(lab.value!.kind, values, lab.value))

/** animejs：结果变化时数值滚动 + 结果框弹跳 + 步骤交错淡入 */
const resultBoxRef = ref<HTMLElement | null>(null)
const stepListRef = ref<HTMLElement | null>(null)
let lastResultText = ''
watch(result, (r) => {
  if (r.text === lastResultText) return
  lastResultText = r.text
  if (resultBoxRef.value) {
    animate(resultBoxRef.value, {
      scale: [1.04, 1],
      translateY: [3, 0],
      duration: 320,
      easing: 'easeOutQuad',
    })
  }
  if (stepListRef.value) {
    const items = stepListRef.value.querySelectorAll('li')
    animate(items, {
      opacity: [0, 1],
      translateX: [-8, 0],
      delay: 80,
      duration: 350,
      easing: 'easeOutQuad',
    })
  }
})

const stageRef = ref<HTMLElement | null>(null)
function animateIn() {
  const el = stageRef.value
  if (!el) return
  animate(el, { translateY: [14, 0], opacity: [0, 1], duration: 300, easing: 'easeOutQuad' })
}

function goNext() {
  const next = labList.value[index.value + 1]
  playClick()
  if (next) void navigateTo(`/labs/${next.id}`)
  else void navigateTo(`/units/${lab.value!.chapter}`)
}

watch(labId, (now, prev) => {
  // 水合期 `route.params.id` 会先空、后到：这一次不是「换了一道题」，
  // 绝不能 bump shapeKey —— 否则客户端挂载后整块 Lab 组件被重建，
  // 学生/截图脚本在挂载后 1 秒内点出的过程态会被无声清回初始态
  // （第 4 轮实测：g6-c4-ex-football-ratio 单次点击触发两次，随后组件重建，-act 与初始态逐字节相同）。
  if (!prev || prev === now) return
  for (const p of lab.value!.params) values[p.key] = p.default
  if (lab.value!.fixed) for (const [k, v] of Object.entries(lab.value!.fixed)) values[k] = v
  shapeKey.value++
  void nextTick(animateIn)
})
</script>

<template>
  <UContainer v-if="lab" class="max-w-7xl py-6 md:py-8">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <UButton
        :to="`/units/${lab.chapter}`"
        variant="ghost"
        color="neutral"
        icon="i-heroicons-arrow-left"
        label="返回单元"
      />
      <span class="text-sm text-(--ui-text-muted)">
        {{ chapter?.title }} · 第 {{ index + 1 }}/{{ labList.length }} 个（书页 {{ lab.page }}）
      </span>
      <div class="flex gap-2">
        <UButton
          variant="outline"
          color="neutral"
          :disabled="index <= 0"
          icon="i-heroicons-chevron-left"
          label="上一个"
          @click="index > 0 && navigateTo(`/labs/${labList[index - 1]!.id}`)"
        />
        <UButton
          variant="outline"
          color="neutral"
          :disabled="index >= labList.length - 1"
          label="下一个"
          trailing
          icon="i-heroicons-chevron-right"
          @click="goNext"
        />
      </div>
    </div>

    <div ref="stageRef" class="lab-stage">
      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 class="text-xl font-bold text-(--ui-text-highlighted)">{{ lab.title }}</h1>
              <p class="mt-1 text-sm text-(--ui-text-muted)">{{ lab.prompt }}</p>
            </div>
            <UBadge color="primary" variant="soft">{{ lab.source }}</UBadge>
          </div>
        </template>

        <!-- 参数面板 -->
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ClientOnly>
            <div class="lab-visual min-h-[460px]">
              <component
                :is="labComponentFor(lab.kind)"
                :key="`${lab.id}-${shapeKey}`"
                :lab="lab"
                :values="values"
              />
            </div>
            <template #fallback>
              <div class="flex min-h-[460px] items-center justify-center text-(--ui-text-muted)">
                加载可视化…
              </div>
            </template>
          </ClientOnly>

          <!-- 右侧：滑块 + 结果 -->
          <div class="flex flex-col gap-4">
            <ParamControl
              v-for="p in lab.params"
              :key="p.key"
              :param="p"
              :model-value="values[p.key] ?? p.default"
              @update:model-value="(v: number) => (values[p.key] = v)"
              @pick="playClick"
            />

            <div ref="resultBoxRef" class="result-box">
              <p class="text-xs text-(--ui-text-muted)">{{ lab.formula }}</p>
              <p class="mt-1 text-3xl font-bold text-(--ui-primary)">{{ result.text }}</p>
            </div>

            <UButton size="sm" variant="outline" color="neutral" icon="i-heroicons-arrow-path" @click="resetParams">
              重置参数
            </UButton>
          </div>
        </div>

        <!-- 分步计算 -->
        <div class="mt-5 border-t border-(--ui-border) pt-4">
          <p class="mb-2 text-sm font-semibold text-(--ui-text-highlighted)">分步思考</p>
          <ol ref="stepListRef" class="space-y-1.5">
            <li
              v-for="(s, i) in result.steps"
              :key="i"
              class="flex items-baseline gap-2 text-sm"
            >
              <span class="step-no">{{ i + 1 }}</span>
              <span class="font-mono text-(--ui-text-highlighted)">{{ s.expr }}</span>
              <span class="text-(--ui-text-muted)">→ {{ s.result }}</span>
            </li>
          </ol>
          <p class="mt-3 rounded-lg bg-(--ui-bg-muted) px-3 py-2 text-sm text-(--ui-text-toned)">
            💡 {{ result.conclusion }}
          </p>
        </div>

        <!-- 重点概念：数据层 tip，默认收起（先动手、后看概念） -->
        <div class="mt-4">
          <ConceptTip :tip="lab.tip" :page="lab.page" :source="lab.source" />
        </div>
      </UCard>
    </div>

    <div class="mt-6 flex justify-center">
      <UButton
        v-if="index < labList.length - 1"
        color="primary"
        label="下一个例题"
        trailing
        icon="i-heroicons-arrow-right"
        @click="goNext"
      />
      <UButton v-else color="primary" :to="`/units/${lab.chapter}`" label="返回单元" />
    </div>
  </UContainer>
</template>

<style scoped>
.result-box {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.7rem 0.9rem;
  background: var(--ui-bg-muted);
}
.step-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 9999px;
  background: var(--ui-primary);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
