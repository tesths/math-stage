<script setup lang="ts">
/**
 * 训练游戏：混合运算快算（含小括号）
 */
import { useQuizGame, type QuizRound } from '@/lib/games/useQuizGame'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

type Op = '+' | '−' | '×' | '÷'

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): QuizRound {
  const withBracket = Math.random() < 0.5
  let question: string
  let answer: number
  if (withBracket) {
    const a = randInt(3, 9)
    const b = randInt(2, 9)
    const inner: Op = Math.random() < 0.5 ? '+' : '−'
    const c = Math.random() < 0.5 ? randInt(2, 9) : randInt(2, 9)
    let innerVal = inner === '+' ? a + b : a - b
    if (innerVal <= 0) innerVal = a + b
    const outer: Op = Math.random() < 0.5 ? '×' : '÷'
    if (outer === '×') {
      answer = innerVal * c
    } else {
      innerVal = a + b
      answer = Math.floor(innerVal / c)
    }
    question = `(${a} ${inner} ${b}) ${outer} ${c}`
  } else {
    const a = randInt(3, 9)
    const b = randInt(2, 9)
    const op: Op = Math.random() < 0.5 ? '+' : '−'
    const c = randInt(2, 9)
    const mid = op === '+' ? a + b : a - b
    const rest: Op = Math.random() < 0.5 ? '×' : '÷'
    if (rest === '×') {
      answer = mid * c
    } else {
      answer = Math.floor(mid / c)
    }
    question = `${a} ${op} ${b} ${rest} ${c}`
  }
  const pool: number[] = []
  for (let i = 0; i < 8; i++) {
    pool.push(answer + randInt(-9, 9))
  }
  return {
    question: `${question} = ?`,
    hint: '先算乘除，再算加减；有小括号先算小括号里的',
    answer,
    options: [...new Set(pool)].slice(0, 4),
  }
}

const game = useQuizGame(makeRound)
</script>

<template>
  <div class="game">
    <div v-if="game.finished.value" class="finish">
      <p class="finish-title">➕ 运算小达人！</p>
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
