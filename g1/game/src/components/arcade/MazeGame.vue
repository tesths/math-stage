<template>
  <div class="maze-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ levelIndex + 1 }}/3 关</span>
      <p class="maze-tip">只能走到比现在大 1 的格子</p>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🎉 迷宫出口找到啦！</p>
      <p class="finish-sub">走错 {{ totalWrong }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="maze-board" :style="{ gridTemplateColumns: `repeat(${level.width}, 1fr)` }">
        <div
          v-for="(v, i) in level.grid"
          :key="i"
          class="maze-cell"
          :class="{ here: cur === i, goal: i === level.goal, path: visited.has(i) }"
          :data-index="i"
          @click="step(i)"
        >
          <template v-if="v === null">·</template>
          <template v-else-if="cur === i">🐸</template>
          <template v-else>{{ v }}</template>
        </div>
      </div>
      <p class="maze-feedback" :class="{ err: wrong }">
        {{ feedbackText }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { MAZE_LEVELS, isValidStep, type MazeLevel } from '@/lib/arcade/maze'
import { playCorrect, playWrong } from '@/lib/sound'

const levelIndex = ref(0)
const level = ref<MazeLevel>(MAZE_LEVELS[0]!)
const cur = ref(level.value.start)
const visited = ref<Set<number>>(new Set([level.value.start]))
const wrong = ref(false)
const totalWrong = ref(0)
const finished = ref(false)

const feedbackText = computed(() =>
  cur.value === level.value.goal
    ? '到达出口！'
    : wrong.value
      ? '不能走到这里，要找比现在大 1 的格子'
      : '从入口出发，找比当前大 1 的格子',
)

function startLevel() {
  level.value = MAZE_LEVELS[levelIndex.value]!
  cur.value = level.value.start
  visited.value = new Set([level.value.start])
  wrong.value = false
}

function step(i: number) {
  if (finished.value) return
  if (i === cur.value) return
  if (isValidStep(cur.value, i, level.value)) {
    cur.value = i
    visited.value = new Set([...visited.value, i])
    wrong.value = false
    playCorrect()
    if (i === level.value.goal) {
      if (levelIndex.value >= 2) {
        finished.value = true
      } else {
        levelIndex.value += 1
        startLevel()
      }
    }
  } else {
    wrong.value = true
    totalWrong.value += 1
    playWrong()
  }
}

function restart() {
  levelIndex.value = 0
  totalWrong.value = 0
  finished.value = false
  startLevel()
}
</script>

<style scoped>
.maze-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.game-top {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center;
  font-size: 1.05rem;
  color: var(--ui-text-muted);
}
.maze-tip {
  color: var(--ui-text-toned);
}
.maze-board {
  display: grid;
  gap: 0.35rem;
  width: 100%;
  max-width: 22rem;
}
.maze-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 1.05rem;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}
.maze-cell:hover:not(:disabled) {
  background: var(--ui-bg-elevated);
  border-color: var(--ui-primary);
}
.maze-cell.path {
  background: var(--ui-color-primary-100);
  border-color: var(--ui-color-primary-300);
  color: var(--ui-color-primary-700);
}
.maze-cell.here {
  background: var(--ui-primary);
  border-color: var(--ui-primary);
  transform: scale(1.1);
  font-size: 1.5rem;
}
.maze-cell.goal {
  border-color: var(--ui-color-amber-400);
  background: var(--ui-color-amber-100);
}
.maze-feedback {
  min-height: 1.4rem;
  color: var(--ui-text-muted);
  font-size: 1.05rem;
}
.maze-feedback.err {
  color: var(--ui-color-error-500);
  font-weight: 600;
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