<script setup lang="ts">
/**
 * 训练游戏：24 时记时法互转
 */
import { useQuizGame, type QuizRound } from '@/lib/games/useQuizGame'
import { time12Text } from '@/lib/engine/math'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function fmt24(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function makeRound(): QuizRound {
  const hour = randInt(0, 23)
  const minute = [0, 15, 30, 45][randInt(0, 3)]!
  const t = time12Text(hour)
  const t24 = fmt24(hour, minute)
  const reverse = Math.random() < 0.5
  let question: string
  let answer: string
  let options: string[]
  const pool: string[] = []
  if (reverse) {
    question = `${t.period}${t.display}时${minute ? minute + '分' : ''} 用 24 时记时法表示是？`
    answer = t24
    const hourVariants = [
      fmt24(hour + 1, minute),
      fmt24(hour - 1, minute),
      fmt24(hour, minute + 15),
      fmt24((hour + 12) % 24, minute),
    ]
    for (const h of hourVariants) {
      if (h !== answer) pool.push(h)
    }
  } else {
    question = `${t24} 用普通记时法表示是？`
    answer = `${t.period}${t.display}时${minute ? minute + '分' : ''}`
    const wrong = [
      `${t.period}${t.display === 12 ? 0 : t.display + 1}时${minute ? minute + '分' : ''}`,
      `${t.period === '上午' || t.period === '凌晨' ? '下午' : '上午'}${t.display}时${minute ? minute + '分' : ''}`,
      `${t.period}${t.display - 1}时${minute ? minute + '分' : ''}`,
      `${t.period}${t.display}时${minute === 0 ? 30 + '分' : minute + 15}分`,
    ]
    for (const w of wrong) {
      if (w !== answer && w !== '凌晨0时' && w !== '下午0时') pool.push(w)
    }
  }
  options = [answer, ...pool].slice(0, 4)
  return { question, hint: '下午/晚上的时刻换算成 24 时制要加 12', answer, options }
}

const game = useQuizGame(makeRound)
</script>

<template>
  <div class="game">
    <div v-if="game.finished.value" class="finish">
      <p class="finish-title">🕐 时间小达人！</p>
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
  font-size: 1.35rem;
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
