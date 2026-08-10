<script setup lang="ts">
/**
 * 训练游戏：画"正"字统计
 */
import { useQuizGame, type QuizRound } from '@/lib/games/useQuizGame'
import { zhengCount } from '@/lib/engine/math'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function zheng(n: number): string {
  const { chars, strokes } = zhengCount(n)
  return '正'.repeat(chars) + '一'.repeat(strokes)
}

function makeRound(): QuizRound {
  const cats = [
    { name: '苹果', emoji: '🍎' },
    { name: '橘子', emoji: '🍊' },
    { name: '香蕉', emoji: '🍌' },
    { name: '葡萄', emoji: '🍇' },
  ]
  const counts = cats.map(() => randInt(4, 15))
  const total = counts.reduce((a, b) => a + b, 0)
  const askTotal = Math.random() < 0.5
  if (askTotal) {
    return {
      question: cats
        .map((c, i) => `${c.emoji} ${c.name}：${zheng(counts[i]!)}`)
        .join('\n') + '\n调查了一共有几人？',
      hint: '一个"正"字表示 5 人',
      answer: total,
      options: [total + 1, total - 1, total + 5, total - 3],
    }
  }
  const idx = randInt(0, cats.length - 1)
  return {
    question: cats.map((c, i) => `${c.emoji} ${c.name}：${zheng(counts[i]!)}`).join('\n') + `\n喜欢${cats[idx]!.name}的有几人？`,
    hint: '数一数对应的"正"字：一个正 5 人',
    answer: counts[idx]!,
    options: [counts[idx]! + 1, counts[idx]! - 1, counts[idx]! + 5, counts[idx]! - 2],
  }
}

const game = useQuizGame(makeRound)
</script>

<template>
  <div class="game">
    <div v-if="game.finished.value" class="finish">
      <p class="finish-title">✏️ 统计小能手！</p>
      <p class="finish-sub">5 题答对 {{ game.score.value }} 题</p>
      <UButton color="primary" size="lg" @click="game.restart()">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ game.roundNo.value }}/5 题</span>
        <span>得分 {{ game.score.value }}</span>
      </div>

      <div class="expr-card">
        <p class="tally-q">{{ game.rd.value.question }}</p>
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
  text-align: left;
  max-width: 36rem;
}
.tally-q {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  line-height: 1.7;
  white-space: pre-line;
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
