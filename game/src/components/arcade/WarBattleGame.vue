<template>
  <div class="warbattle-game">
    <div class="game-top">
      <span>你 <strong>{{ score.player }}</strong> : <strong>{{ score.cpu }}</strong> 电脑</span>
      <span>第 {{ round }}/5 轮</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">{{ resultTitle }}</p>
      <p class="finish-sub">最终比分 {{ score.player }} : {{ score.cpu }}</p>
      <UButton color="primary" size="lg" @click="restart">再来一局</UButton>
    </div>

    <template v-else>
      <div class="battle-table">
        <div class="battle-side">
          <p class="side-label">你的牌</p>
          <div class="cards">
            <span v-for="(c, i) in rd.player" :key="i" class="bcard" :data-side="'player'" :data-card="c">{{ c }}</span>
          </div>
          <p class="side-sum">和：{{ rd.playerSum }}</p>
        </div>
        <div class="battle-divider">⚔️</div>
        <div class="battle-side">
          <p class="side-label">电脑的牌</p>
          <div class="cards">
            <span v-for="(c, i) in rd.cpu" :key="i" class="bcard back" :class="{ open: revealed }" :data-side="'cpu'" :data-card="c">
              {{ revealed ? c : '?' }}
            </span>
          </div>
          <p class="side-sum" v-if="revealed">和：{{ rd.cpuSum }}</p>
          <p v-else class="side-sum">&nbsp;</p>
        </div>
      </div>

      <template v-if="!revealed">
        <UButton color="primary" size="lg" @click="reveal">翻开电脑的牌</UButton>
      </template>
      <template v-else>
        <p class="round-result" :class="roundWin === 'player' ? 'win' : roundWin === 'cpu' ? 'lose' : 'tie'">
          {{ roundResultText }}
        </p>
        <UButton color="primary" size="lg" @click="nextRound">下一轮</UButton>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { dealRound, roundWinner, type BattleRound, type BattleWinner } from '@/lib/arcade/warbattle'
import { playCorrect, playWin, playWrong, playClick } from '@/lib/sound'

const ROUNDS = 5
const rd = ref<BattleRound>(dealRound())
const revealed = ref(false)
const round = ref(1)
const score = ref<{ player: number; cpu: number }>({ player: 0, cpu: 0 })
const ties = ref(0)
const finished = ref(false)

const roundWin = computed<BattleWinner>(() => roundWinner(rd.value))

const roundResultText = computed(() => {
  const w = roundWin.value
  if (w === 'player') return '🎉 这轮你赢啦！'
  if (w === 'cpu') return '😅 这轮电脑赢了'
  return '🤝 打平！'
})

const resultTitle = computed(() => {
  if (score.value.player > score.value.cpu) return '🏆 你赢了比赛！'
  if (score.value.cpu > score.value.player) return '💻 电脑赢了'
  return '🤝 平局！'
})

function reveal() {
  if (revealed.value) return
  revealed.value = true
  const w = roundWin.value
  if (w === 'player') {
    score.value = { ...score.value, player: score.value.player + 1 }
    playWin()
  } else if (w === 'cpu') {
    score.value = { ...score.value, cpu: score.value.cpu + 1 }
    playWrong()
  } else {
    ties.value += 1
    playClick()
  }
}

function nextRound() {
  if (round.value >= ROUNDS) {
    finished.value = true
    return
  }
  round.value += 1
  rd.value = dealRound()
  revealed.value = false
}

function restart() {
  rd.value = dealRound()
  revealed.value = false
  round.value = 1
  score.value = { player: 0, cpu: 0 }
  ties.value = 0
  finished.value = false
}
</script>

<style scoped>
.warbattle-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.game-top {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  font-size: 1.15rem;
  color: var(--ui-text-muted);
  flex-wrap: wrap;
  justify-content: center;
}
.game-top strong {
  color: var(--ui-primary);
  font-size: 1.4rem;
  margin: 0 0.2rem;
}
.battle-table {
  display: flex;
  gap: 1.6rem;
  align-items: flex-start;
  justify-content: center;
}
.battle-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 9rem;
}
.side-label {
  color: var(--ui-text-muted);
  font-size: 1rem;
}
.cards {
  display: flex;
  gap: 0.7rem;
}
.bcard {
  width: 4rem;
  height: 5.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  border-radius: var(--ui-radius-lg);
  border: 2px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  box-shadow: var(--ui-shadow);
}
.bcard.back {
  background: var(--ui-primary);
  color: var(--ui-bg-inverted);
  border-color: var(--ui-primary);
}
.bcard.back.open {
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  border-color: var(--ui-border-accented);
}
.side-sum {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
  min-height: 1.4rem;
}
.battle-divider {
  font-size: 2rem;
  align-self: center;
}
.round-result {
  font-size: 1.3rem;
  font-weight: bold;
}
.round-result.win {
  color: var(--ui-color-success-500);
}
.round-result.lose {
  color: var(--ui-color-error-500);
}
.round-result.tie {
  color: var(--ui-text-muted);
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