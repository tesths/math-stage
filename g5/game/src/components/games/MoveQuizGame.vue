<script setup lang="ts">
/**
 * 训练游戏：平移旋转辨识（看图判断运动方式）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

type MoveKind = 'translate' | 'rotate'

interface Round {
  kind: MoveKind
  dir: 'right' | 'down' | 'left' | 'up'
  amount: number
  correct: string
  options: string[]
}

const DIR_WORDS: Record<MoveKind, Record<string, string>> = {
  translate: { right: '向右平移', down: '向下平移', left: '向左平移', up: '向上平移' },
  rotate: { right: '顺时针旋转', down: '顺时针旋转', left: '逆时针旋转', up: '逆时针旋转' },
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): Round {
  const kind: MoveKind = Math.random() < 0.6 ? 'translate' : 'rotate'
  if (kind === 'translate') {
    const dirs = ['right', 'down', 'left', 'up'] as const
    const dir = dirs[randInt(0, 3)]!
    const amount = randInt(2, 6)
    const correct = `${DIR_WORDS.translate[dir]}${amount} 格`
    const alt = dirs.filter((d) => d !== dir)
    const options = [
      correct,
      `${DIR_WORDS.translate[alt[0]!]}${amount} 格`,
      `${DIR_WORDS.translate[dir]}${Math.max(1, amount + (Math.random() < 0.5 ? 2 : -2))} 格`,
      `${DIR_WORDS.rotate[dir]}90°`,
    ]
    return { kind, dir, amount, correct, options: options.sort(() => Math.random() - 0.5) }
  }
  const cw = Math.random() < 0.5
  const angle = [90, 180, 270][randInt(0, 2)]!
  const dir = cw ? 'right' : 'left'
  const correct = `${DIR_WORDS.rotate[dir]}${angle}°`
  const options = [
    correct,
    `${DIR_WORDS.rotate[cw ? 'left' : 'right']}${angle}°`,
    `向右平移${angle} 格`,
    `向下平移${angle} 格`,
  ]
  return { kind, dir, amount: angle, correct, options: options.sort(() => Math.random() - 0.5) }
}

const roundNo = ref(1)
const rd = ref<Round>(makeRound())
const score = ref(0)
const done = ref(false)
const finished = ref(false)

const answer = computed(() => rd.value.correct)
const options = computed(() => rd.value.options)

/** 起始图形（三角形）与运动后图形 */
const START = 'M120,180 L180,180 L150,120 Z'
const MOVE = computed(() => {
  const r = rd.value
  if (r.kind === 'translate') {
    const dx = r.dir === 'right' ? r.amount * 20 : r.dir === 'left' ? -r.amount * 20 : 0
    const dy = r.dir === 'down' ? r.amount * 20 : r.dir === 'up' ? -r.amount * 20 : 0
    return `M${120 + dx},${180 + dy} L${180 + dx},${180 + dy} L${150 + dx},${120 + dy} Z`
  }
  const deg = r.dir === 'right' ? -r.amount : r.amount
  return `M120,180 L180,180 L150,120 Z` // 旋转用单独 <g> 处理
})
const ROTATE_DEG = computed(() => (rd.value.kind === 'rotate' ? (rd.value.dir === 'right' ? -rd.value.amount : rd.value.amount) : 0))

function onAnswered(correct: boolean) {
  done.value = true
  if (correct) {
    score.value++
    playCorrect()
  }
}
function next() {
  if (roundNo.value >= 5) {
    finished.value = true
    playWin()
    return
  }
  roundNo.value++
  rd.value = makeRound()
  done.value = false
}
function restart() {
  roundNo.value = 1
  score.value = 0
  done.value = false
  finished.value = false
  rd.value = makeRound()
}
</script>

<template>
  <div class="game">
    <div v-if="finished" class="finish">
      <p class="finish-title">🎯 运动辨识大师！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="move-stage">
        <svg viewBox="0 0 320 220" class="move-svg">
          <g class="grid-lines">
            <line v-for="i in 16" :key="'v' + i" :x1="(i - 1) * 20" :y1="0" :x2="(i - 1) * 20" :y2="220" />
            <line v-for="i in 11" :key="'h' + i" :x1="0" :y1="(i - 1) * 20" :x2="320" :y2="(i - 1) * 20" />
          </g>
          <path :d="START" class="shape-original" />
          <g
            v-if="rd.kind === 'rotate'"
            :style="{
              transform: `rotate(${ROTATE_DEG}deg)`,
              transformOrigin: '150px 150px',
              transition: 'transform 0.4s',
            }"
          >
            <path :d="START" class="shape-target" />
          </g>
          <path v-else :d="MOVE" class="shape-target" />
        </svg>
        <p class="ask">从图①到图②，图形是怎样运动的？</p>
      </div>

      <GameAnswerBar :options="options" :answer="answer" @answered="onAnswered" />
      <UButton v-if="done" color="primary" size="lg" @click="next">
        {{ roundNo >= 5 ? '查看成绩' : '下一题' }}
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
.move-stage {
  text-align: center;
}
.move-svg {
  max-width: 476px;
}
.grid-lines line {
  stroke: var(--ui-border);
  stroke-width: 1;
}
.shape-original {
  fill: color-mix(in srgb, var(--ui-primary) 55%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.shape-target {
  fill: color-mix(in srgb, var(--ui-primary) 25%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
  stroke-dasharray: 5 3;
}
.ask {
  margin-top: 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
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
