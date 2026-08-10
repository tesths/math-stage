<script setup lang="ts">
/**
 * 训练游戏：平移旋转辨识
 */
import { useQuizGame, type QuizRound } from '@/lib/games/useQuizGame'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

const ITEMS: { desc: string; kind: '平移' | '旋转'; icon: string }[] = [
  { desc: '国旗升起', kind: '平移', icon: '🇨🇳' },
  { desc: '电风扇叶片转动', kind: '旋转', icon: '🌀' },
  { desc: '推拉抽屉', kind: '平移', icon: '🗄️' },
  { desc: '拧开瓶盖', kind: '旋转', icon: '🍶' },
  { desc: '火车沿直线行驶', kind: '平移', icon: '🚆' },
  { desc: '汽车车轮转动', kind: '旋转', icon: '🚗' },
  { desc: '摩天轮旋转', kind: '旋转', icon: '🎡' },
  { desc: '滑滑梯下滑', kind: '平移', icon: '🛝' },
  { desc: '钟表指针走动', kind: '旋转', icon: '🕰️' },
  { desc: '自动门左右移动', kind: '平移', icon: '🚪' },
  { desc: '转椅转动', kind: '旋转', icon: '🪑' },
  { desc: '电梯上下移动', kind: '平移', icon: '🛗' },
]

function makeRound(): QuizRound {
  const item = ITEMS[Math.floor(Math.random() * ITEMS.length)]!
  return {
    question: `${item.icon} ${item.desc}，是平移还是旋转？`,
    hint: '平移沿直线移动，旋转绕一个固定点转动',
    answer: item.kind,
    options: ['平移', '旋转'],
  }
}

const game = useQuizGame(makeRound)
</script>

<template>
  <div class="game">
    <div v-if="game.finished.value" class="finish">
      <p class="finish-title">🎯 运动小侦探！</p>
      <p class="finish-sub">5 题答对 {{ game.score.value }} 题</p>
      <UButton color="primary" size="lg" @click="game.restart()">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ game.roundNo.value }}/5 题</span>
        <span>得分 {{ game.score.value }}</span>
      </div>

      <div class="expr-card">
        <p class="expr">{{ game.rd.value.question }}</p>
        <p class="hint">{{ game.rd.value.hint }}</p>
      </div>

      <GameAnswerBar
        :key="game.roundNo.value"
        :options="game.rd.value.options"
        :answer="game.rd.value.answer"
        @answered="game.onAnswered"
      />
      <UButton v-if="game.done.value" color="primary" size="lg" @click="game.next()">
        {{ game.roundNo.value >= 5 ? '查看成绩' : '下一题' }}
      </UButton>
    </template>
  </div>
</template>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: 100%;
}
.game-top {
  display: flex;
  gap: 1.5rem;
  font-size: 0.95rem;
  color: var(--ui-text-muted);
}
.expr-card {
  text-align: center;
  max-width: 36rem;
}
.expr {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.hint {
  font-size: 0.82rem;
  color: var(--ui-text-muted);
  margin-top: 0.3rem;
}
.finish {
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
}
</style>
