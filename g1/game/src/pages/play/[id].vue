<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { animate } from 'animejs'
import { findById, examplesOfChapter, chapters } from '@data'
import type { GameQuestion } from '@data/schema/example'
import { gameComponentFor } from '@/lib/engine/registry'
import { playCorrect, playWrong, playClick } from '@/lib/sound'
import QuestionCard from '@/components/ui/QuestionCard.vue'

const route = useRoute()
const questionId = computed(() => String(route.params.id))
const question = computed<GameQuestion | undefined>(() => findById(questionId.value))

if (!question.value) {
  throw createError({ statusCode: 404, statusMessage: '题目不存在' })
}

const examples = computed(() => examplesOfChapter(question.value!.chapter))
const index = computed(() => examples.value.findIndex((e) => e.id === questionId.value))
const chapter = computed(() => chapters.find((c) => c.id === question.value!.chapter))

// 当前题会话状态
const selKey = ref(0)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const answered = computed(() => feedback.value !== 'idle')

const game = computed(() => gameComponentFor(question.value!.type))
const stageRef = ref<HTMLElement | null>(null)

function animateIn() {
  const el = stageRef.value
  if (!el) return
  animate(el, {
    translateY: [18, 0],
    opacity: [0, 1],
    duration: 320,
    easing: 'easeOutQuad',
  })
}

function onAnswered({ correct }: { correct: boolean }) {
  feedback.value = correct ? 'correct' : 'wrong'
  if (correct) {
    playCorrect()
  } else {
    playWrong()
  }
}

function resetCurrent() {
  feedback.value = 'idle'
  selKey.value++
  void nextTick().then(animateIn)
}

async function prevQuestion() {
  const prev = examples.value[index.value - 1]
  if (!prev) return
  playClick()
  await navigateTo(`/play/${prev.id}`)
}

function nextQuestion() {
  const next = examples.value[index.value + 1]
  playClick()
  if (next) {
    void navigateTo(`/play/${next.id}`)
  } else {
    // 最后一题：回到单元页
    void navigateTo(`/units/${question.value!.chapter}`)
  }
}
</script>

<template>
  <UContainer v-if="question" class="max-w-7xl py-6 md:py-8">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <UButton
        :to="`/units/${question.chapter}`"
        variant="ghost"
        color="neutral"
        icon="i-heroicons-arrow-left"
        label="返回单元"
      />
      <span class="text-sm text-(--ui-text-muted)">
        {{ chapter?.title }} · 例题 {{ index + 1 }} / {{ examples.length }}（书页 {{ question.page }}）
      </span>
      <div class="flex gap-2">
        <UButton
          variant="outline"
          color="neutral"
          :disabled="index <= 0"
          icon="i-heroicons-chevron-left"
          label="上一题"
          @click="prevQuestion"
        />
        <UButton
          variant="outline"
          color="neutral"
          :disabled="index >= examples.length - 1"
          label="下一题"
          trailing
          icon="i-heroicons-chevron-right"
          @click="nextQuestion"
        />
      </div>
    </div>

    <div ref="stageRef" class="play-stage">
      <QuestionCard
        :title="question.title"
        :prompt="question.prompt"
        :page="question.page"
        :source="question.source"
      />
      <UCard
        class="game-slot mt-4 min-h-[400px]"
        :ui="{ body: 'flex flex-col justify-center gap-3' }"
      >
        <ClientOnly>
          <component :is="game" :key="selKey" :question="question" @answered="onAnswered" />
        </ClientOnly>
      </UCard>
    </div>

    <div v-if="answered" class="mt-6 flex justify-center">
      <UButton v-if="feedback === 'wrong'" label="再试一次" @click="resetCurrent" />
      <UButton
        v-else
        color="primary"
        label="下一题"
        trailing
        icon="i-heroicons-arrow-right"
        @click="nextQuestion"
      />
    </div>
  </UContainer>
</template>
