<script setup lang="ts">
/**
 * 训练游戏：数量关系挑战（两步计算实际问题）
 */
import { useQuizGame, type QuizRound } from '@/lib/games/useQuizGame'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): QuizRound {
  const t = randInt(1, 4)
  let question: string
  let answer: number
  const pool: number[] = []
  if (t === 1) {
    const total = randInt(3, 9) * 100
    const p1 = randInt(1, 4) * 100
    const p2 = randInt(1, 4) * 100
    answer = total - p1 - p2
    question = `一共采摘 ${total} 箱水果，上午运走 ${p1} 箱，下午运走 ${p2} 箱，还剩多少箱？`
    pool.push(answer + 100, answer - 100, answer + p1, answer - p2)
  } else if (t === 2) {
    const base = randInt(10, 40)
    const more1 = randInt(5, 25)
    const more2 = randInt(5, 25)
    answer = base + more1 + more2
    question = `篮球有 ${base} 个，排球比篮球多 ${more1} 个，足球比排球多 ${more2} 个，足球有多少个？`
    pool.push(answer - more2, answer - more1, answer + 10, answer - 10)
  } else if (t === 3) {
    const base = randInt(15, 50)
    const times = randInt(2, 4)
    const less = randInt(5, 30)
    answer = base * times - less
    question = `三年级展出 ${base} 幅作品，四年级是三年级的 ${times} 倍，五年级比四年级少 ${less} 幅，五年级展出多少幅？`
    pool.push(base * times, answer + less, answer + 5, answer - 5)
  } else {
    const per = randInt(2, 5)
    const rows = randInt(3, 8)
    const rows2 = randInt(2, 6)
    const total = per * rows
    const perNew = per + rows2
    answer = Math.floor(total / perNew)
    question = `${total} 人表演武术操，原来每行 ${per} 人，后来每行多排 ${rows2} 人，一共排多少行？`
    pool.push(answer + 1, answer - 1, Math.ceil(total / perNew), perNew)
  }
  return {
    question,
    hint: '从问题想起：先算需要的中间量，再算最终结果',
    answer,
    options: [...new Set(pool)].slice(0, 4),
  }
}

const game = useQuizGame(makeRound)
</script>

<template>
  <div class="game">
    <div v-if="game.finished.value" class="finish">
      <p class="finish-title">🧮 应用题高手！</p>
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
  max-width: 39rem;
}
.expr {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  line-height: 1.6;
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
