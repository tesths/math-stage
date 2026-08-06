<template>
  <div class="balance-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ round }}/5 题</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">⚖️ 天平大师！</p>
      <p class="finish-sub">5 题全对，共答错 {{ totalWrong }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="scale" data-test="scale">
        <div class="pan">
          <p class="pan-label">左盘</p>
          <div class="pan-items">
            <template v-if="rd.mode === 'expr'">
              <div class="expr-group">
                <span v-for="(c, i) in leftAUnits" :key="'a' + i" class="pan-item">{{ c }}</span>
              </div>
              <span class="expr-plus">＋</span>
              <div class="expr-group">
                <span v-for="(c, i) in leftBUnits" :key="'b' + i" class="pan-item">{{ c }}</span>
              </div>
            </template>
            <template v-else>
              <span v-for="(c, i) in leftUnits" :key="i" class="pan-item">{{ c }}</span>
            </template>
          </div>
        </div>
        <div class="beam">⚖️</div>
        <div class="pan pan-right">
          <p class="pan-label">右盘</p>
          <div class="pan-placeholder">放砝码</div>
        </div>
      </div>

      <AnswerPad
        :options="rd.options"
        :selected="selected"
        :disabled="done"
        :correct-value="rd.answer"
        :show-result="done"
        @select="onSelect"
      />
      <FeedbackOverlay :state="feedback" :correct-answer="rd.answer" />
      <UButton v-if="done" color="primary" size="lg" @click="nextRound">
        下一题
      </UButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { newBalanceRound, type BalanceRound } from '@/lib/arcade/balance'
import { visibleUnits } from '@/lib/engine/count'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong } from '@/lib/sound'

const round = ref(1)
const rd = ref<BalanceRound>(newBalanceRound(1))
const selected = ref<number | null>(null)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const totalWrong = ref(0)
const finished = ref(false)

const leftUnits = computed(() => visibleUnits('🍎'.repeat(rd.value.left)))
const leftAUnits = computed(() => visibleUnits('🍎'.repeat(rd.value.leftParts[0] ?? 0)))
const leftBUnits = computed(() => visibleUnits('🍎'.repeat(rd.value.leftParts[1] ?? 0)))

function onSelect(v: number | string) {
  if (done.value) return
  selected.value = Number(v)
  if (Number(v) === rd.value.answer) {
    done.value = true
    feedback.value = 'correct'
    playCorrect()
  } else {
    totalWrong.value += 1
    feedback.value = 'wrong'
    playWrong()
  }
}

function nextRound() {
  if (round.value >= 5) {
    finished.value = true
    return
  }
  round.value += 1
  rd.value = newBalanceRound(round.value)
  selected.value = null
  done.value = false
  feedback.value = 'idle'
}

function restart() {
  round.value = 1
  totalWrong.value = 0
  finished.value = false
  rd.value = newBalanceRound(1)
  selected.value = null
  done.value = false
  feedback.value = 'idle'
}
</script>

<style scoped>
.balance-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.game-top {
  font-size: 1.05rem;
  color: var(--ui-text-muted);
}
.scale {
  display: flex;
  gap: 1.2rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
.pan {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 10rem;
}
.pan-label {
  font-size: 1rem;
  color: var(--ui-text-muted);
}
.pan-items {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-xl);
  padding: 0.7rem 1rem;
  min-height: 4.5rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 16rem;
}
.expr-group {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
}
.expr-plus {
  font-size: 1.6rem;
  color: var(--ui-primary);
  font-weight: bold;
}
.pan-item {
  font-size: 2rem;
}
.beam {
  font-size: 2.6rem;
}
.pan-placeholder {
  color: var(--ui-text-muted);
  font-size: 1rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  padding: 1.5rem 1.6rem;
}
.finish-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  padding: 2rem 0;
}
.finish-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.finish-sub {
  color: var(--ui-text-muted);
  margin-bottom: 0.6rem;
}
</style>
