<script setup lang="ts">
/**
 * 训练游戏：三视图配对（数一数看到的个数）
 */
import { useQuizGame, type QuizRound } from '@/lib/games/useQuizGame'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Shape {
  desc: string
  front: number
  right: number
  top: number
}

const SHAPES: Shape[] = [
  { desc: '长方体（3×2×1）', front: 3, right: 2, top: 6 },
  { desc: '长方体（2×3×1）', front: 2, right: 3, top: 6 },
  { desc: '3 个正方体叠成一竖', front: 3, right: 3, top: 1 },
  { desc: '正方体（2×2×2）', front: 2, right: 2, top: 4 },
  { desc: '长方体（4×1×1）', front: 4, right: 1, top: 4 },
]

const DIRS = ['前面', '右面', '上面'] as const

function makeRound(): QuizRound {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]!
  const dir = DIRS[Math.floor(Math.random() * DIRS.length)]!
  const answer = dir === '前面' ? shape.front : dir === '右面' ? shape.right : shape.top
  const others = new Set([shape.front, shape.right, shape.top])
  others.delete(answer)
  const pool = [answer, ...others, answer + 1, Math.max(1, answer - 1)]
  return {
    question: `用同样大的小正方体摆成${shape.desc}，从${dir}看能看到几个小正方形？`,
    hint: '从某个方向看，只数能看到的那一面上的小正方形',
    answer,
    options: [...new Set(pool)].slice(0, 4),
  }
}

const game = useQuizGame(makeRound)
</script>

<template>
  <div class="game">
    <div v-if="game.finished.value" class="finish">
      <p class="finish-title">🧊 观察小专家！</p>
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
  font-size: 1.25rem;
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
