<template>
  <div class="sudoku-game">
    <div class="game-top">
      <span>第 {{ levelIndex + 1 }}/3 关</span>
      <span v-if="wrongCount" class="wrong-badge">填错 {{ wrongCount }} 次</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🔢 数独小高手！</p>
      <p class="finish-sub">3 关全部完成，填错 {{ wrongCount }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <p class="sudoku-tip">
        {{ selected === null ? '点一个空格，再选数字填进去' : `在空格里填入 ${selectedRow + 1} 行 ${selectedCol + 1} 列的数` }}
      </p>

      <div class="board" data-test="board">
        <button
          v-for="(v, i) in flatBoard"
          :key="i"
          class="cell"
          :class="{ fixed: fixedSet.has(i), chosen: selected === i, filled: v !== null }"
          :data-cell="i"
          @click="pickCell(i)"
        >{{ v ?? '' }}</button>
      </div>

      <template v-if="selected !== null">
        <div class="num-pad">
          <button
            v-for="n in cand"
            :key="n"
            class="num-btn"
            :data-num="n"
            @click="fill(n)"
          >{{ n }}</button>
        </div>
      </template>

      <div class="sudoku-actions">
        <UButton
          color="primary"
          size="lg"
          :disabled="!allFilled"
          @click="check"
        >检查</UButton>
        <UButton variant="ghost" color="neutral" @click="clearCell">清空格</UButton>
      </div>
      <FeedbackOverlay :state="feedback" :correct-answer="''" answer-text="做对啦！" />
      <UButton v-if="passed && !finished" color="primary" size="lg" @click="nextLevel">下一关</UButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { candidates, checkSolved, generateBoard, type SudokuGrid } from '@/lib/arcade/sudoku'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong } from '@/lib/sound'

const HOLES = [4, 5, 6]
const levelIndex = ref(0)
const board = ref<SudokuGrid>([])
const solution = ref<SudokuGrid>([])
const fixedSet = ref<Set<number>>(new Set())
const selected = ref<number | null>(null)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const passed = ref(false)
const wrongCount = ref(0)
const finished = ref(false)

const flatBoard = computed(() => board.value.flat())
const selectedRow = computed(() => (selected.value === null ? -1 : Math.floor(selected.value / 4)))
const selectedCol = computed(() => (selected.value === null ? -1 : selected.value % 4))
const cand = computed(() =>
  selected.value === null ? [] : candidates(board.value, selectedRow.value, selectedCol.value),
)
const allFilled = computed(() => flatBoard.value.every((v) => v !== null))

function startLevel() {
  const { board: b, solution: s } = generateBoard(HOLES[levelIndex.value])
  board.value = b
  solution.value = s
  fixedSet.value = new Set(b.flat().map((v, i) => (v !== null ? i : -1)).filter((i) => i >= 0))
  selected.value = null
  feedback.value = 'idle'
  passed.value = false
}

startLevel()

function pickCell(i: number) {
  if (passed.value || finished.value || fixedSet.value.has(i)) return
  selected.value = selected.value === i ? null : i
}

function fill(n: number) {
  if (selected.value === null || passed.value || finished.value) return
  const r = selectedRow.value
  const c = selectedCol.value
  board.value = board.value.map((row, ri) =>
    ri === r ? row.map((v, ci) => (ci === c ? n : v)) : row,
  )
}

function clearCell() {
  if (selected.value === null || passed.value || finished.value) return
  const r = selectedRow.value
  const c = selectedCol.value
  board.value = board.value.map((row, ri) => (ri === r ? row.map((v, ci) => (ci === c ? null : v)) : row))
}

function check() {
  if (finished.value || passed.value) return
  if (!allFilled.value) return
  if (checkSolved(board.value, solution.value)) {
    passed.value = true
    feedback.value = 'correct'
    playCorrect()
  } else {
    wrongCount.value += 1
    feedback.value = 'wrong'
    playWrong()
  }
}

function nextLevel() {
  if (levelIndex.value >= 2) {
    finished.value = true
    return
  }
  levelIndex.value += 1
  startLevel()
}

function restart() {
  levelIndex.value = 0
  wrongCount.value = 0
  finished.value = false
  startLevel()
}
</script>

<style scoped>
.sudoku-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.game-top {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  font-size: 1.05rem;
  color: var(--ui-text-muted);
}
.wrong-badge {
  color: var(--ui-color-error-500);
}
.sudoku-tip {
  color: var(--ui-text-toned);
  font-size: 1.05rem;
  min-height: 1.4rem;
}
.board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  max-width: 17rem;
  width: 100%;
  background: var(--ui-color-stone-300);
  border-radius: 0.7rem;
  padding: 0.4rem;
}
.cell {
  aspect-ratio: 1;
  border-radius: 0.4rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  font-size: 1.7rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
  cursor: pointer;
}
.cell.fixed {
  background: var(--ui-color-primary-100);
  color: var(--ui-color-primary-800);
}
.cell.chosen {
  border: 2px solid var(--ui-primary);
  transform: scale(1.08);
}
.num-pad {
  display: flex;
  gap: 0.7rem;
}
.num-btn {
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 9999px;
  border: 2px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.num-btn:hover {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: var(--ui-color-primary-100);
}
.sudoku-actions {
  display: flex;
  gap: 0.8rem;
  align-items: center;
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