<script setup lang="ts">
/**
 * 训练游戏：间隔排列推理
 */
import { useQuizGame, type QuizRound } from '@/lib/games/useQuizGame'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): QuizRound {
  const circle = Math.random() < 0.35
  if (circle) {
    const n = randInt(4, 12)
    return {
      question: `男生和女生一个隔一个手拉手围成一圈，男生有 ${n} 人，女生有几人？`,
      hint: '围成一圈首尾相接：男生人数 = 女生人数',
      answer: n,
      options: [n, n + 1, n - 1, n * 2],
    }
  }
  const same = Math.random() < 0.5
  const n = randInt(4, 12)
  if (same) {
    return {
      question: `小兔和蘑菇一个隔一个排成一行，两端都是小兔，小兔有 ${n} 只，蘑菇有几个？`,
      hint: '两端相同：其中一种比另一种多 1 个',
      answer: n - 1,
      options: [n - 1, n, n + 1, n * 2],
    }
  }
  return {
    question: `小兔和蘑菇一个隔一个排成一行，两端物体不同（一端小兔一端蘑菇），小兔有 ${n} 只，蘑菇有几个？`,
    hint: '两端不同：两种物体一样多',
    answer: n,
    options: [n, n + 1, n - 1, n * 2],
  }
}

const game = useQuizGame(makeRound)
</script>

<template>
  <div class="game">
    <div v-if="game.finished.value" class="finish">
      <p class="finish-title">🔗 规律小达人！</p>
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
