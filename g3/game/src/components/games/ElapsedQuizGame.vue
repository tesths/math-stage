<script setup lang="ts">
/**
 * 训练游戏：经过时间的计算
 */
import { useQuizGame, type QuizRound } from '@/lib/games/useQuizGame'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function fmt(hour: number, minute: number): string {
  const period = hour < 12 ? '上午' : hour < 18 ? '下午' : '晚上'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${period} ${h}时${minute ? minute + '分' : ''}`
}

function makeRound(): QuizRound {
  const useMinute = Math.random() < 0.4
  const startHour = randInt(6, 16)
  const durH = randInt(1, 4)
  let answer: string
  let question: string
  if (useMinute) {
    const startMin = randInt(0, 3) * 15
    const endMin = startMin + 15
    const endHour = startHour + durH + (endMin >= 60 ? 1 : 0)
    const m = endMin >= 60 ? endMin - 60 : endMin
    answer = `${durH}小时${m === 0 ? '' : m + '分'}`
    question = `${fmt(startHour, startMin)}到${fmt(endHour, m)}，经过了多少时间？`
  } else {
    const endHour = startHour + durH
    answer = `${durH}小时`
    question = `${fmt(startHour, 0)}到${fmt(endHour, 0)}，经过了多少时间？`
  }
  const pool = [
    `${durH + 1}小时`,
    `${durH - 1}小时`,
    `${durH}小时30分`,
    `${durH}小时45分`,
    `${durH + 2}小时`,
  ]
  const options = [answer, ...pool.filter((x) => x !== answer)].slice(0, 4)
  return { question, hint: '结束时刻减开始时刻，分钟不够减向前借 1 小时', answer, options }
}

const game = useQuizGame(makeRound)
</script>

<template>
  <div class="game">
    <div v-if="game.finished.value" class="finish">
      <p class="finish-title">⏱️ 时间计算高手！</p>
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
  max-width: 26rem;
}
.expr {
  font-size: 1.3rem;
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
