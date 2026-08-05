<script setup lang="ts">
/**
 * 训练游戏：质量单位换算（克/千克/吨）
 */
import { useQuizGame, type QuizRound } from '@/lib/games/useQuizGame'
import { WEIGHT_G, WEIGHT_UNITS } from '@/lib/engine/math'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

interface Convert {
  from: (typeof WEIGHT_UNITS)[number]
  to: (typeof WEIGHT_UNITS)[number]
  value: number
}

function makeConvert(): Convert {
  const pairs: [number, number][] = [
    [0, 1], [1, 0], [1, 2], [2, 1],
  ]
  const [fi, ti] = pairs[randInt(0, pairs.length - 1)]!
  const from = WEIGHT_UNITS[fi]!
  const to = WEIGHT_UNITS[ti]!
  let value: number
  if (from === '克') value = randInt(1, 9) * 1000
  else if (from === '千克') value = randInt(1, 9)
  else value = randInt(1, 9)
  return { from, to, value }
}

function makeRound(): QuizRound {
  const c = makeConvert()
  const answer = (c.value * WEIGHT_G[c.from]) / WEIGHT_G[c.to]
  const pool = [
    answer + WEIGHT_G[c.from] / WEIGHT_G[c.to],
    answer * 10,
    answer / 10,
    answer + 1000,
    answer * 100,
  ]
  return {
    question: `${c.value} ${c.from} = ? ${c.to}`,
    hint: `1 千克 = 1000 克，1 吨 = 1000 千克`,
    answer,
    options: [...new Set(pool)].slice(0, 4),
  }
}

const game = useQuizGame(makeRound)
</script>

<template>
  <div class="game">
    <div v-if="game.finished.value" class="finish">
      <p class="finish-title">⚖️ 称重小专家！</p>
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
}
.expr {
  font-size: 2rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
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
